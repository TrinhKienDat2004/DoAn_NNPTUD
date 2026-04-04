const { makeFileUrl } = require('../../middlewares/upload.middleware');
const User = require('../../models/user.model'); // <-- THÊM DÒNG NÀY

async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({ status: 'fail', message: 'Không tìm thấy file tải lên.' });
  }

  const destSubdir = req.file.destination.split('/').pop() || 'documents';
  const fileUrl = makeFileUrl(destSubdir, req.file.filename);

  // ---> THÊM ĐOẠN LOGIC NÀY: TỰ ĐỘNG LƯU LINK ẢNH VÀO DB CHO USER <---
  if (req.user && req.user.id && destSubdir === 'avatars') {
    await User.findByIdAndUpdate(req.user.id, { avatarUrl: fileUrl });
  }

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