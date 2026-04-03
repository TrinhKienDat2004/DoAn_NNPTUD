import axiosClient from './axiosClient';

const assignmentsApi = {
  getAll: (params) => axiosClient.get('/assignments', { params }),
  getById: (id) => axiosClient.get(`/assignments/${id}`),
  getBySection: (sectionId) => axiosClient.get(`/assignments/section/${sectionId}`),
  create: (data) => axiosClient.post('/assignments', data),
  update: (id, data) => axiosClient.put(`/assignments/${id}`, data),
  delete: (id) => axiosClient.delete(`/assignments/${id}`)
};

export default assignmentsApi;
