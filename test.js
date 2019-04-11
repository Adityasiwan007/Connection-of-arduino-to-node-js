
var express= require('express');
var app = module.exports.app = express();
              
var SerialPort = require('serialport'); // include the serialport library
var Readline = SerialPort.parsers.Readline
var myPort = new SerialPort("/dev/cu.usbmodem14101", {
  baudRate: 9600,
  parser: SerialPort.parsers.Readline
});
              
var server= require('http').createServer(app)
var io = require('socket.io').listen(server);
var fs = require('fs');
              
app.get('/', function (req, res) {
res.sendFile(__dirname + '/pattern/examples/color_video.html');
});
              
myPort.on('open',onOpen);
              
              
function onOpen(){
console.log("port Conntected");
}
io.on('connection', function (socket) {
 var parser = new Readline()
 myPort.pipe(parser)
 parser.on('data', function (data) {  
   console.log('data received: ' + data)
   socket.emit('Ping', data);
 })
});
              
              
app.get('/video', async function (req,res){
res.send("This is video link");
});
                  
app.use('/', express.static(__dirname + '/'));
server.listen(8001);
