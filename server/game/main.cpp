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
#include <signal.h>
#include <openssl/bio.h>
#include <openssl/evp.h>
#include <openssl/sha.h>
#include <json/json.h>

#include "NetSock.h"
#include "ws.h"
#include "game.h"

const char *WEBSOCKET_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

const int S_START = 0;  // Nothing read yet. Read 2 bytes of frame header.
const int S_READ_EXT_LEN_16 = 1;  // Read 2 more bytes of length.
const int S_READ_EXT_LEN_64 = 2;  // Read 8 more bytes of length.
const int S_LEN_READY = 3;  // We've received all length. Figure out what next.
const int S_READ_MASK = 4;  // Read 4 bytes of mask.
const int S_MASK_READY = 5; // We've either read or skipped mask. What next?
const int S_READ_PAYLOAD = 6;  // Read payload and unmask it.
const int S_PACKET_READY = 7;  // Complete packet is ready for looking at.

const int MS_NO_DATA = 0; // Waiting for new frame.
const int MS_DATA_STARTED = 1; // Has some data, waiting for new frames.

const int SEND_DATA = 1;
const int SEND_PONG = 0xa;
const int SEND_PING = 0x9;

void WebsocketConnection::send(int type, const void *data, size_t size) {
  uint8_t header[2] = {
    (uint8_t)((1 << 7) | type),
    (uint8_t)(size > 0xffff ? 127 :
                size >= 126 ? 126 :
                  size)
  };

  std::string packet;
  packet.append((const char*)header, 2);

  if (header[1] == 127) {
    uint64_t len_8 = htobe64(size);
    packet.append((const char*)&len_8, 8);
  } else if (header[1] == 126) {
    uint16_t len_2 = htobe16(size);
    packet.append((const char*)&len_2, 2);    
  }

  packet.append((const char*)data, size);

  send_queue_m.lock();
  send_queue.push_back(packet);
  send_queue_m.unlock();
}

WebsocketConnection::WebsocketConnection(
    NetSock *s, const std::string& session_id) {
  this->s = s;
  this->end = false;
  this->session_id = session_id;
  this->p = nullptr;
}

void WebsocketConnection::handle() {
  std::thread sender(&WebsocketConnection::handle_send, this);
  
  send(SEND_DATA, "{\"type\":\"hello\"}", 16);

  handle_recv();
  printf("%s:%u: receiver terminated\n",
         s->GetStrIP(), s->GetPort());

  if (this->p) {
    if (this->p->ws == this)
      this->p->ws = nullptr;
  }
  sleep(1);

  this->end = true;
  sender.join();

  printf("%s:%u: sender terminated\n",
         s->GetStrIP(), s->GetPort());
}

void WebsocketConnection::handle_send() {
  while (!this->end.load()) {
    send_queue_m.lock();
    if (send_queue.empty()) {
      send_queue_m.unlock();
      //std::this_thread::yield();
      usleep(10000);
      continue;
    }

    std::string packet = send_queue.front();
    send_queue.pop_front();
    send_queue_m.unlock();

    /*printf("Sending packet: \n");
    fwrite(packet.data(), packet.size(), 1, stdout);
    fflush(stdout);*/
    if (s->WriteAll(packet.data(), packet.size()) == 0) {
      s->Disconnect();
      printf("%s:%u: failed while sending\n",
         s->GetStrIP(), s->GetPort());   
      this->end = true;
      return;
    }
  }
}

