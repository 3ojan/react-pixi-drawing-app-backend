const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000", // Allow the frontend URL
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors());

// Function to generate random names
function getRandomName() {
  const adjectives = ["Fast", "Wild", "Crazy", "Mighty", "Silent"];
  const nouns = ["Panther", "Eagle", "Lion", "Tiger", "Hawk"];
  return (
    adjectives[Math.floor(Math.random() * adjectives.length)] +
    nouns[Math.floor(Math.random() * nouns.length)] +
    Math.floor(Math.random() * 100)
  );
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Assign a random name and a UUID to the user
  const userName = getRandomName();
  const userId = uuidv4();

  // Emit the assigned name and ID back to the user
  socket.emit('assignedUser', { name: userName, id: userId });

  // Handle drawing event
  socket.on('draw', (data) => {
    // Include user information with the drawing data
    data.user = { name: userName, id: userId };

    // Broadcast drawing data to other users, except the sender
    socket.broadcast.emit('draw', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
