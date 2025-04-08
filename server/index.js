require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const PORT = process.env.PORT || 5000;
const CLIENT_URLS = process.env.CLIENT_URL ? 
  process.env.CLIENT_URL.split(' ') : 
  ["http://localhost:3000", "http://localhost:5173"];

const app = express();
const server = http.createServer(app);

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  }
}));

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || CLIENT_URLS.some(url => origin.startsWith(url))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// Socket.io configuration with enhanced options
const io = socketio(server, {
  cors: {
    origin: CLIENT_URLS,
    methods: ["GET", "POST"],
    credentials: true
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  maxHttpBufferSize: 1e8,
  transports: ['websocket', 'polling']
});

// Data storage with enhanced structure
const users = new Map(); // socket.id -> userData
const rooms = new Map([
  ['general', createRoom('general')],
  ['random', createRoom('random')],
  ['tech', createRoom('tech')]
]);

// Room factory function
function createRoom(name) {
  return {
    name,
    users: new Set(),
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// Helper functions
function getRoomData(roomName) {
  const room = rooms.get(roomName);
  return {
    name: room.name,
    users: Array.from(room.users),
    messageCount: room.messages.length,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt
  };
}

function sanitizeInput(input) {
  if (typeof input !== 'string') input = String(input);
  return input.trim().substring(0, 100); // Limit to 100 chars
}

function createMessage(user, text) {
  return {
    id: generateMessageId(),
    user: user.username,
    text,
    time: new Date(),
    room: user.room
  };
}

function generateMessageId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

// Socket.io event handlers
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id} from ${socket.handshake.address}`);

  // Connection error handling
  socket.on('connect_error', (err) => {
    console.error(`Connection error for ${socket.id}:`, err);
  });

  socket.on('join', ({ username, room }, callback) => {
    try {
      console.log(`Join attempt: ${username} to ${room}`);

      const sanitizedUsername = sanitizeInput(username);
      const sanitizedRoom = sanitizeInput(room);

      if (!sanitizedUsername || !sanitizedRoom) {
        console.log('Validation failed - empty username or room');
        return callback({ 
          success: false, 
          error: 'Username and room are required' 
        });
      }

      if (!rooms.has(sanitizedRoom)) {
        console.log(`Creating new room: ${sanitizedRoom}`);
        rooms.set(sanitizedRoom, createRoom(sanitizedRoom));
      }

      const roomObj = rooms.get(sanitizedRoom);

      if (roomObj.users.has(sanitizedUsername)) {
        console.log(`Username ${sanitizedUsername} already in room ${sanitizedRoom}`);
        return callback({ 
          success: false, 
          error: 'Username already taken in this room' 
        });
      }

      // Join the room
      socket.join(sanitizedRoom);
      users.set(socket.id, { 
        username: sanitizedUsername, 
        room: sanitizedRoom,
        joinedAt: new Date(),
        socketId: socket.id
      });
      roomObj.users.add(sanitizedUsername);
      roomObj.updatedAt = new Date();

      // Notify room
      socket.to(sanitizedRoom).emit('notification', {
        type: 'join',
        user: sanitizedUsername,
        time: new Date()
      });

      // Send room data
      io.to(sanitizedRoom).emit('roomData', getRoomData(sanitizedRoom));

      // Send message history
      socket.emit('previousMessages', roomObj.messages.slice(-200));

      console.log(`${sanitizedUsername} successfully joined ${sanitizedRoom}`);
      callback({ success: true });

    } catch (error) {
      console.error('Join error:', error);
      callback({ 
        success: false, 
        error: 'Internal server error' 
      });
    }
  });

  // [Rest of your socket event handlers...]
  socket.on('sendMessage', handleSendMessage(socket));
  socket.on('typing', handleTyping(socket));
  socket.on('getRooms', handleGetRooms(socket));
  socket.on('disconnect', handleDisconnect(socket));
});

// Event handler factories
function handleSendMessage(socket) {
  return (message, callback) => {
    try {
      const user = users.get(socket.id);
      if (!user) return callback({ error: 'User not found' });

      const sanitizedMessage = sanitizeInput(message);
      if (!sanitizedMessage) return callback({ error: 'Message cannot be empty' });

      const msg = createMessage(user, sanitizedMessage);

      // Store message
      const roomObj = rooms.get(user.room);
      roomObj.messages.push(msg);
      if (roomObj.messages.length > 200) {
        roomObj.messages.shift();
      }
      roomObj.updatedAt = new Date();

      // Broadcast message
      io.to(user.room).emit('message', msg);
      callback({ success: true });
    } catch (error) {
      console.error('Message error:', error);
      callback({ error: 'Internal server error' });
    }
  };
}

function handleTyping(socket) {
  return (isTyping) => {
    const user = users.get(socket.id);
    if (!user) return;

    socket.to(user.room).emit('typing', {
      user: user.username,
      isTyping
    });
  };
}

function handleGetRooms(socket) {
  return (callback) => {
    const roomList = Array.from(rooms).map(([name, data]) => ({
      name,
      userCount: data.users.size,
      messageCount: data.messages.length,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }));
    callback(roomList);
  };
}

function handleDisconnect(socket) {
  return () => {
    const user = users.get(socket.id);
    if (!user) return;

    const roomObj = rooms.get(user.room);
    if (roomObj) {
      users.delete(socket.id);
      roomObj.users.delete(user.username);
      roomObj.updatedAt = new Date();

      socket.to(user.room).emit('notification', {
        type: 'leave',
        user: user.username,
        time: new Date()
      });

      io.to(user.room).emit('roomData', getRoomData(user.room));
    }
  };
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date(),
    rooms: rooms.size,
    users: users.size,
    allowedOrigins: CLIENT_URLS
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

// Cleanup empty rooms periodically
setInterval(() => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  for (const [roomName, roomData] of rooms) {
    if (roomData.users.size === 0 && 
        roomData.createdAt < oneHourAgo &&
        !['general', 'random', 'tech'].includes(roomName)) {
      rooms.delete(roomName);
      console.log(`Cleaned up empty room: ${roomName}`);
    }
  }
}, 30 * 60 * 1000); // Run every 30 minutes

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Allowed origins: ${CLIENT_URLS.join(', ')}`);
  console.log(`Socket.IO server initialized`);
});