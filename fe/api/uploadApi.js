import axiosClient from './axiosClient';

// Hàm hỗ trợ upload file
export const uploadFile = async (file, type = 'document') => {
  const formData = new FormData();
  
  // Backend quy định: avatar thì key là 'avatar', document/submission thì key là 'file'
  const keyName = type === 'avatar' ? 'avatar' : 'file';
  formData.append(keyName, file);

  // Đặt header multipart/form-data
  return axiosClient.post(`/upload/${type}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};