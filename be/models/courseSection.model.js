const mongoose = require('mongoose');

const courseSectionSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: String, default: '' },
    startDate: { type: Date },
    endDate: { type: Date },
    capacity: { type: Number, default: 100 },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

courseSectionSchema.index({ courseId: 1, semester: 1 });

module.exports = mongoose.model('CourseSection', courseSectionSchema);

