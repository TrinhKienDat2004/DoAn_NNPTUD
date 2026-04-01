const multer = require('multer');
const path = require('path');
const fs = require('fs');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function makeDiskStorage(destSubdir) {
  const uploadsRoot = path.join(__dirname, '..', '..', '..', 'uploads');
  const destDir = path.join(uploadsRoot, destSubdir);
  ensureDir(destDir);

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, destDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      const safeExt = ext || '.bin';
      const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
      cb(null, filename);
    }
  });
}

function makeFileUrl(destSubdir, filename) {
  const base = process.env.UPLOAD_BASE_URL || 'http://localhost:3000/uploads';
  return `${base}/${destSubdir}/${filename}`;
}

const avatarUpload = multer({
  storage: makeDiskStorage('avatars'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\//.test(file.mimetype);
    if (!ok) return cb(new Error('Avatar must be an image'));
    cb(null, true);
  }
}).single('avatar');

const documentUpload = multer({
  storage: makeDiskStorage('documents'),
  limits: { fileSize: 20 * 1024 * 1024 }
}).single('file');

const submissionUpload = multer({
  storage: makeDiskStorage('submissions'),
  limits: { fileSize: 30 * 1024 * 1024 }
}).single('file');

module.exports = {
  avatarUpload,
  documentUpload,
  submissionUpload,
  makeFileUrl
};

