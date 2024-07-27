// src/axiosConfig.js
import axios from 'axios';

const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

const instance = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'X-CSRF-TOKEN': token,
    'Content-Type': 'application/json',
  },
});

export default instance;
