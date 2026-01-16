const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const connectDB = require('./db');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');
const upload = require('./upload');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Serve static files from public directory
app.use('/public', express.static(path.join(__dirname, '../public')));

// File upload endpoint
app.post('/upload', upload.single('file'), (lo_req, lo_res) => {
  try {
    if (!lo_req.file) {
      return lo_res.status(400).json({ error: 'No file uploaded' });
    }
    
    const ls_fileUrl = `/public/uploads/${lo_req.file.filename}`;
    lo_res.json({ 
      success: true, 
      url: ls_fileUrl,
      filename: lo_req.file.filename
    });
  } catch (lo_error) {
    lo_res.status(500).json({ error: lo_error.message });
  }
});

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => ({}),
});

const startServer = async () => {
  // Connect to MongoDB first
  await connectDB();
  
  await server.start();
  server.applyMiddleware({ app });

  const li_PORT = process.env.PORT || 4000;
  app.listen(li_PORT, () => {
    console.log(`🚀 Server running at http://localhost:${li_PORT}${server.graphqlPath}`);
  });
};

startServer();
