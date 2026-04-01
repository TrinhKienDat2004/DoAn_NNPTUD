import axiosClient from './axiosClient';

const sectionsApi = {
  getAll: (params) => axiosClient.get('/sections', { params }),
  getById: (id) => axiosClient.get(`/sections/${id}`),
  create: (data) => axiosClient.post('/sections', data),
  update: (id, data) => axiosClient.put(`/sections/${id}`, data),
  delete: (id) => axiosClient.delete(`/sections/${id}`)
};

export default sectionsApi;
