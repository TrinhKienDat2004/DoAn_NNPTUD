import axiosClient from './axiosClient';

// Lấy danh sách giảng viên (role GIANGVIEN) để chọn khi tạo lớp học phần
const usersApi = {
  getTeachers: () => axiosClient.get('/users', { params: { roleName: 'GIANGVIEN' } }),
  getAll: (params) => axiosClient.get('/users', { params })
};

export default usersApi;
