// create a new SPI object
var spi = new SPI();
var CS_PIN = 15;

// Set CS / pin 15 for output and set value to LOW
GPIO.setmode(CS_PIN,0,2);

// Setup operation codes
var op = {
  noop:        0x00,
  row0:      0x01,
  row1:      0x02,
  row2:      0x03,
  row3:      0x04,
  row4:      0x05,
  row5:      0x06,
  row6:      0x07,
  row7:      0x08,
  rows: [0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08],
  decodeMode:  0x09,
  intensity:   0x0A,
  scanLimit:   0x0B,
  shutdown:    0x0C,
  displayTest: 0x0F
};
startMax();
/*
Makes sure CS_PIN is low, allowing for data transmission. Then passes in
8 bits for address, and 8 bits for its value. Once data has transmitted set
CS_PIN to high to signal data end
*/
function maxTransfer(address, value) {
  GPIO.write(CS_PIN, 0);
  spi.tran(address);
  spi.tran(value);
  GPIO.write(CS_PIN, 1);
}

/*
Starts up the MAX7219 chip and displays a diagonal line on an 8x8 led matrix
first disables the display test (all leds lit) then sets the scan limit - or -
how many rows should be used, or digits in a 7 segment display. Next this will
set the decodeMode to 0 to not allow digit fonts and allow individual led switching
Sending 0x01 or 1 to shutdown switches the display on. Last, set the intensity to
a low setting
*/
function startMax() {
  maxTransfer(op.displayTest, 0x00);
  maxTransfer(op.scanLimit, 0x07);
  maxTransfer(op.decodeMode, 0x00);

  for(var i = 0; i < 0x08; i++) {
    maxTransfer(op.rows[i], 0x01 << i);
  }
  maxTransfer(op.shutdown, 0x01);
  maxTransfer(op.intensity, 0x01);

}

// Set each row to fully lit
function fillLED() {
  for(var i = 0; i < 8; i++) {
    maxTransfer(op.rows[i], 0xFF);
  }
}

function dot() {
  for(var i = 0; i <= 8; i++) {
    for(var z = 0; z < 8; z++) {
      maxTransfer(i, 1 << z);
    }
  }
}
function adcPlot() {
  var val = ADC.read(0);
  var calc = val / 15;
  columnLine(calc);
  setTimeout(adcPlot, 1000 / 30);
}
// draws a line across columns instead of rows
function columnLine(level) {
  if(level > 8 || level < 0) {
    return;
  }
  for(var i = 0; i <= 8; i++) {
    maxTransfer(i, 1 << level);
  }
}
