const SerialPort = require('serialport')
const Delimiter = require('@serialport/parser-delimiter')

const events = require('events');
const eventEmitter = new events.EventEmitter();

const util = require('util');
const port = new SerialPort('/dev/ttyACM0', { baudRate: 9600 })

const parser = port.pipe(new Delimiter({ delimiter: '>>>>' }))
parser.on('data', (chunk) => {
    const buf = chunk.buffer;
    const time = [hour, minute, second] = new Date().toLocaleTimeString("en-US").split(/:| /)

    let obj = {
        id: new Uint16Array(buf.slice(0, 2))[0],
        type: new util.TextDecoder("utf-8").decode(new Uint8Array(buf.slice(4, 8))),
        timestamp: time,
        message: new Float32Array(buf.slice(16, 20))[0]
    };

    if (obj.type === 'TEMP') {
        eventEmitter.emit('Temperature Data', obj)
    }

    if (obj.type === 'COND') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj.type === 'LIGT') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj.type === 'PWRS') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj.type === 'PHLV') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj.type === 'COND') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj.type === 'GPSC') {
        eventEmitter.emit('HUMD', obj)
    }
}
)

function TemperatureEvent(cb) {
    eventEmitter.on('Temperature Data', cb)
}

module.exports = { TemperatureEvent }