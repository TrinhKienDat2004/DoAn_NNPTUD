const mongoose = require('mongoose');

const Enrollment = require('../../models/enrollment.model');
const CourseSection = require('../../models/courseSection.model');

async function list(req, res) {
  const roleName = req.user?.roleName || '';
  const filter = { isDeleted: false };

  if (roleName === 'SINHVIEN') {
    filter.studentId = req.user.id;
  } else {
    // Teacher/Admin can optionally filter by studentId via query
    if (req.query.studentId && mongoose.isValidObjectId(req.query.studentId)) {
      filter.studentId = req.query.studentId;
    }
  }

  const docs = await Enrollment.find(filter).populate('sectionId').populate('studentId', 'username email roleId');
  return res.status(200).json({ status: 'success', data: docs });
}

async function create(req, res) {
  const { sectionId, status } = req.body || {};
  if (!sectionId) return res.status(400).json({ status: 'fail', message: 'sectionId required' });
  if (!mongoose.isValidObjectId(sectionId)) return res.status(400).json({ status: 'fail', message: 'Invalid sectionId' });

  const section = await CourseSection.findOne({ _id: sectionId, isDeleted: false });
  if (!section) return res.status(404).json({ status: 'fail', message: 'Section not found' });

  const roleName = req.user?.roleName || '';
  const studentId = roleName === 'SINHVIEN' ? req.user.id : req.body.studentId;
  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    return res.status(400).json({ status: 'fail', message: 'studentId required' });
  }

  try {
    const doc = await Enrollment.create({
      studentId,
      sectionId,
      status: status || 'ENROLLED'
    });
    return res.status(201).json({ status: 'success', data: doc });
  } catch (err) {
    // Duplicate enrollment
    if (err && err.code === 11000) {
      return res.status(400).json({ status: 'fail', message: 'Already enrolled' });
    }
    throw err;
  }
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const doc = await Enrollment.findOne(filter).populate('sectionId').populate('studentId', 'username email');
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const payload = req.body || {};
  if (payload.studentId) delete payload.studentId; // prevent reassignment

  const doc = await Enrollment.findOneAndUpdate(filter, payload, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName === 'SINHVIEN') filter.studentId = req.user.id;

  const doc = await Enrollment.findOneAndUpdate(filter, { isDeleted: true }, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
}

module.exports = { list, create, getById, updateById, deleteById };

