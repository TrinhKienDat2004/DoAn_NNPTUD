const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../../models/user.model');
const Role = require('../../models/role.model');
const StudentProfile = require('../../models/studentProfile.model');
const TeacherProfile = require('../../models/teacherProfile.model');

function signToken(user) {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ sub: user._id }, process.env.JWT_SECRET, { expiresIn });
}

async function register(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', message: 'Validation error', errors: errors.array() });
  }

  const { username, email, password, roleName } = req.body;

  const role = await Role.findOne({ name: roleName || 'SINHVIEN', isDeleted: false });
  if (!role) return res.status(400).json({ status: 'fail', message: 'Role not found' });

  const existing = await User.findOne({ email: email.toLowerCase(), isDeleted: false });
  if (existing) return res.status(400).json({ status: 'fail', message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password: hashed,
    roleId: role._id,
    avatarUrl: ''
  });

  // Optional: create profile placeholders for profiles required by project rubric.
  if ((roleName || 'SINHVIEN') === 'SINHVIEN') {
    await StudentProfile.create({ userId: user._id, mssv: `AUTO-${user._id.toString().slice(-6)}` });
  }
  if ((roleName || 'SINHVIEN') === 'GIANGVIEN') {
    await TeacherProfile.create({ userId: user._id, giangVienCode: `GV-${user._id.toString().slice(-6)}` });
  }

  const token = signToken(user);
  return res.status(201).json({
    status: 'success',
    message: 'Registered',
    data: {
      token,
      user: { id: user._id, username: user.username, email: user.email, roleId: role._id, roleName: role.name }
    }
  });
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', message: 'Validation error', errors: errors.array() });
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false }).populate('roleId', 'name');
  if (!user) return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });

  const token = signToken(user);
  return res.status(200).json({
    status: 'success',
    message: 'Logged in',
    data: {
      token,
      user: { id: user._id, username: user.username, email: user.email, roleName: user.roleId?.name || '' }
    }
  });
}

async function changePassword(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', message: 'Validation error', errors: errors.array() });
  }

  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);
  
  if (!user || user.isDeleted) {
    return res.status(401).json({ status: 'fail', message: 'User not found' });
  }

  const ok = await bcrypt.compare(oldPassword, user.password);
  if (!ok) return res.status(401).json({ status: 'fail', message: 'Mật khẩu cũ không chính xác' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  return res.status(200).json({ status: 'success', message: 'Đổi mật khẩu thành công' });
}

module.exports = { register, login, changePassword };
