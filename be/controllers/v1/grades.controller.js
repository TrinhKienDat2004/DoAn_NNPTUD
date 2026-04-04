const mongoose = require('mongoose');

const Grade = require('../../models/grade.model');
const Submission = require('../../models/submission.model');
const Notification = require('../../models/notification.model');

async function list(req, res) {
  const roleName = req.user?.roleName || '';
  if (roleName === 'SINHVIEN') {
    const grades = await Grade.find({ isDeleted: false })
      .populate({
        path: 'submissionId',
        match: { isDeleted: false },
        populate: { path: 'studentId', select: '_id' }
      })
      .populate('teacherId', 'username email');

    const filtered = grades.filter((g) => String(g.submissionId?.studentId?._id || g.submissionId?.studentId) === String(req.user.id));
    return res.status(200).json({ status: 'success', data: filtered });
  }

  const docs = await Grade.find({ isDeleted: false }).populate('submissionId').populate('teacherId', 'username email');
  return res.status(200).json({ status: 'success', data: docs });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const doc = await Grade.findOne({ _id: id, isDeleted: false })
    .populate('submissionId', 'studentId assignmentId')
    .populate('teacherId', 'username email');

  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });

  if (req.user?.roleName === 'SINHVIEN') {
    const submissionStudentId = doc.submissionId?.studentId?._id ? String(doc.submissionId.studentId._id) : String(doc.submissionId.studentId);
    if (submissionStudentId !== String(req.user.id)) {
      return res.status(403).json({ status: 'fail', message: 'Forbidden' });
    }
  }

  return res.status(200).json({ status: 'success', data: doc });
}

async function create(req, res) {
  const { submissionId, componentType, score, finalScore, feedback } = req.body || {};
  if (!submissionId || score === undefined) {
    return res.status(400).json({ status: 'fail', message: 'submissionId and score required' });
  }
  if (!mongoose.isValidObjectId(submissionId)) return res.status(400).json({ status: 'fail', message: 'Invalid submissionId' });

  const submission = await Submission.findOne({ _id: submissionId, isDeleted: false }).populate('assignmentId', 'title');
  if (!submission) return res.status(404).json({ status: 'fail', message: 'Submission not found' });

  const doc = await Grade.findOneAndUpdate(
    { submissionId, isDeleted: false },
    {
      submissionId,
      teacherId: req.user.id,
      componentType: componentType || 'assignment',
      score,
      finalScore: finalScore || 0,
      feedback: feedback || ''
    },
    { new: true, upsert: true }
  );

  // Tạo thông báo cho sinh viên
  if (doc && submission.studentId) {
    const assignmentTitle = submission.assignmentId?.title || 'một bài tập';
    await Notification.create({
      userId: submission.studentId,
      title: 'Bạn có điểm mới!',
      content: `Giáo viên vừa cập nhật điểm cho bài nộp của bạn trong: ${assignmentTitle}. Điểm của bạn là: ${score}/100.`,
      isRead: false
    });
  }

  return res.status(201).json({ status: 'success', data: doc });
}

async function gradeSubmission(req, res) {
  const { submissionId } = req.params;
  const { score, feedback } = req.body || {};

  if (!mongoose.isValidObjectId(submissionId)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid submissionId' });
  }

  if (score === undefined || typeof score !== 'number' || score < 0 || score > 100) {
    return res.status(400).json({ status: 'fail', message: 'score required and must be 0-100' });
  }

  const submission = await Submission.findOne({ _id: submissionId, isDeleted: false }).populate('assignmentId', 'title');
  if (!submission) {
    return res.status(404).json({ status: 'fail', message: 'Submission not found' });
  }

  let doc = await Grade.findOne({ submissionId, isDeleted: false });

  if (doc) {
    doc.score = score;
    doc.teacherId = req.user.id;
    if (feedback) doc.feedback = feedback;
    await doc.save();
  } else {
    doc = await Grade.create({
      submissionId,
      teacherId: req.user.id,
      componentType: 'assignment',
      score,
      finalScore: score,
      feedback: feedback || ''
    });
  }

  const populated = await Grade.findById(doc._id).populate('submissionId').populate('teacherId', 'username email');

  if (submission.studentId) {
    const assignmentTitle = submission.assignmentId?.title || 'một bài tập';
    await Notification.create({
      userId: submission.studentId,
      title: 'Bạn có điểm mới!',
      content: `Giáo viên vừa cập nhật điểm cho bài nộp của bạn trong: ${assignmentTitle}. Điểm của bạn là: ${score}/100.`,
      isRead: false
    });
  }

  return res.status(200).json({ status: 'success', message: 'Graded successfully', data: populated });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const payload = req.body || {};
  const doc = await Grade.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const doc = await Grade.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
}

module.exports = { list, getById, create, updateById, deleteById, gradeSubmission };