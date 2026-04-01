import axiosClient from './axiosClient';

const coursesApi = {
  getAll: (params) => axiosClient.get('/courses', { params }),
  getById: (id) => axiosClient.get(`/courses/${id}`),
  create: (data) => axiosClient.post('/courses', data),
  update: (id, data) => axiosClient.put(`/courses/${id}`, data),
  delete: (id) => axiosClient.delete(`/courses/${id}`)
};

export default coursesApi;
