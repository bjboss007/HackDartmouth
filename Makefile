CC = g++
LDFLAGS = -c -ansi -pedantic -Werror -ansi -lz -lssl -lcrypto -std=c++0x -lboost_unit_test_framework
CCFLAGS = -ansi -pedantic -Werror -ansi -lz -std=c++0x -lboost_unit_test_framework 


all: clean main

main: main.o
	$(CC) main.o -o main -lz -lssl -lcrypto

main.o: main.cpp
	$(CC) $(LDFLAGS) main.cpp

clean:
	\rm -f *.o  *~ RingBuffer main.o main