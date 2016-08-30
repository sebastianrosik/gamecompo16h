#include <atomic>
#include <algorithm>
#include <cstdio>
#include <thread>
#include <list>
#include <unistd.h>
#include <endian.h>
#include <string.h>
#include <memory>
#include <mutex>
#include <unordered_map>
#include <string>
#include <vector>
#include <stdint.h>
#include <thread>
#include <json/json.h>
#include <json/writer.h>
#include <time.h>

#include "NetSock.h"
#include "ws.h"

#include "game.h"

Player::Player() {
  game = nullptr;
  health = 0.0;
  points = 0.0;
  killed = false;
  x = y = 0.0;
  ws = nullptr;
}

std::mutex games_m;
std::unordered_map<std::string, std::unique_ptr<Game>> games;

std::mutex players_m;
std::unordered_map<std::string, std::unique_ptr<Player>> players;

static void PrintJson(Json::Value &v) {
  Json::StyledWriter sw;
  puts(sw.write(v).c_str());
  fflush(stdout);
}

void Game::RemovePlayer(Player *p) {
  std::lock_guard<std::mutex> g(this->players_m);
  auto it = std::find(this->players.begin(), this->players.end(), p);
  if (it == this->players.end()) {
    return;
  }

  this->players.erase(it);
}

Game *Game::GetByID(const std::string& id) {
  std::lock_guard<std::mutex> g(games_m);
  auto game_it = games.find(id);

  if (game_it == games.end()) {
    Game *gm = new Game;
    gm->id = id;
    gm->last_tick = clock();
    games.emplace(id, std::unique_ptr<Game>(gm));
    return gm;
  }

  return game_it->second.get();
}

Player *Player::GetBySessionID(const std::string& sess) {
  std::lock_guard<std::mutex> g(players_m);
  auto player_it = players.find(sess);
  if (player_it == players.end()) {
    Player *p = new Player;
    p->id = sess;
    players.emplace(sess, std::unique_ptr<Player>(p));
    return p;
  }

  return player_it->second.get();
}

void Player::UpdateState(Json::Value &j) {
  std::lock_guard<std::mutex> g(this->m);
  Json::Value &p = j["player"];
  this->health = p["health"].asDouble();
  this->points = p["points"].asDouble();
  this->x = p["x"].asDouble();
  this->y = p["y"].asDouble();
  this->killed = p["killed"].asBool();

  this->bullets.resize(0);

  for (Json::Value& b : j["bullets"]) {
    Bullet nb;
    nb.x = b[0].asDouble();
    nb.y = b[1].asDouble();
    nb.lifetime = b[2].asDouble();
    this->bullets.push_back(nb);
  }
}

void GameHandleRecv(WebsocketConnection *ws, Json::Value &j) {
  Player *p = Player::GetBySessionID(ws->session_id);
  p->ws = ws; // is ws alive at all?

  if (!j.isObject()) {
    printf("%s:%u: expected object in JSON root\n",
         ws->s->GetStrIP(), ws->s->GetPort());
    return;
  }

  if (!j.isMember("type")) {
     printf("%s:%u: type missing\n",
            ws->s->GetStrIP(), ws->s->GetPort());
    return;
  }

  Json::Value v = j["type"];

  if (!v.isString()) {
     printf("%s:%u: type is not string\n",
            ws->s->GetStrIP(), ws->s->GetPort());
    return;
  }

  if (v.asString() == "hello") {
    printf("%s:%u: says Hello! :)\n",
            ws->s->GetStrIP(), ws->s->GetPort());
    return;
  }

  if (v.asString() == "ready") {
    if (j["nick"].asString().size() > 32) {
      return;
    }

    std::string gid = j["game"].asString();
    if (gid.size() > 12) {
      return;
    }

    p->nick = j["nick"].asString();    

    Game *g = Game::GetByID(gid);

    if (p->game != nullptr && p->game != g) {
      printf("%s:%u: player %s removed from game %s\n",
            ws->s->GetStrIP(), ws->s->GetPort(),
            p->id.c_str(), p->game->id.c_str());
      p->game->RemovePlayer(p);
      p->game = nullptr;
    }

    if (p->game == nullptr) {
      p->game = g;
      g->players_m.lock();
      g->players.push_back(p);
      g->players_m.unlock();        
      printf("%s:%u: player %s added to game %s\n",
            ws->s->GetStrIP(), ws->s->GetPort(),
        p->id.c_str(), p->game->id.c_str());
    }

    return;
  }  

  if (v.asString() == "state") {
    //PrintJson(j);
    p->UpdateState(j);
    return;
  }

  printf("%s:%u: unknown type: %s\n",
            ws->s->GetStrIP(), ws->s->GetPort(), v.asCString());
}

void GameMaster() {
  puts("Game Master is up");

  for (;;) {
    bool game_updated = false;
    
    games_m.lock();
    unsigned long t = clock();    
    for (auto& g : games) {
      if (t - g.second->last_tick < 1000000 / 16) {
        continue;
      }

      Game *gg = g.second.get();

      std::string s = 
        "{ "
        "  \"type\": \"state\","
        "  \"state\": {"
        "    \"players\": [ ";

      std::string bullets;      
      gg->players_m.lock();
      int i = 0;
      for (Player* p : gg->players) {
        if (i++ != 0) {
          s += ", ";
        }

        p->m.lock();

        static char buf[4096 + 1];
        snprintf(buf, 4096, 
            "[ \"%s\", { "
            "  \"nick\": \"%s\", "
            "  \"health\": %f, "
            "  \"points\": %f, "
            "  \"killed\": %s, "
            "  \"x\": %f, "
            "  \"y\": %f } ] ",
            p->id.c_str(), p->nick.c_str(), p->health, p->points,
            p->killed ? "true" : "false", p->x, p->y);
        s += buf;

        for (const Bullet& bb : p->bullets) {
          if (!bullets.empty()) {
            bullets += ", ";
          }

          snprintf(buf, 4096, "[ %f, %f, %f, \"%s\" ]",
              bb.x, bb.y, bb.lifetime, p->id.c_str());
          bullets += buf;
        }
        p->m.unlock();
      }

      s += "], \"bullets\": [" + bullets + "] } }";
      
      for (Player* p : gg->players) {
        if (p->ws != nullptr) {
          p->ws->send(1, s.data(), s.size());
        }
      }

      gg->players_m.unlock();

      t = clock();
      g.second->last_tick = t;
    }
    games_m.unlock();    

    if (!game_updated) {
      usleep(1);
    }


    __asm(".byte 0x90"); // TURBO HACKER ASSEMBLER!11 
  }
}

