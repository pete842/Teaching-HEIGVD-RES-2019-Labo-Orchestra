const dgram = require('dgram');
const protocol = require('./sound-protocol');

const s = dgram.createSocket('udp4');

const instrumentSound = new Map([
  ['piano', 'ti-ta-ti'],
  ['trumpet', 'pouet'],
  ['flute', 'trulu'],
  ['violin', 'gzi-gzi'],
  ['drum', 'boum-boum'],
]);


function Musician(instrument, delay) {
  this.sound = instrumentSound.get(instrument);

  Musician.prototype.update = () => {
    s.send(this.sound, 0, this.sound.length,
      protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS);
  };

  setInterval(this.update.bind(this), typeof delay !== 'undefined' ? delay : 1000);
}

const instrument = process.argv[2];

Musician(instrument);
