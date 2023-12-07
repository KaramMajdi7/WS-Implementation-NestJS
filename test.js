const io = require('socket.io-client');

for (let i = 0; i < 10; i++) {
  const socket = io('http://localhost:3001'); // Use the correct URL
  socket.emit('join', { name: `User${i}` });
  socket.emit('chatToServer', { name: "Karam", message: "Hello There!" });
}
