const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    hocHam: { type: String, default: '' },
    khoa: { type: String, default: '' },
    giangVienCode: { type: String, default: '', trim: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);

