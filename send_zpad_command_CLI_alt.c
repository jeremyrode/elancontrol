//  Bit-bang Elan S6 Command Seuquence on GPI10
//  Uses: How to access GPIO registers from C-code on the Raspberry-Pi
//  Dom and Gert

#define BCM2708_PERI_BASE        0x3F000000
#define GPIO_BASE                (BCM2708_PERI_BASE + 0x200000) /* GPIO controller */

#include <stdio.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/mman.h>
#include <unistd.h>
#include <time.h>

#define PAGE_SIZE (4*1024)
#define BLOCK_SIZE (4*1024)

int  mem_fd;
void *gpio_map;

// I/O access
volatile unsigned *gpio;

// GPIO setup macros. Always use INP_GPIO(x) before using OUT_GPIO(x) or SET_GPIO_ALT(x,y)
#define INP_GPIO(g) *(gpio+((g)/10)) &= ~(7<<(((g)%10)*3))
#define OUT_GPIO(g) *(gpio+((g)/10)) |=  (1<<(((g)%10)*3))


#define GPIO_SET *(gpio+7)  // sets   bits which are 1 ignores bits which are 0
#define GPIO_CLR *(gpio+10) // clears bits which are 1 ignores bits which are 0



void pioInit();
void pinMode(const int pin, int function);

int main(int argc, char **argv)
{
    int g,rep,code,chan;
    
    if (argc<3)
    {
        printf("Need two integer commands");
        return -1;
    }
    code = atoi(argv[1]);
    chan = atoi(argv[2]);
    // Set up gpi pointer for direct register access
    pioInit();
    
    for (g=5; g<=13; g++)
    {
        pinMode(7,g); // must use INP_GPIO before we can use OUT_GPIO
        pinMode(1,g);
    }
    
    for (rep=0; rep<5; rep++)
    {
        GPIO_SET = 1<<chan;
        g=0;
        while (g<906)
        {
            g++;
        }
        GPIO_CLR = 1<<chan;
        nanosleep((const struct timespec[]){{0,5000000L}}, NULL);
    }
    for (rep=0; rep<6; rep++)
    {
        GPIO_SET = 1<<chan;
        g=0;
        while (g<906)
        {
            g++;
        }
        GPIO_CLR = 1<<chan;
        if (code & 1<<5-rep)
        {
            nanosleep((const struct timespec[]){{0,7000000L}}, NULL);
        }
        else
        {
            nanosleep((const struct timespec[]){{0,5000000L}}, NULL);
        }
    }
    
    GPIO_SET = 1<<chan;
    g=0;
    while (g<906)
    {
        g++;
    }
    GPIO_CLR = 1<<chan;
    
    return 0;
    
} // main

//Sets the function of a GPIO pin
void pinMode(const int pin, int function) {
    //Determine FPSEL register offset and bit shift
    unsigned offset, shift;
    offset = pin / 10;
    shift = (pin % 10) * 3;
    
    //Clear the bits in FSELn
    GPFSEL[offset] &= ~(0b111 << shift);
    
    //Set the bits to the appropriate function
    GPFSEL[offset] |= (function << shift);
}

//
// Set up a memory regions to access GPIO
//
// Access memory of the BCM2835
void pioInit() {
    int  mem_fd;
    void *reg_map;
    
    // /dev/mem is a psuedo-driver for accessing memory in the Linux filesystem
    if ((mem_fd = open("/dev/mem", O_RDWR|O_SYNC) ) < 0) {
        printf("can't open /dev/mem \n");
        exit(-1);
    }
    
    reg_map = mmap(
            NULL,             //Address at which to start local mapping (null means don't-care)
            BLOCK_SIZE,       //Size of mapped memory block
            PROT_READ|PROT_WRITE,// Enable both reading and writing to the mapped memory
            MAP_SHARED,       // This program does not have exclusive access to this memory
            mem_fd,           // Map to /dev/mem
            GPIO_BASE);       // Offset to GPIO peripheral
    
    if (reg_map == MAP_FAILED) {
        printf("gpio mmap error %d\n", (int)reg_map);
        close(mem_fd);
        exit(-1);
    }
    
    gpio = (volatile unsigned *)reg_map;
}

