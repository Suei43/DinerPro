// server.js
const express = require('express');
const next = require('next');
const dotenv = require('dotenv');
const path = require('path');
const cache = require('express-cache')
const winston = require('winston');
dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

// Winston logger
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: 'logs/server.log' })
  ],
  level: 'info', // Set the desired log level
  format: winston.format.json(), // Use JSON format for logs
});

//Caching middleware
const cacheMiddleware = cache({
  prefix: 'myapp:', // Prefix for cache keys
  expire: 60, // Cache expiration time in seconds
});

//Express Server
app.prepare().then(() => {
  const server = express();

  //Caching static assets
  server.use(express.static(path.join(__dirname, 'public'),{
    maxAge: '20d', // Static assests are cached for 20 days
    immutable: true,
  }));

  //CUSTOM API ROUTES COME HERE 

  // Default Next.js handling
  server.all('*',cacheMiddleware, (req, res) => {
    logger.info(`> Request: ${req.url}`);
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    logger.info('> Server is running on http://localhost:3000');
    console.log('> Ready on http://localhost:3000');

  });
}).catch((ex) => {
  console.error(ex.stack);
  process.exit(1);
});