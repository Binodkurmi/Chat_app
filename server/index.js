const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// Allowed origins based on environment
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://your-production-domain.com']
  : ['http://localhost:5173', 'http://localhost:3000'];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST']
}));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Setup Socket.IO
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingInterval: 10000,
  pingTimeout: 5000
});

// In-memory data stores
const users = {};         // socketId => { username, room, id }
const rooms = {};         // roomName => [ { id, username } ]
const messageHistory = {}; // roomName => [ { username, text, timestamp } ]

// Handle socket connections
io.on('connection', (socket) => {
  console.log(`🔌 New client connected: ${socket.id}`);

  // User joins a room
  socket.on('join', ({ username, room }, callback) => {
    try {
      if (!username || !room) {
        throw new Error('Username and room are required');
      }

      // Unique username check
      if (rooms[room]?.some(user => user.username === username)) {
        throw new Error('Username is already taken in this room');
      }

      socket.join(room);

      // Add to users and room
      users[socket.id] = { username, room, id: socket.id };
      if (!rooms[room]) rooms[room] = [];
      rooms[room].push({ id: socket.id, username });

      // Initialize message history if not present
      if (!messageHistory[room]) messageHistory[room] = [];

      // Notify others in room
      socket.to(room).emit('userJoined', { username });

      // Send current room data and message history to new user
      io.to(socket.id).emit('roomData', {
        room,
        users: rooms[room],
        history: messageHistory[room]
      });

      callback({ success: true, message: `Joined room ${room}` });

    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // Typing indicator
  socket.on('typing', ({ isTyping, room }) => {
    const user = users[socket.id];
    if (user) {
      socket.to(room).emit('typing', {
        username: user.username,
        isTyping
      });
    }
  });

  // Sending message
  socket.on('sendMessage', ({ message, room }, callback) => {
    try {
      const user = users[socket.id];
      if (!user) throw new Error('User not found');
      if (!message?.trim()) throw new Error('Message cannot be empty');

      const msg = {
        username: user.username,
        text: message.trim(),
        timestamp: new Date().toISOString()
      };

      // Save message to history
      messageHistory[room].push(msg);

      // Send message to all in room
      io.to(room).emit('message', msg);
      callback({ success: true });
    } catch (error) {
      callback({ success: false, message: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      const { username, room } = user;

      // Remove user from room
      rooms[room] = rooms[room].filter(u => u.id !== socket.id);
      if (rooms[room].length === 0) {
        delete rooms[room];
        delete messageHistory[room]; // Optional cleanup
      }

      // Notify others in room
      socket.to(room).emit('userLeft', { username });

      // Update room data
      io.to(room).emit('roomData', {
        room,
        users: rooms[room] || []
      });

      delete users[socket.id];
    }
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
});
