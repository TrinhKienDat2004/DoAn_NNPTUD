import axiosClient from './axiosClient';

const gradesApi = {
  getAll: (params) => axiosClient.get('/grades', { params }),
  getById: (id) => axiosClient.get(`/grades/${id}`),
  gradeSubmission: (submissionId, data) => axiosClient.patch(`/grades/submission/${submissionId}`, data),
  create: (data) => axiosClient.post('/grades', data),
  update: (id, data) => axiosClient.put(`/grades/${id}`, data),
  delete: (id) => axiosClient.delete(`/grades/${id}`)
};

export default gradesApi;
