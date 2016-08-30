CPPFLAGS=-Wall -Wextra -std=c++11 

all:
	g++ ${CPPFLAGS} main.cpp NetSock.cpp -o server -Wl,--no-as-needed -lpthread -ggdb -lssl -lcrypto
       
#       -fsanitize=address

test: all
	./server

debug: all
	gdb -q ./server
