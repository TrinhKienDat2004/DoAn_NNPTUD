import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    return response.data; // Return only the data part
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export const uploadFile = async (file, type = 'avatar') => {
  const formData = new FormData();
  const keyName = type === 'avatar' ? 'avatar' : 'file';
  formData.append(keyName, file);

  return axiosClient.post(`/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

export default axiosClient;