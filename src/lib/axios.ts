import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  withCredentials: true, // Para cookies HttpOnly
});

// Request interceptor para agregar headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Agregar headers comunes si es necesario
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor para manejar refresh de tokens
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no hemos intentado refresh aún
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Intentar refresh del token
        await axiosInstance.post('/auth/refresh');
        
        // Reintentar la petición original
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, redirigir a login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
