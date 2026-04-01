const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    mssv: { type: String, required: true, unique: true, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('StudentProfile', studentProfileSchema);

