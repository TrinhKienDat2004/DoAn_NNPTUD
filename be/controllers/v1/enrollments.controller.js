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

  // ─── Pagination: limit 10 ───────────────────────────────
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const totalDocs = await Enrollment.countDocuments(filter);
  const totalPages = Math.ceil(totalDocs / limit);
  // ─────────────────────────────────────────────────────────

  const docs = await Enrollment.find(filter)
    .populate('sectionId')
    .populate('studentId', 'username email roleId')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(200).json({ status: 'success', data: docs, pagination: { page, limit, totalDocs, totalPages } });
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

  // ─── Capacity check ───────────────────────────────────────
  const enrolledCount = await Enrollment.countDocuments({
    sectionId,
    status: 'ENROLLED',
    isDeleted: false
  });
  if (enrolledCount >= section.capacity) {
    return res.status(400).json({
      status: 'fail',
      message: 'Lớp học phần đã đầy sĩ số. Không thể đăng ký thêm.'
    });
  }
  // ──────────────────────────────────────────────────────────

  // ─── Kiểm tra đăng ký đã tồn tại ─────────────────────
  // Tìm bất kể isDeleted để xử lý re-enroll sau khi hủy
  const existing = await Enrollment.findOne({ studentId, sectionId });
  if (existing) {
    if (!existing.isDeleted && existing.status === 'ENROLLED') {
      return res.status(400).json({ status: 'fail', message: 'Already enrolled' });
    }
    // Đã từng đăng ký nhưng đã hủy → re-activate
    existing.isDeleted = false;
    existing.status = 'ENROLLED';
    await existing.save();
    return res.status(201).json({ status: 'success', data: existing });
  }

  const doc = await Enrollment.create({
    studentId,
    sectionId,
    status: status || 'ENROLLED'
  });
  return res.status(201).json({ status: 'success', data: doc });
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

  // Hard delete — xóa hẳn để unique index không còn blocking
  const doc = await Enrollment.findOneAndDelete(filter);
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Đã hủy đăng ký', data: doc });
}

module.exports = { list, create, getById, updateById, deleteById };

