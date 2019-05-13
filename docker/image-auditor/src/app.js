
const dgram = require('dgram');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const net = require('net');
const protocol = require('./sound-protocol');

const activities = new Map();

const soundToInstrument = new Map([
  ['ti-ta-ti', 'piano'],
  ['pouet', 'trumpet'],
  ['trulu', 'flute'],
  ['gzi-gzi', 'violin'],
  ['boum-boum', 'drum'],
]);

function Musician(uuid, sound, dateStr) {
  this.uuid = uuid;
  this.instrument = soundToInstrument.get(sound);
  this.activeSince = dateStr;
}

function hearSomething(sound, source) {
  const now = moment();

  if (activities.has(source.address)) {
    activities.get(source.address)[1] = now.unix();
  } else {
    activities.set(source.address,
      [new Musician(uuidv4(), sound.toString(), now.toISOString()), now.unix()]);
  }
}

function getReport(socket) {
  const res = [];
  activities.forEach((activity) => {
    if (moment().unix() - activity[1][1] > 5) {
      activities.delete(activity[0]);
    } else {
      res.push(activity[1][0]);
    }
  });

  socket.write(`${JSON.stringify(res, null, '\t')}\n`);
  socket.end();
}

const server = net.createServer(getReport);

server.listen(2205, '0.0.0.0');

const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, () => {
  s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', hearSomething);
