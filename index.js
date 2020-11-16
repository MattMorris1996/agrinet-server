const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

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
    const obj_type = new util.TextDecoder("utf-8").decode(new Uint8Array(buf.slice(4, 8)))

    if (obj_type === 'TEMP') {
        let obj = {
            id: new Uint16Array(buf.slice(0, 4))[0],
            type: new util.TextDecoder("utf-8").decode(new Uint8Array(buf.slice(4, 8))),
            timestamp: time,
            message: new Float32Array(buf.slice(16, 20))[0]
        };
        eventEmitter.emit('Temperature Data', obj)
    }

    if (obj_type === 'COND') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj_type === 'LIGT') {
        let obj = {
            id: new Uint16Array(buf.slice(0, 4))[0],
            type: new util.TextDecoder("utf-8").decode(new Uint8Array(buf.slice(4, 8))),
            timestamp: time,
            message: (new Uint16Array(buf.slice(16, 18))[0]/65535)*100
        };
        eventEmitter.emit('Lux Data', obj)
    }

    if (obj_type === 'PWRS') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj_type === 'PHLV') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj_type === 'COND') {
        eventEmitter.emit('Conductivity Data', obj)
    }

    if (obj_type === 'GPSC') {
        eventEmitter.emit('GPS Data', obj)
    }

    if (obj_type === 'MOIS') {
        let obj = {
            id: new Uint16Array(buf.slice(0, 4))[0],
            type: new util.TextDecoder("utf-8").decode(new Uint8Array(buf.slice(4, 8))),
            timestamp: time,
            message: (new Uint16Array(buf.slice(16, 18))[0]/65535)*100
        };
        eventEmitter.emit('Moisture Data', obj)
    }
}
)

function TemperatureEvent(cb) {
    eventEmitter.on('Temperature Data', cb)
}

function ConductivityEvent(cb) {
    eventEmitter.on('Conductivity Data', cb)
}

function HumidityEvent(cb) {
    eventEmitter.on('Humidity Data', cb)
}

function MoistureEvent(cb) {
    eventEmitter.on('Moisture Data', cb)
}

function LightEvent(cb) {
    eventEmitter.on('Lux Data', cb)
}

app.get('/', (req, res) => {
    res.send('<h1>Hello world</h1>');
});

io.on("connection", (socket) => {
    socket.on('subscribeToTemperature', () => {
        console.log("Client subscribed to temperature data")
        TemperatureEvent((temp_packet) => {
            socket.emit('temperature', temp_packet);
        })
    })
    socket.on('subsribeToConductivity', () => {
        console.log("Client subscribed to conductivity data")
        ConductivityEvent((temp_packet) => {
            socket.emit('conductivity', temp_packet);
        })
    })
    socket.on('subscribeToHumidity', () => {
        console.log("Client subscribed to humidity data")
        HumidityEvent((temp_packet) => {
            socket.emit('humidity', temp_packet);
        })
    })
    socket.on('subscribeToMoisture', () => {
        console.log("Client subscribed to humidity data")
        MoistureEvent((temp_packet) => {
            socket.emit('moisture', temp_packet);
        })
    })
    socket.on('subscribeToLux', () => {
        console.log("Client subscribed to Lux data")
        LightEvent((temp_packet) => {
            socket.emit('lux', temp_packet);
        })
    })
    console.log("new user connected");
    socket.on('disconnect', () => {
        console.log('user disconnected');
    })
})

http.listen(4001, function () {
    console.log("listening on *: 4000");
})