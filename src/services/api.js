import axios from 'axios';

// URL MockAPI terbaru kamu
const BASE_URL = 'https://6a2fef79a7f8866418d54dfc.mockapi.io';

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk memantau apakah data berhasil ditarik
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Sukses] Mendapatkan ${response.data.length} data.`);
    return response;
  },
  (error) => {
    console.error('[API Error]:', error);
    return Promise.reject(error);
  }
);

// Fungsi untuk menarik data dari tabel 'jadwal'
export const getJadwal = () => apiClient.get('/jadwal');

export default apiClient;