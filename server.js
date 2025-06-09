import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import connectDB from './database.js';
import routes from './routes/index.js';

dotenv.config();

const startServer = async () => {
  try {
    // ✅ Koneksi MongoDB
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    // ✅ Setup Server
    const server = Hapi.server({
      port: process.env.PORT || 3000,
      host: '0.0.0.0', // ✅ WAJIB untuk Railway/Render
      routes: {
        cors: {
          origin: ['*'],
          headers: ['Accept', 'Content-Type'],
          credentials: true,
        }
      }
    });

    // ✅ Endpoint test
    server.route({
      method: 'GET',
      path: '/',
      handler: () => ({
        message: 'HydroSmart API is running 🚀',
      }),
    });

    // ✅ Semua routes modular
    server.route(routes);

    await server.start();
    console.log(`✅ Server running on ${server.info.uri}`);
    console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
  } catch (err) {
    console.error('❌ Startup error:', err);
    process.exit(1);
  }
};

// Global error handling
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// ⛳ Jalankan langsung
startServer();
