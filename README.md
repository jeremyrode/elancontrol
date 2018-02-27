# elancontrol
### Code to control an Elan System6 Integrated Multi-Zone Controller from RaspberryPi

- [x] Reverse Engineer IR Control Protocol
- [x] Create Function to Replicate IR Control on RaspPi GPIO
- [x] Design Electrical Level Shifter for IR Protocol
- [ ] Reverse Engineer RS-485 based Status Protocol
- [ ] Design RaspPi “Hat” PCB with 6XIR and 1xRS-485

## General Info
I have a Elan S6 in my house and I love it, if only I could control it via my phone!  It shouldn't be that hard to get a Pi connected!

From some experimentation and manual reading, the S6 receives commands from the Zpads on pin #2 (IR) (Note that Elan’s pin numbering is backwards from the ANSI/TIA-568 standards).  

![alt text](docs/zpad_pinout.png "Elan S6 Zpad RJ-45 Pinout")

## Inital Fesability
This inital goal is to have a Raspberry inject IR commands from a bit banged GPIO.  I'm going to capture the commands from the Zpad, and see if a Pi can bit bang fast enough to replicate them.  Unfortunatly, it looks like pin#2 uses an open collector pull up to 12V.  We will need a level shifter and a PMOS pull-up.  I will build a level shifter, and test if we can command the S6

