const { makeFileUrl } = require('../../middlewares/upload.middleware');

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'Không tìm thấy file tải lên.' });
  }

  // Tách tên thư mục đích (avatars, documents, submissions) từ đường dẫn lưu
  const destSubdir = req.file.destination.split('/').pop() || 'documents';
  
  // Tạo URL để frontend lưu vào database
  const fileUrl = makeFileUrl(destSubdir, req.file.filename);

  return res.status(200).json({
    status: 'success',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size
    }
  });
}

module.exports = { uploadFile };