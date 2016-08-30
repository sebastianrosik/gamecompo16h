#pragma once
#include <json/json.h>

#include "ws.h"

class Bullet {
 public:
  std::string id;   
  double x, y, lifetime;
};

class Game;

class Player {
 public:
  Player();

  std::mutex m;

  std::string id;
  std::string nick;
  double health;
  double points;
  bool killed;
  double x, y;

  std::vector<Bullet> bullets;

  Game *game;

  WebsocketConnection *ws;

  void UpdateState(Json::Value &j);

  static Player *GetBySessionID(const std::string& sess);
};

class Game {
 public:
  std::string id;

  std::mutex players_m;
  std::vector<Player *> players;

  unsigned long last_tick;
  
  void RemovePlayer(Player *p);

  static Game *GetByID(const std::string& id);
};

void GameHandleRecv(WebsocketConnection *ws, Json::Value &j);

void GameMaster();


