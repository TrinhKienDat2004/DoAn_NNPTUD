const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema(
  {
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true, unique: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    componentType: { type: String, default: 'assignment' },
    score: { type: Number, required: true, min: 0, max: 100 },
    finalScore: { type: Number, default: 0, min: 0, max: 100 },
    feedback: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Grade', gradeSchema);

