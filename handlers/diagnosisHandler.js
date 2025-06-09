import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ganti dengan endpoint Flask diagnosis di Railway
const FLASK_DIAGNOSIS_URL = 'https://web-production-a505.up.railway.app/api/diagnosis';

export const diagnosePlant = async (request, h) => {
  const { payload } = request;
  const { image } = payload;

  if (!image) {
    return h
      .response({ status: 'fail', message: 'Gambar tidak ditemukan' })
      .code(400);
  }

  // Siapkan direktori upload
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = Date.now() + '_' + image.hapi.filename;
  const filepath = path.join(uploadDir, filename);
  const fileStream = fs.createWriteStream(filepath);

  // Simpan file
  await new Promise((resolve, reject) => {
    image.pipe(fileStream);
    image.on('end', resolve);
    image.on('error', reject);
  });

  // Siapkan FormData untuk dikirim ke Flask
  const form = new FormData();
  form.append('my_image', fs.createReadStream(filepath));

  try {
    const flaskResponse = await fetch(FLASK_DIAGNOSIS_URL, {
      method: 'POST',
      body: form,
      headers: form.getHeaders(), // Penting untuk header multipart/form-data
    });

    const result = await flaskResponse.json();

    // Hapus file setelah dikirim
    fs.unlinkSync(filepath);

    return h.response({
      status: 'success',
      data: result,
    }).code(200);

  } catch (err) {
    console.error('Error kirim ke Flask:', err);

    // Hapus file jika error
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    return h
      .response({
        status: 'fail',
        message: 'Gagal menghubungi server diagnosis',
        error: err.message,
      })
      .code(500);
  }
};
