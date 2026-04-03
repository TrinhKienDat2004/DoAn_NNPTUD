const mongoose = require('mongoose');
const Assignment = require('../../models/assignment.model');
const CourseSection = require('../../models/courseSection.model');

async function list(req, res) {
  const filter = { isDeleted: false };
  const docs = await Assignment.find(filter)
    .populate('sectionId', 'title courseId')
    .populate({
      path: 'sectionId',
      populate: { path: 'courseId', select: 'title' }
    });
  return res.status(200).json({ status: 'success', data: docs });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid id' });
  }

  const doc = await Assignment.findOne({ _id: id, isDeleted: false })
    .populate('sectionId', 'title courseId')
    .populate({
      path: 'sectionId',
      populate: { path: 'courseId', select: 'title' }
    });

  if (!doc) {
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  }

  return res.status(200).json({ status: 'success', data: doc });
}

async function create(req, res) {
  const { sectionId, title, description, dueDate } = req.body || {};

  if (!sectionId || !mongoose.isValidObjectId(sectionId)) {
    return res.status(400).json({ status: 'fail', message: 'sectionId required and must be valid' });
  }

  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    return res.status(400).json({ status: 'fail', message: 'title required (min 3 chars)' });
  }

  // Verify section exists
  const section = await CourseSection.findOne({ _id: sectionId, isDeleted: false });
  if (!section) {
    return res.status(404).json({ status: 'fail', message: 'CourseSection not found' });
  }

  // Verify user is instructor of this section
  const userRole = req.user?.roleName || '';
  if (userRole !== 'GIANGVIEN') {
    return res.status(403).json({ status: 'fail', message: 'Only instructors can create assignments' });
  }

  const doc = await Assignment.create({
    sectionId,
    title: title.trim(),
    description: description ? description.trim() : '',
    dueDate: dueDate || null
  });

  const populated = await Assignment.findById(doc._id)
    .populate('sectionId', 'title courseId')
    .populate({
      path: 'sectionId',
      populate: { path: 'courseId', select: 'title' }
    });

  return res.status(201).json({ status: 'success', data: populated });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid id' });
  }

  const assignment = await Assignment.findOne({ _id: id, isDeleted: false });
  if (!assignment) {
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  }

  const userRole = req.user?.roleName || '';
  if (userRole !== 'GIANGVIEN') {
    return res.status(403).json({ status: 'fail', message: 'Only instructors can update assignments' });
  }

  const payload = req.body || {};
  // Prevent changing sectionId
  if (payload.sectionId) delete payload.sectionId;

  const doc = await Assignment.findOneAndUpdate(
    { _id: id, isDeleted: false },
    payload,
    { new: true }
  )
    .populate('sectionId', 'title courseId')
    .populate({
      path: 'sectionId',
      populate: { path: 'courseId', select: 'title' }
    });

  return res.status(200).json({ status: 'success', data: doc });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid id' });
  }

  const assignment = await Assignment.findOne({ _id: id, isDeleted: false });
  if (!assignment) {
    return res.status(404).json({ status: 'fail', message: 'Not found' });
  }

  const userRole = req.user?.roleName || '';
  if (userRole !== 'GIANGVIEN') {
    return res.status(403).json({ status: 'fail', message: 'Only instructors can delete assignments' });
  }

  const doc = await Assignment.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );

  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
}

async function getBySection(req, res) {
  const { sectionId } = req.params;
  if (!mongoose.isValidObjectId(sectionId)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid sectionId' });
  }

  const docs = await Assignment.find({ sectionId, isDeleted: false })
    .populate('sectionId', 'title courseId')
    .populate({
      path: 'sectionId',
      populate: { path: 'courseId', select: 'title' }
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({ status: 'success', data: docs });
}

module.exports = { list, create, getById, updateById, deleteById, getBySection };

