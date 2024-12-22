const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware'ler
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa
app.get('/', (req, res) => {
  res.redirect('/test');
});

// Test sayfası
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Admin paneli
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Widget.js
app.get('/widget.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'widget.js'));
});

// Aktif sohbetleri tutacağımız obje
const activeChats = {};

// Socket.io bağlantı yönetimi
io.on('connection', (socket) => {
  console.log('Yeni bağlantı:', socket.id);

  // Ziyaretçi chat başlattığında
  socket.on('startChat', (userData) => {
    const chatId = Math.random().toString(36).substring(7);
    activeChats[chatId] = {
      visitor: socket.id,
      messages: [],
      userData
    };
    socket.join(chatId);
    socket.emit('chatStarted', { chatId });
    // Admin'e de bildir
    socket.broadcast.emit('chatStarted', { chatId, userData });
    console.log('Chat başladı:', chatId, userData);
  });

  // Mesaj gönderildiğinde
  socket.on('sendMessage', ({ chatId, message, sender }) => {
    console.log('Yeni mesaj:', { chatId, message, sender });
    if (activeChats[chatId]) {
      const newMessage = {
        text: message,
        sender,
        timestamp: new Date()
      };
      activeChats[chatId].messages.push(newMessage);
      io.emit('newMessage', newMessage);
    }
  });

  // Bağlantı koptuğunda
  socket.on('disconnect', () => {
    console.log('Bağlantı koptu:', socket.id);
    // Aktif sohbetlerden kaldır
    for (const chatId in activeChats) {
      if (activeChats[chatId].visitor === socket.id) {
        delete activeChats[chatId];
        io.emit('chatEnded', { chatId });
      }
    }
  });
});

// Admin panel için login endpoint'i
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  console.log('Giriş denemesi:', username, password);
  console.log('Beklenen:', process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
  
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET || 'gizli-anahtar');
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre' });
  }
});

// 404 handler
app.use((req, res) => {
  console.log('404 isteği:', req.url);
  res.status(404).send('Sayfa bulunamadı');
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Hata:', err);
  res.status(500).send('Sunucu hatası');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
  console.log('Admin kullanıcı adı:', process.env.ADMIN_USERNAME);
  console.log('Admin şifresi:', process.env.ADMIN_PASSWORD);
}); 