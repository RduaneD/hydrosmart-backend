import Hapi from '@hapi/hapi';
import dotenv from 'dotenv';
import connectDB from './database.js';
import routes from './routes/index.js';

dotenv.config();

// Koneksi ke MongoDB
try {
  await connectDB();
  console.log('✅ MongoDB connected successfully');
} catch (error) {
  console.error('❌ MongoDB connection failed:', error.message);
  process.exit(1);
}

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: '0.0.0.0', // 🔥 Penting agar bisa diakses oleh Render
    routes: {
      cors: {
        origin: ['*'], // Batasi untuk domain tertentu saat production
        headers: ['Accept', 'Content-Type'],
        credentials: true,
      }
    }
  });

  // 🔍 Root endpoint untuk test server hidup
  server.route({
    method: 'GET',
    path: '/',
    handler: () => ({
      message: 'HydroSmart API is running 🚀'
    })
  });

  // ⛓️ Daftarkan semua routes modular
  server.route(routes);

  await server.start();
  console.log(`✅ Server running on ${server.info.uri}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
};

// Global error handler
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

init();
