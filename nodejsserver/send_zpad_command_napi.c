#include <node_api.h>
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>
#include <time.h>
 // RasberryPi HW specific addresses
#define BCM2708_PERI_BASE	0x3F000000
#define GPIO_BASE			(BCM2708_PERI_BASE + 0x200000) /* GPIO controller */
#define PAGE_SIZE			(4*1024)
#define BLOCK_SIZE			(4*1024)
// GPIO setup macros. Always use INP_GPIO(x) before using OUT_GPIO(x) or SET_GPIO_ALT(x,y)
#define						INP_GPIO(g) *(gpio+((g)/10)) &= ~(7<<(((g)%10)*3))
#define						OUT_GPIO(g) *(gpio+((g)/10)) |=  (1<<(((g)%10)*3))
 // GPIO Macros
#define						GPIO_SET *(gpio+7)  // sets   bits which are 1 ignores bits which are 0
#define						GPIO_CLR *(gpio+10) // clears bits which are 1 ignores bits which are 0
 // Bit Banging Time Macros (Might be platform / optimization specific)
 // Signal high period with for loop spin cycle
#define HIGH_PERIOD			906
// Two differend low periods, as timespec
#define SHORT_PERIOD		(const struct timespec[]){{0,5000000L}}
#define LONG_PERIOD			(const struct timespec[]){{0,7000000L}}

int  mem_fd;
void *gpio_map;
volatile unsigned *gpio;
int ready = 0;

napi_value send_zpad_command_napi(napi_env env, napi_callback_info info) {
	napi_status status;
	size_t argc = 2;
	int channel = -1;
	int command = -1;
	int return_code = 0;
	int rep;
	int g;
	napi_value my_return_code;
	napi_value argv[2];

	status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Failed to parse arguments");
	}
	status = napi_get_value_int32(env, argv[0], &channel);
	if (status != napi_ok || channel < 6 || channel > 11) {
		napi_throw_error(env, NULL, "Invalid channel was passed as argument");
	}
	status = napi_get_value_int32(env, argv[1], &command);
	if (status != napi_ok || command < 0 || command > 63) {
		napi_throw_error(env, NULL, "Invalid command was passed as argument");
	}
	if (!ready) {
		/* open /dev/mem */
		if ((mem_fd = open("/dev/mem", O_RDWR|O_SYNC) ) < 0) {
			printf("can't open /dev/mem \n");
			exit(-1);
		}
		/* mmap GPIO */
		gpio_map = mmap(
			NULL,             //Any adddress in our space will do
			BLOCK_SIZE,       //Map length
			PROT_READ|PROT_WRITE,// Enable reading & writting to mapped memory
			MAP_SHARED,       //Shared with other processes
			mem_fd,           //File to map
			GPIO_BASE         //Offset to GPIO peripheral
		);
		close(mem_fd); //No need to keep mem_fd open after mmap
		if (gpio_map == MAP_FAILED) {
			printf("mmap error %d\n", (int)gpio_map);//errno also set!
			exit(-1);
		}
		// Always use volatile pointer!
		gpio = (volatile unsigned *)gpio_map;
		for (g=6; g<=11; g++) {
			INP_GPIO(g); // must use INP_GPIO before we can use OUT_GPIO
			OUT_GPIO(g);
		}
		ready = 1; //Only setup once
	}
	// Do The bit banging
	for (rep=0; rep<5; rep++) {
		GPIO_SET = 1<<channel;
		g=0;
		while (g<HIGH_PERIOD) {
			g++;
		}
		GPIO_CLR = 1<<channel;
		nanosleep(SHORT_PERIOD, NULL);
	}
	for (rep=0; rep<6; rep++) {
		GPIO_SET = 1<<channel;
		g=0;
		while (g<HIGH_PERIOD) {
			g++;
		}
		GPIO_CLR = 1<<channel;
		if (command & 1<<(5-rep)) {
			nanosleep(LONG_PERIOD, NULL);
		}
		else {
			nanosleep(SHORT_PERIOD, NULL);
		}
	}
	GPIO_SET = 1<<channel;
	g=0;
	while (g<HIGH_PERIOD) {
		g++;
	}
	GPIO_CLR = 1<<channel;
	status = napi_create_int32(env, return_code, &my_return_code);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to create return value");
	}
	return my_return_code;
}

napi_value Init(napi_env env, napi_value exports) {
	napi_status status;
	napi_value fn;
	status = napi_create_function(env, NULL, 0, send_zpad_command_napi, NULL, &fn);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to wrap native function");
	}
	status = napi_set_named_property(env, exports, "send_zpad_command_napi", fn);
	if (status != napi_ok) {
		napi_throw_error(env, NULL, "Unable to populate exports");
	}
	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
