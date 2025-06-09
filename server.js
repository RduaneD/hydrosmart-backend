import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import connectDB from './database.js';
import routes from './routes/index.js';

dotenv.config();

// Koneksi ke MongoDB
await connectDB();

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    routes: {
      cors: {
        origin: ['*'], // 🚨 Akan batasi nanti untuk production
        headers: ['Accept', 'Content-Type'],
        credentials: true
      }
    }
  });

  // Root route (untuk cek server jalan)
  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      message: 'HydroSmart API is running 🚀'
    })
  });

  // ⛓️ Register semua routes dari /routes/
  server.route(routes);

  await server.start();
  console.log('✅ Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();
