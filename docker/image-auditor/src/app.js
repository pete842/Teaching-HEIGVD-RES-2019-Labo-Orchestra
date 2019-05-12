const protocol = require('./sound-protocol');

const dgram = require('dgram');
const moment = require('moment');
const uuidv4 = require('uuid/v4');
const net = require('net');

let activities = new Map();

const soundToInstrument = new Map([
    ['ti-ta-ti', 'piano'],
    ['pouet', 'trumpet'],
    ['trulu', 'flute'],
    ['gzi-gzi', 'violin'],
    ['boum-boum', 'drum']
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
        activities.set(source.address, [new Musician(uuidv4(), sound.toString(), now.toISOString()), now.unix()]);
    }
}

function getReport(socket) {
    let res = [];
    for (let activity of activities) {
        if (moment().unix() - activity[1][1] > 5) {
            console.log("delete");
            activities.delete(activity[0]);
            continue;
        }

        res.push(activity[1][0]);
    }

    const response = new Buffer(JSON.stringify(res, null, '\t') + '\n');

    socket.write(response);
    socket.end();
}

const server = net.createServer(getReport);

server.listen(2205, '0.0.0.0');

const s = dgram.createSocket('udp4');
s.bind(protocol.PROTOCOL_PORT, function () {
    s.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

s.on('message', hearSomething);
