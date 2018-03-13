#ifndef HEADER_ELANCONTROL
#define HEADER_ELANCONTROL

#ifdef __cplusplus
extern "C"{
#endif

void setup_io();
int send_command(int code,int channel);

#ifdef __cplusplus
}
#endif

#endif
