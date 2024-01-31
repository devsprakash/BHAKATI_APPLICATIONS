// main.js

const socketIO = require('socket.io');

function SocketIO(server) {

  const io = socketIO(server);

  io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('chat message', (msg) => {
      console.log('Message:', msg);
      io.emit('chat message', msg); 
    });

  
    socket.on('disconnect', () => {

      console.log('User disconnected');
      
    });

  });

  return io;
}

module.exports = SocketIO;
