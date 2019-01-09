command_server: command_server.cpp send_zpad_command.c send_zpad_command.h
	g++ -c -o command_server.o command_server.cpp -lboost_system -lboost_thread -lpthread
	gcc -c -o send_zpad_command.o send_zpad_command.c
	g++ -o command_server command_server.o send_zpad_command.o -lboost_system -lboost_thread -lpthread
test_c_call: test_c_call.cpp send_zpad_command.h send_zpad_command.c
	gcc -c -o send_zpad_command.o send_zpad_command.c
	g++ -c -o test_c_call.o test_c_call.cpp
	g++ -o test_c_call test_c_call.o send_zpad_command.o
send_zpad_command_CLI: send_zpad_command_CLI.c
	gcc -o send_zpad_command_CLI send_zpad_command_CLI.c
volume_up: volume_up.c
	gcc -o volume_up volume_up.c
clean:
	rm command_server.o
	rm send_zpad_command.o
	rm test_c_call.o