void WebsocketConnection::handle_recv() {
  std::vector<uint8_t> data;
  std::vector<uint8_t> mask;  
  std::vector<uint8_t> payload;
  int state = S_START;
  unsigned state_needs = 2;
  int fin_bit;
  int opcode;
  int mask_bit;
  unsigned long long payload_len;
  std::vector<uint8_t> ms_data;
  bool data_ready = false;
  int ms_state = MS_NO_DATA;
  
  while (!this->end.load()) {
    /*printf("%u %u\n", data.size(), state_needs);
    for(size_t i = 0; i < data.size(); i++) {
      printf("%.2x ", data[i]);
    }
    //fwrite(&data[0], 1, data.size(), stdout);
    puts("");
    fflush(stdout);*/
    if (data.size() < state_needs) {
      uint8_t buf[4096];
      int ret = s->Read(buf, sizeof(buf));
      if (ret == 0) {
        s->Disconnect();
        printf("%s:%u: disconnected\n",
             s->GetStrIP(), s->GetPort());
        return;
      }

      size_t idx = data.size();
      printf("%ull %ull %ull\n", data.size(), ret, data.size() + ret);
      fflush(stdout);
      data.resize(data.size() + ret);
      memcpy(&data[0] + idx, buf, ret);
      continue;
    }

    // Grab state data.
    std::vector<uint8_t> state_data;
    state_data.resize(state_needs);
    memcpy(&state_data[0], &data[0], state_needs);

    // Slow.
    memmove(&data[0], &data[state_needs], data.size() - state_needs);
    data.resize(data.size() - state_needs);

    //printf("state: %i\n", state);

    switch (state) {
      case S_START:
      {
        fin_bit = state_data[0] >> 7;
        opcode = state_data[0] & 0xf;
        mask_bit = state_data[1] >> 7;
        int payload_len_7 = state_data[1] & 0x7f;

        if (payload_len_7 == 126) {
          state = S_READ_EXT_LEN_16;
          state_needs = 2;
          continue;
        }

        if (payload_len_7 == 127) {
          state = S_READ_EXT_LEN_64;
          state_needs = 8;
          continue;
        }

        payload_len = payload_len_7;
        state = S_LEN_READY;
        state_needs = 0;
      }
      continue;


      case S_READ_EXT_LEN_16:
        payload_len = be16toh(*(uint16_t*)(&state_data[0]));
        state = S_LEN_READY;
        state_needs = 0;
        break;

      case S_READ_EXT_LEN_64:
        payload_len = be64toh(*(uint64_t*)(&state_data[0]));
        state = S_LEN_READY;
        state_needs = 0;
        break;

      case S_LEN_READY:
        if (payload_len > 16 * 1024 * 1024) {
          printf("%s:%u: nope nope nope (1)\n",
             s->GetStrIP(), s->GetPort());
          return;
        }

        if (mask_bit == 1) {
          state = S_READ_MASK;
          state_needs = 4;
          continue;
        }

        state = S_MASK_READY;
        state_needs = 0;
        continue;

      case S_READ_MASK:
        mask = state_data;
        state = S_MASK_READY;
        state_needs = 0;
        break;

      case S_MASK_READY:
        // Is there any payload to read?
        if (payload_len != 0) {
          state = S_READ_PAYLOAD;
          state_needs = payload_len;
          continue;
        }

        // Done.
        state = S_PACKET_READY;
        state_needs = 0;
        continue;

      case S_READ_PAYLOAD:
        if (mask_bit == 1) {
          for (unsigned i = 0; i < state_data.size(); i++) {
            state_data[i] ^= mask[i % mask.size()];
          }
        }
        payload = state_data;

        state = S_PACKET_READY;
        state_needs = 0;
        break;


      case S_PACKET_READY:
      {
        data_ready = false;

        if (opcode == 0x9 /*PING*/) {
          printf("%s:%u: received PING\n", s->GetStrIP(), s->GetPort());
          send(SEND_PONG, &state_data[0], state_data.size());
        } else if (opcode == 0xA /*PONG*/) {
          printf("%s:%u: received PONG\n", s->GetStrIP(), s->GetPort());
          // Ignore.
        } else if (opcode == 0) {
          if (ms_state != MS_DATA_STARTED) {
            printf("%s:%u: invalid major state (1)\n",
                   s->GetStrIP(), s->GetPort());
            return;
          }

          if (payload_len + ms_data.size() > 16 * 1024 * 1024) {
            printf("%s:%u: nope nope nope (2)\n",
              s->GetStrIP(), s->GetPort());
            return;
          }

          size_t idx = ms_data.size();
          ms_data.resize(ms_data.size() + payload.size());
          memcpy(&ms_data[idx], &payload[0], payload.size()); 

          if (fin_bit == 1) {
            data_ready = true;
            ms_state = MS_NO_DATA;
          } else {
            // state stays the same
          }

        } else if (opcode == 1 || opcode == 2) {
          if (ms_state == MS_DATA_STARTED) {
            printf("%s:%u: invalid major state (2)\n",
                   s->GetStrIP(), s->GetPort());
            return;
          }

          ms_data = payload;

          if (fin_bit != 1) {
            ms_state = MS_DATA_STARTED;
          } else {
            data_ready = true;
            // state stays the same
          }

        } else if (opcode == 8) {
          printf("%s:%u: graceful disconnect\n", s->GetStrIP(), s->GetPort());
          return;
        } else {
          printf("%s:%u: unknown opcode %.2x\n", s->GetStrIP(), s->GetPort(),
                 opcode);
          //return;
        }

        if (data_ready) {
          Json::Value root;
          Json::Reader r;
          bool jret = r.parse(
              std::string((const char*)&ms_data[0], ms_data.size()),
              root, false);

          // TODO
          /*printf("%s:%u: received data!\n", s->GetStrIP(), s->GetPort());
          fwrite(&ms_data[0], 1, ms_data.size(), stdout);
          fflush(stdout);*/

          if (!jret) {
            printf("%s:%u: failed to parse JSON\n",
                   s->GetStrIP(), s->GetPort());
            return;
          }

          GameHandleRecv(this, root);
        }

        state = S_START;
        state_needs = 2;
        continue;
      }
      break;
    }
  }  
}

