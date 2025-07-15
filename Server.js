const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Clients can join rooms
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room ${roomId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Webhook endpoint from Airtable
app.post('/notify-status', (req, res) => {
  const { bookingId, status } = req.body;
  console.log('Received webhook:', bookingId, status);

  // Emit to the room matching bookingId
  io.to(bookingId).emit('statusUpdate', { bookingId, status });

  res.json({ success: true });
});

server.listen(3001, () => {
  console.log('✅ Socket.IO server running on port 3001');
});
