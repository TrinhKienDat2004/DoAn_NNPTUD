import axiosClient from './axiosClient';

const submissionsApi = {
  getAll: (params) => axiosClient.get('/submissions', { params }),
  getById: (id) => axiosClient.get(`/submissions/${id}`),
  getByAssignment: (assignmentId) => axiosClient.get(`/submissions/assignment/${assignmentId}`),
  submit: (assignmentId, formData) =>
    axiosClient.post(`/submissions/assignment/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  create: (formData) =>
    axiosClient.post('/submissions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  update: (id, data) => axiosClient.put(`/submissions/${id}`, data),
  delete: (id) => axiosClient.delete(`/submissions/${id}`)
};

export default submissionsApi;
