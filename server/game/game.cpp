#include <atomic>
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

#include "NetSock.h"
#include "ws.h"

#include "game.h"

class Bullet {
 public:
  double x, y, lifetime;
};

class Game;

class Player {
 public:
  Player() {
    game = nullptr;
  }

  std::string id;
  std::string nick;
  double health;
  double points;
  bool killed;
  double x, y;

  std::vector<Bullet> bullets;

  Game *game;

  static Player *GetBySessionID(const std::string& sess);
};

class Game {
 public:
  std::string id;
  std::vector<Player *> players;
};

std::unordered_map<std::string, std::unique_ptr<Game>> games;

std::mutex players_m;
std::unordered_map<std::string, std::unique_ptr<Player>> players;

Player *Player::GetBySessionID(const std::string& sess) {
  std::lock_guard<std::mutex> g(players_m);
  auto player_it = players.find(sess);
  if (player_it == players.end()) {
    Player *p = new Player;
    players.emplace(sess, std::unique_ptr<Player>(p));
    return p;
  }

  return player_it->second.get();
}

void GameHandleRecv(WebsocketConnection *ws, Json::Value &j) {
  Player *p = Player::GetBySessionID(ws->session_id);

  if (!j.isObject()) {
    return;
  }

  if (!j.isMember("type")) {
    return;
  }

  Json::Value v = j["type"];
  printf("type: %s\n", v.asCString());

}

