require('dotenv').config();
const app = require('./src/app');
const { testConnection } = require('./src/infrastructure/database/connection');

const PORT = process.env.PORT || 5000;

async function startServer() {
    await testConnection();
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}

startServer();

console.log({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

