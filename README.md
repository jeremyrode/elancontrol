# elancontrol
### Code to control an Elan System6 Integrated Multi-Zone Controller from RaspberryPi

- [x] Reverse Engineer IR Control Protocol
- [x] Create Function to Replicate IR Control on RaspPi GPIO
- [x] Design Electrical Level Shifter for IR Protocol
- [ ] Reverse Engineer RS-485 based Status Protocol
- [ ] Design RaspPi “Hat” PCB with 6XIR and 1xRS-485

From some experimentation and manual reading, the S6 receives commands from the Zpads on pin #2 (IR) (Note that Elan’s pin numbering is backwards from the ANSI/TIA-568 standards)
Goal is to have a Raspberry inject IR commands from a bit banged GPIO.
![alt text](docs/zpad_pinout.png "Elan S6 Zpad RJ-45 Pinout")
IR Channel of 
