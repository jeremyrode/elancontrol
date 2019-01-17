#include <node_api.h>
#include <stdio.h>
 
#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>
#include <time.h>
 
#define BCM2708_PERI_BASE        0x3F000000
#define GPIO_BASE                (BCM2708_PERI_BASE + 0x200000) /* GPIO controller */ 
 
#define PAGE_SIZE (4*1024)
#define BLOCK_SIZE (4*1024)

// GPIO setup macros. Always use INP_GPIO(x) before using OUT_GPIO(x) or SET_GPIO_ALT(x,y)
#define INP_GPIO(g) *(gpio+((g)/10)) &= ~(7<<(((g)%10)*3))
#define OUT_GPIO(g) *(gpio+((g)/10)) |=  (1<<(((g)%10)*3))
#define SET_GPIO_ALT(g,a) *(gpio+(((g)/10))) |= (((a)<=3?(a)+4:(a)==4?3:2)<<(((g)%10)*3))
 
#define GPIO_SET *(gpio+7)  // sets   bits which are 1 ignores bits which are 0
#define GPIO_CLR *(gpio+10) // clears bits which are 1 ignores bits which are 0
 
#define GET_GPIO(g) (*(gpio+13)&(1<<g)) // 0 if LOW, (1<<g) if HIGH
 
#define GPIO_PULL *(gpio+37) // Pull up/pull down
#define GPIO_PULLCLK0 *(gpio+38) // Pull up/pull down clock
 
int  mem_fd;
void *gpio_map;
// I/O access
volatile unsigned *gpio;
int ready = 0;


napi_value send_zpad_command_napi(napi_env env, napi_callback_info info) {
  napi_status status;
  size_t argc = 2;
  int channel = 0;
  int command = 0;
  int return_code = 0;
  int rep;
  int g;
  napi_value argv[2];
  //printf("About to get cb info\n");
  status = napi_get_cb_info(env, info, &argc, argv, NULL, NULL);
  if (status != napi_ok) {
	napi_throw_error(env, NULL, "Failed to parse arguments");
  }
  status = napi_get_value_int32(env, argv[0], &channel);
  if (status != napi_ok) {
	napi_throw_error(env, NULL, "Invalid channel was passed as argument");
  }
  //printf("Got Channel: %d\n",channel);
  status = napi_get_value_int32(env, argv[1], &command);
  if (status != napi_ok) {
	napi_throw_error(env, NULL, "Invalid command was passed as argument");
  }
  //printf("Got Command: %d\n",command);
	  if (!ready) {
	  //printf("Opening /dev/mem\n");
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
	   
	   //Do the bit banging
	  // printf("Bit Banging Now\n");
	  ready = 1;
	}
	
	INP_GPIO(channel); // must use INP_GPIO before we can use OUT_GPIO
	OUT_GPIO(channel);

	for (rep=0; rep<5; rep++)
	{
	GPIO_SET = 1<<channel;
	g=0;
	while (g<906)
	{
	  g++;
	}
	GPIO_CLR = 1<<channel;
	nanosleep((const struct timespec[]){{0,5000000L}}, NULL);
	}
	for (rep=0; rep<6; rep++)
	{
	GPIO_SET = 1<<channel;
	g=0;
	while (g<906)
	{
	  g++;
	}
	GPIO_CLR = 1<<channel;
	if (command & 1<<(5-rep))
	{
	  nanosleep((const struct timespec[]){{0,7000000L}}, NULL);
	}
	else
	{
	  nanosleep((const struct timespec[]){{0,5000000L}}, NULL);
	}
	}

	GPIO_SET = 1<<channel;
	g=0;
	while (g<906)
	{
	g++;
	}
	GPIO_CLR = 1<<channel;


	napi_value my_return_code;
	//printf("About to create return value\n");

	status = napi_create_int32(env, return_code, &my_return_code);

	if (status != napi_ok) {
	napi_throw_error(env, NULL, "Unable to create return value");
	}
	//printf("About to return\n");
	return my_return_code;
}

napi_value Init(napi_env env, napi_value exports) {
	napi_status status;
	napi_value fn;
	//printf("About to Create Function\n");
	status = napi_create_function(env, NULL, 0, send_zpad_command_napi, NULL, &fn);
	if (status != napi_ok) {
	napi_throw_error(env, NULL, "Unable to wrap native function");
	}
	//printf("About to set named property\n");
	status = napi_set_named_property(env, exports, "send_zpad_command_napi", fn);
	if (status != napi_ok) {
	napi_throw_error(env, NULL, "Unable to populate exports");
	}

	return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)
