import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000', // Flask backend URL
  withCredentials: true,           // Send cookies and headers
  headers: {
    'Content-Type': 'application/json', // Ensure proper headers
  },
});

export default api;