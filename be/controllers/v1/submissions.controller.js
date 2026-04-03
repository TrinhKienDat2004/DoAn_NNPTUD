const mongoose = require('mongoose');

const Submission = require('../../models/submission.model');
const Assignment = require('../../models/assignment.model');

async function list(req, res) {
  const roleName = req.user?.roleName || '';
  const filter = { isDeleted: false };
  if (roleName === 'SINHVIEN') {
    filter.studentId = req.user.id;
  }
  const docs = await Submission.find(filter)
    .populate('assignmentId', 'title sectionId')
    .populate('studentId', 'username email');
  return res.status(200).json({ status: 'success', data: docs });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const doc = await Submission.findOne(filter).populate('assignmentId', 'title sectionId').populate('studentId', 'username email');
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function create(req, res) {
  const { assignmentId, score } = req.body || {};
  if (!assignmentId) return res.status(400).json({ status: 'fail', message: 'assignmentId required' });
  if (!mongoose.isValidObjectId(assignmentId)) return res.status(400).json({ status: 'fail', message: 'Invalid assignmentId' });
  if (!req.fileUrl) return res.status(400).json({ status: 'fail', message: 'file upload required' });

  const assignment = await Assignment.findOne({ _id: assignmentId, isDeleted: false });
  if (!assignment) return res.status(404).json({ status: 'fail', message: 'Assignment not found' });

  const roleName = req.user?.roleName || '';
  const studentId = roleName === 'SINHVIEN' ? req.user.id : req.body.studentId;
  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ status: 'fail', message: 'studentId required' });
  }

  // Unique index: (assignmentId, studentId). If exists, update it (resubmission).
  const existing = await Submission.findOne({ assignmentId, studentId, isDeleted: false });
  if (existing) {
    existing.fileUrl = req.fileUrl;
    existing.submittedAt = new Date();
    if (typeof score === 'number') existing.score = score;
    await existing.save();
    return res.status(200).json({ status: 'success', message: 'Resubmitted', data: existing });
  }

  const doc = await Submission.create({
    assignmentId,
    studentId,
    fileUrl: req.fileUrl,
    submittedAt: new Date(),
    score: typeof score === 'number' ? score : 0
  });

  return res.status(201).json({ status: 'success', data: doc });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const payload = req.body || {};
  if (payload.studentId) delete payload.studentId;

  const doc = await Submission.findOneAndUpdate(filter, payload, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const doc = await Submission.findOneAndUpdate(filter, { isDeleted: true }, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
}

async function submit(req, res) {
  const { id: assignmentId } = req.params; // assignment ID from URL
  if (!mongoose.isValidObjectId(assignmentId)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid assignmentId' });
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, isDeleted: false });
  if (!assignment) {
    return res.status(404).json({ status: 'fail', message: 'Assignment not found' });
  }

  // Check deadline
  if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) {
    return res.status(400).json({ status: 'fail', message: 'The deadline for this assignment has passed.' });
  }

  if (!req.fileUrl) {
    return res.status(400).json({ status: 'fail', message: 'File upload is required.' });
  }

  const studentId = req.user.id;

  // Upsert submission (unique index on assignmentId, studentId)
  let submission = await Submission.findOne({ assignmentId, studentId, isDeleted: false });

  if (submission) {
    submission.fileUrl = req.fileUrl;
    submission.submittedAt = new Date();
    await submission.save();
    return res.status(200).json({ status: 'success', message: 'Assignment resubmitted successfully.', data: submission });
  }

  submission = await Submission.create({
    assignmentId,
    studentId,
    fileUrl: req.fileUrl,
    submittedAt: new Date(),
    score: 0
  });

  return res.status(201).json({ status: 'success', message: 'Assignment submitted successfully.', data: submission });
}

async function grade(req, res) {
  const { id: submissionId } = req.params;
  const { score, feedback } = req.body;

  if (!mongoose.isValidObjectId(submissionId)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid submission ID' });
  }

  const numericScore = Number(score);
  if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
    return res.status(400).json({ status: 'fail', message: 'Score must be a number between 0 and 100' });
  }

  const submission = await Submission.findOne({ _id: submissionId, isDeleted: false });
  if (!submission) {
    return res.status(404).json({ status: 'fail', message: 'Submission not found' });
  }

  // Update submission record
  submission.score = numericScore;
  submission.feedback = feedback || '';
  await submission.save();

  // Create or update Grade record for consistency/history if required
  const Grade = require('../../models/grade.model');
  await Grade.findOneAndUpdate(
    { submissionId: submission._id, isDeleted: false },
    {
      teacherId: req.user.id,
      score: numericScore,
      finalScore: numericScore, // Defaulting finalScore to score for now
      // feedback would normally go in a separate field if the Grade model supported it,
      // but based on current model, we might just store it in submission or extend Grade.
      // Let's check Grade model again.
    },
    { upsert: true, new: true }
  );

  return res.status(200).json({ status: 'success', message: 'Submission graded successfully.', data: submission });
}

async function getByAssignment(req, res) {
  const { id: assignmentId } = req.params;
  if (!mongoose.isValidObjectId(assignmentId)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid assignmentId' });
  }

  const roleName = req.user?.roleName || '';
  const filter = { assignmentId, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const docs = await Submission.find(filter)
    .populate('assignmentId', 'title')
    .populate('studentId', 'username email');
  return res.status(200).json({ status: 'success', data: docs });
}

module.exports = { list, create, getById, updateById, deleteById, submit, grade, getByAssignment };

