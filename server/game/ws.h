#pragma once
#include <mutex>
#include <list>
#include <atomic>
#include "NetSock.h"

class WebsocketConnection {
 public:
  WebsocketConnection(NetSock *s);
  void handle();  // blocking

  void send(int type, const void *data, size_t size);

 private:
  void handle_recv();
  void handle_send(); 

  std::mutex send_queue_m;
  std::list<std::string> send_queue;

  std::atomic_bool end;
  NetSock *s;
};

