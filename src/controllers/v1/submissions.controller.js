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
    .populate('assignmentId', 'title sectionId dueDate')
    .populate('studentId', 'username email')
    .sort({ submittedAt: -1 });
  return res.status(200).json({ status: 'success', data: docs });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const doc = await Submission.findOne(filter)
    .populate('assignmentId', 'title sectionId dueDate')
    .populate('studentId', 'username email');
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
    const populated = await Submission.findById(existing._id)
      .populate('assignmentId', 'title sectionId dueDate')
      .populate('studentId', 'username email');
    return res.status(200).json({ status: 'success', message: 'Resubmitted', data: populated });
  }

  const doc = await Submission.create({
    assignmentId,
    studentId,
    fileUrl: req.fileUrl,
    submittedAt: new Date(),
    score: typeof score === 'number' ? score : 0
  });

  const populated = await Submission.findById(doc._id)
    .populate('assignmentId', 'title sectionId dueDate')
    .populate('studentId', 'username email');
  return res.status(201).json({ status: 'success', data: populated });
}

async function submitAssignment(req, res) {
  const { assignmentId } = req.params;
  if (!mongoose.isValidObjectId(assignmentId)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid assignmentId' });
  }

  if (!req.fileUrl) {
    return res.status(400).json({ status: 'fail', message: 'file upload required' });
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, isDeleted: false });
  if (!assignment) {
    return res.status(404).json({ status: 'fail', message: 'Assignment not found' });
  }

  // Check deadline
  if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
    return res.status(400).json({
      status: 'fail',
      message: 'Assignment deadline has passed',
      deadline: assignment.dueDate
    });
  }

  const studentId = req.user.id;

  // Check if already submitted
  const existing = await Submission.findOne({
    assignmentId,
    studentId,
    isDeleted: false
  });

  if (existing) {
    // Allow resubmission before deadline
    existing.fileUrl = req.fileUrl;
    existing.submittedAt = new Date();
    await existing.save();
    const populated = await Submission.findById(existing._id)
      .populate('assignmentId', 'title sectionId dueDate')
      .populate('studentId', 'username email');
    return res.status(200).json({
      status: 'success',
      message: 'Resubmitted successfully',
      data: populated
    });
  }

  const doc = await Submission.create({
    assignmentId,
    studentId,
    fileUrl: req.fileUrl,
    submittedAt: new Date(),
    score: 0
  });

  const populated = await Submission.findById(doc._id)
    .populate('assignmentId', 'title sectionId dueDate')
    .populate('studentId', 'username email');

  return res.status(201).json({
    status: 'success',
    message: 'Assignment submitted successfully',
    data: populated
  });
}

async function getByAssignment(req, res) {
  const { assignmentId } = req.params;
  if (!mongoose.isValidObjectId(assignmentId)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid assignmentId' });
  }

  const assignment = await Assignment.findOne({ _id: assignmentId, isDeleted: false });
  if (!assignment) {
    return res.status(404).json({ status: 'fail', message: 'Assignment not found' });
  }

  const docs = await Submission.find({ assignmentId, isDeleted: false })
    .populate('studentId', 'username email')
    .sort({ submittedAt: -1 });

  return res.status(200).json({ status: 'success', data: docs });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const payload = req.body || {};
  if (payload.studentId) delete payload.studentId;

  const doc = await Submission.findOneAndUpdate(filter, payload, { new: true })
    .populate('assignmentId', 'title sectionId')
    .populate('studentId', 'username email');
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

module.exports = { list, create, getById, updateById, deleteById, submitAssignment, getByAssignment };

