const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../../models/user.model');
const Role = require('../../models/role.model');
const StudentProfile = require('../../models/studentProfile.model');
const TeacherProfile = require('../../models/teacherProfile.model');

function omitPassword(doc) {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  delete obj.password;
  return obj;
}

function mapRoleName(name) {
  const map = {
    ADMIN: 'Quản trị viên',
    SINHVIEN: 'Sinh viên',
    GIANGVIEN: 'Giảng viên'
  };
  return map[name] || name || '';
}

async function getMyProfile(req, res) {
  const { id, roleName } = req.user;
  let profile = null;

  if (roleName === 'SINHVIEN') {
    profile = await StudentProfile.findOne({ userId: id, isDeleted: false });
  } else if (roleName === 'GIANGVIEN') {
    profile = await TeacherProfile.findOne({ userId: id, isDeleted: false });
  }

  const userDoc = await User.findById(id).select('-password').populate('roleId', 'name');
  const userData = {
    ...userDoc.toObject(),
    roleName: mapRoleName(userDoc.roleId?.name)
  };
  return res.status(200).json({ status: 'success', data: { user: userData, profile } });
}

async function updateMyProfile(req, res) {
  const { id, roleName } = req.user;
  const payload = req.body || {};
  let profile = null;

  if (roleName === 'SINHVIEN') {
    profile = await StudentProfile.findOneAndUpdate({ userId: id, isDeleted: false }, payload, { new: true });
  } else if (roleName === 'GIANGVIEN') {
    profile = await TeacherProfile.findOneAndUpdate({ userId: id, isDeleted: false }, payload, { new: true });
  }

  if (payload.avatarUrl) {
    await User.findByIdAndUpdate(id, { avatarUrl: payload.avatarUrl });
  }
  // Allow updating user username as well
  if (payload.username) {
    await User.findByIdAndUpdate(id, { username: payload.username });
  }

  const userDoc = await User.findById(id).select('-password').populate('roleId', 'name');
  const userData = {
    ...userDoc.toObject(),
    roleName: mapRoleName(userDoc.roleId?.name)
  };
  return res.status(200).json({ status: 'success', message: 'Cập nhật thành công', data: { user: userData, profile } });
}

async function list(req, res) {
  const docs = await User.find({ ...(req.query.isDeleted !== undefined ? { isDeleted: req.query.isDeleted } : { isDeleted: false }) })
    .populate('roleId', 'name')
    .select('-password');
  return res.status(200).json({ status: 'success', data: docs });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const doc = await User.findOne({ _id: id, isDeleted: false }).populate('roleId', 'name').select('-password');
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function create(req, res) {
  const { username, email, password, roleId, avatarUrl } = req.body || {};
  if (!username || !email || !password || !roleId) {
    return res.status(400).json({ status: 'fail', message: 'Missing fields' });
  }

  const role = await Role.findById(roleId);
  if (!role || role.isDeleted) return res.status(400).json({ status: 'fail', message: 'Role not found' });

  const existing = await User.findOne({ email: String(email).toLowerCase(), isDeleted: false });
  if (existing) return res.status(400).json({ status: 'fail', message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email: String(email).toLowerCase(),
    password: hashed,
    roleId,
    avatarUrl: avatarUrl || ''
  });

  const doc = await User.findById(user._id).populate('roleId', 'name').select('-password');
  return res.status(201).json({ status: 'success', data: doc });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const payload = { ...(req.body || {}) };
  if (payload.password) payload.password = await bcrypt.hash(payload.password, 10);
  if (payload.email) payload.email = String(payload.email).toLowerCase();

  const doc = await User.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true }).select('-password').populate('roleId', 'name');
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: omitPassword(doc) });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const doc = await User.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true }).select('-password');
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: omitPassword(doc) });
}

// Avatar upload
async function uploadAvatar(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });
  if (!req.file) return res.status(400).json({ status: 'fail', message: 'File missing' });

  // Allow: user can update own avatar; ADMIN can update any.
  if (String(id) !== String(req.user.id) && req.user.roleName !== 'ADMIN') {
    return res.status(403).json({ status: 'fail', message: 'Forbidden' });
  }

  const doc = await User.findOneAndUpdate(
    { _id: id, isDeleted: false },
    { avatarUrl: req.fileUrl },
    { new: true }
  ).select('-password');

  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

module.exports = { list, getById, create, updateById, deleteById, uploadAvatar, getMyProfile, updateMyProfile };

