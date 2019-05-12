const protocol = require('./sound-protocol');
const dgram = require('dgram');

const s = dgram.createSocket('udp4');

const instrumentSound = new Map([
    ['piano', 'ti-ta-ti'],
    ['trumpet', 'pouet'],
    ['flute', 'trulu'],
    ['violin', 'gzi-gzi'],
    ['drum', 'boum-boum']
]);


function Musician(instrument, delay) {
    this.sound = instrumentSound.get(instrument);
    console.log(instrument);
    console.log(this.sound);

    Musician.prototype.update = function () {
        const message = new Buffer(this.sound);

        s.send(message, 0, message.length, protocol.PROTOCOL_PORT, protocol.PROTOCOL_MULTICAST_ADDRESS, function (err, bytes) {
            console.log("Sending sound: " + message + " via port " + s.address().port);
        });

    };

    setInterval(this.update.bind(this), typeof delay !== 'undefined' ? delay : 1000);
}

const instrument = process.argv[2];

const m1 = new Musician(instrument);
