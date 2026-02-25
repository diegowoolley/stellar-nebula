import axios from 'axios';

/**
 * Configuração principal da instância do Axios.
 * Define a URL base para todas as chamadas de API, usando a variável de ambiente VITE_API_URL
 * ou 'http://localhost:5000/api' como fallback local.
 */
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

/**
 * Interceptador de Requisição.
 * Adiciona o token retornado pelo localStorage (JWT) no header Authorization de cada requisição.
 */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
