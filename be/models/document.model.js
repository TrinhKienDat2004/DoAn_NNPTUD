const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'CourseSection' },
    title: { type: String, required: true, trim: true },
    fileUrl: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);

