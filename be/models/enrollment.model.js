const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseSection', required: true },
    status: { type: String, enum: ['ENROLLED', 'CANCELLED'], default: 'ENROLLED' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

enrollmentSchema.index({ studentId: 1, sectionId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

