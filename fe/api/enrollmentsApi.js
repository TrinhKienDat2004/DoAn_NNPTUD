import axiosClient from './axiosClient';

const enrollmentsApi = {
  getAll: (params) => axiosClient.get('/enrollments', { params }),
  getById: (id) => axiosClient.get(`/enrollments/${id}`),
  enroll: (sectionId) => axiosClient.post('/enrollments', { sectionId }),
  updateStatus: (id, status) => axiosClient.put(`/enrollments/${id}`, { status }),
  cancel: (id) => axiosClient.delete(`/enrollments/${id}`)
};

export default enrollmentsApi;
