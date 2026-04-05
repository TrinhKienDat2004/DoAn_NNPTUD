const { makeFileUrl } = require('../../middlewares/upload.middleware');

async function uploadFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'Không tìm thấy file tải lên' });
    }

    let folderName = 'documents';
    if (req.file.fieldname === 'avatar') folderName = 'avatars';
    else if (req.file.fieldname === 'file' && req.baseUrl.includes('submissions')) folderName = 'submissions';

    const fileUrl = makeFileUrl(folderName, req.file.filename);

    return res.status(200).json({
      status: 'success',
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}

module.exports = { uploadFile };