#include <atomic>
#include <cstdio>
#include <thread>
#include <list>
#include <unistd.h>
#include <endian.h>
#include <string.h>
#include <memory>
#include <mutex>
#include <string>
#include <vector>
#include <stdint.h>
#include <thread>
#include <json/json.h>

#include "NetSock.h"
#include "ws.h"

#include "game.h"

void GameHandleRecv(WebsocketConnection *ws, Json::Value &j) {
  if (!j.isObject()) {
    return;
  }

  if (!j.isObject()) {
    return;
  }

  Json::Value v = j["type"];
  printf("type: %s\n", v.asCString());
}

