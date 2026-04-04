const mongoose = require('mongoose');
const CourseSection = require('../../models/courseSection.model');
const Enrollment = require('../../models/enrollment.model');

async function list(req, res) {
  const roleName = req.user?.roleName || '';
  const filter = { isDeleted: false };

  // Giảng viên chỉ thấy các lớp mình phụ trách
  if (roleName === 'GIANGVIEN') {
    filter.teacherId = req.user.id;
  } else if (roleName === 'SINHVIEN' && req.query.myClasses === 'true') {
    // Sinh viên chỉ thấy lớp mình đăng ký nếu đang ở trang Lớp học của tôi
    const enrollments = await Enrollment.find({ studentId: req.user.id, status: 'ENROLLED', isDeleted: false });
    const enrolledSectionIds = enrollments.map(e => e.sectionId);
    filter._id = { $in: enrolledSectionIds };
  }

  // Lọc theo query params
  if (req.query.courseId && mongoose.isValidObjectId(req.query.courseId)) {
    filter.courseId = req.query.courseId;
  }
  if (req.query.semester) {
    filter.semester = req.query.semester;
  }

  // ─── Pagination: limit 10 ───────────────────────────────
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const skip = (page - 1) * limit;

  const totalDocs = await CourseSection.countDocuments(filter);
  const totalPages = Math.ceil(totalDocs / limit);
  // ─────────────────────────────────────────────────────────

  const sections = await CourseSection.find(filter)
    .populate('courseId', 'code title')
    .populate('teacherId', 'username email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Gắn thêm enrolledCount cho mỗi section
  const sectionIds = sections.map((s) => s._id);
  const counts = await Enrollment.aggregate([
    { $match: { sectionId: { $in: sectionIds }, status: 'ENROLLED', isDeleted: false } },
    { $group: { _id: '$sectionId', enrolledCount: { $sum: 1 } } }
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.enrolledCount]));

  const data = sections.map((s) => ({
    ...s.toObject(),
    enrolledCount: countMap[s._id.toString()] || 0
  }));

  return res.status(200).json({ status: 'success', data, pagination: { page, limit, totalDocs, totalPages } });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const section = await CourseSection.findOne({ _id: id, isDeleted: false })
    .populate('courseId', 'code title description')
    .populate('teacherId', 'username email');

  if (!section) return res.status(404).json({ status: 'fail', message: 'Not found' });

  const enrolledCount = await Enrollment.countDocuments({
    sectionId: id, status: 'ENROLLED', isDeleted: false
  });

  return res.status(200).json({
    status: 'success',
    data: { ...section.toObject(), enrolledCount }
  });
}

async function create(req, res) {
  const { courseId, teacherId, semester, startDate, endDate, capacity } = req.body || {};

  if (!courseId || !mongoose.isValidObjectId(courseId)) {
    return res.status(400).json({ status: 'fail', message: 'courseId required and must be valid' });
  }
  if (!teacherId || !mongoose.isValidObjectId(teacherId)) {
    return res.status(400).json({ status: 'fail', message: 'teacherId required and must be valid' });
  }
  if (!semester) {
    return res.status(400).json({ status: 'fail', message: 'semester required' });
  }
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    return res.status(400).json({ status: 'fail', message: 'startDate must be before endDate' });
  }
  if (capacity !== undefined && (typeof capacity !== 'number' || capacity < 1)) {
    return res.status(400).json({ status: 'fail', message: 'capacity must be a positive number' });
  }

  const doc = await CourseSection.create(req.body);
  const populated = await CourseSection.findById(doc._id)
    .populate('courseId', 'code title')
    .populate('teacherId', 'username email');

  return res.status(201).json({ status: 'success', data: populated });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const payload = { ...req.body };
  delete payload._id;
  delete payload.isDeleted;

  // Không cho giảm capacity nhỏ hơn số SV đã đăng ký
  if (payload.capacity !== undefined) {
    const current = await CourseSection.findOne({ _id: id, isDeleted: false });
    if (!current) return res.status(404).json({ status: 'fail', message: 'Not found' });

    const enrolledCount = await Enrollment.countDocuments({
      sectionId: id, status: 'ENROLLED', isDeleted: false
    });
    if (payload.capacity < enrolledCount) {
      return res.status(400).json({
        status: 'fail',
        message: `capacity không thể nhỏ hơn số sinh viên đã đăng ký (${enrolledCount}).`
      });
    }
  }

  const doc = await CourseSection.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true })
    .populate('courseId', 'code title')
    .populate('teacherId', 'username email');

  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  // Soft-delete enrollment records first
  await Enrollment.updateMany({ sectionId: id, isDeleted: false }, { isDeleted: true });

  const doc = await CourseSection.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { isDeleted: true },
    { new: true }
  );
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
}

module.exports = { list, getById, create, updateById, deleteById };
