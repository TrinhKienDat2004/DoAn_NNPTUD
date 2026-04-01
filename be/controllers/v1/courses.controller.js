const mongoose = require('mongoose');
const Course = require('../../models/course.model');

async function list(req, res) {
  const filter = { isDeleted: false };
  if (req.query.code) filter.code = { $regex: req.query.code, $options: 'i' };
  if (req.query.title) filter.title = { $regex: req.query.title, $options: 'i' };
  if (req.query.category) filter.category = { $regex: req.query.category, $options: 'i' };

  const docs = await Course.find(filter).sort({ createdAt: -1 });
  return res.status(200).json({ status: 'success', data: docs });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid id' });
  }
  const doc = await Course.findOne({ _id: id, isDeleted: false });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function create(req, res) {
  const { code, title, description, category } = req.body || {};

  // Unique code check
  const existing = await Course.findOne({ code, isDeleted: false });
  if (existing) {
    return res.status(400).json({ status: 'fail', message: 'Mã môn học đã tồn tại.' });
  }

  const doc = await Course.create({ code, title, description, category });
  return res.status(201).json({ status: 'success', data: doc });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid id' });
  }

  const payload = { ...req.body };
  delete payload._id;
  delete payload.isDeleted;

  // Unique code check
  if (payload.code) {
    const existing = await Course.findOne({ code: payload.code, isDeleted: false, _id: { $ne: id } });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Mã môn học đã tồn tại.' });
    }
  }

  const doc = await Course.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ status: 'fail', message: 'Invalid id' });
  }

  const doc = await Course.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
}

module.exports = { list, getById, create, updateById, deleteById };