#define BUFSIZE 4096
void handle_new_connection(NetSock *_s) {
  std::unique_ptr<NetSock> s(_s);
  char buf[BUFSIZE + 1] = {0};
  printf("%s:%u: new connection\n",
         s->GetStrIP(), s->GetPort());

  // Get HTTP header.
  int idx = 0;
  for(;;) {
    int ret = s->Read(buf + idx, BUFSIZE - idx);
    if (ret == 0) {
      s->Disconnect();      
      printf("%s:%u: disconnected\n",
             s->GetStrIP(), s->GetPort());
      return;
    }

    idx += ret;
    /*fwrite(buf, 1, idx, stdout);
    puts("");
    fflush(stdout);*/
    if (memmem(buf, idx, "\r\n\r\n", 4) != NULL) {
      break;
    }

    if (idx == BUFSIZE) {
      printf("%s:%u: CRLF CRLF not found in first 4KB\n",
             s->GetStrIP(), s->GetPort());
      return;
    }
  }

  //puts(buf);  

  printf("%s:%u: HTTP packet header received\n",
         s->GetStrIP(), s->GetPort());

  // Sec-WebSocket-Key
  char *key = strstr(buf, "Sec-WebSocket-Key:");
  if (key == NULL) {
    printf("%s:%u: WebSocket key not found\n",
           s->GetStrIP(), s->GetPort());
    return;
  }

  key += sizeof("Sec-WebSocket-Key:") - 1;
  while(*key == ' ') key++;

  char *tmp = key;
  while(*tmp != '\n' && *tmp != '\r') tmp++;

  std::string k(key, tmp - key);

  // Sec-WebSocket-Protocol
  char *proto_ = strstr(buf, "Sec-WebSocket-Protocol:");
  if (proto_ == NULL) {
    printf("%s:%u: WebSocket protocol not found\n",
           s->GetStrIP(), s->GetPort());
    return;
  }

  proto_ += sizeof("Sec-WebSocket-protocol:") - 1;
  while(*proto_ == ' ') proto_++;

  tmp = proto_;
  while(*tmp != '\n' && *tmp != '\r') tmp++;

  std::string proto(proto_, tmp - proto_);

  // Calc reply.
  k += WEBSOCKET_GUID;
  unsigned char accept_k[20] = {0};
  SHA1((unsigned char*)k.c_str(), k.size(), accept_k);

  // https://www.openssl.org/docs/manmaster/crypto/BIO_f_base64.html
  // http://stackoverflow.com/questions/5288076/doing-base64-encoding-and-decoding-in-openssl-c
  BIO *b64 = BIO_new(BIO_f_base64());
  BIO *mem = BIO_new(BIO_s_mem());

  BIO_push(b64, mem);
  BIO_set_flags(b64, BIO_FLAGS_BASE64_NO_NL);  
  BIO_write(b64, accept_k, 20);
  (void)BIO_flush(b64);

  char *dt = NULL;
  long len = BIO_get_mem_data(mem, &dt);


  /*puts(key);
  printf("dt: %s len: %i\n", dt, (int)len);
  fwrite(dt, 1, len, stdout);
  fflush(stdout);*/

  char response[4096];
  char accept_key_b64[32] = {0};
  memcpy(accept_key_b64, dt, len);
  BIO_free_all(b64);

  sprintf(response,
      "HTTP/1.1 101 Switching Protocols\r\n"
      "Upgrade: websocket\r\n"
      "Connection: Upgrade\r\n"
      "Sec-WebSocket-Accept: %s\r\n"
      "Sec-WebSocket-Protocol: %s\r\n"
      "Sec-WebSocket-Version: 13\r\n"
      "\r\n", accept_key_b64, proto.c_str());

  if (s->WriteAll(response, strlen(response)) == 0) {
    s->Disconnect();
    printf("%s:%u: failed while sending success info\n",
        s->GetStrIP(), s->GetPort());
    return;
  }
  //puts(response);

  // Is a websocket.
  printf("%s:%u: switched to websocket\n",
         s->GetStrIP(), s->GetPort());

  WebsocketConnection ws(s.get(), proto);
  ws.handle();
}

int main(void) {
  signal(SIGPIPE, SIG_IGN);

  std::thread gm(GameMaster);

  NetSock server;
  server.ListenAll(8086); // ;f

  std::list<std::thread*> threads;

  for(;;) {
    NetSock *s = server.Accept();
    if (s == NULL) {
      perror("warning: received a null connection?!?!?: ");
      continue;
    }
    threads.push_back(new std::thread(handle_new_connection, s));
  }

  // Od czegos trzeba zaczac ;f
  puts("Server!");


  return 0;
}

