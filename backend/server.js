require('dotenv').config({ path: '../.env' });
const app = require('./app');
const connectDB = require('./config/db');

const http = require('http');
const { initSocketServer } = require('./socket/socketServer');
const { initScheduledJobs } = require('./jobs/lifecycleJob');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Initialize Socket.io
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Start scheduled lifecycle jobs after database connection is ready
  initScheduledJobs();
});
