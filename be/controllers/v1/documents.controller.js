const mongoose = require('mongoose');

const Document = require('../../models/document.model');

async function list(req, res) {
  const docs = await Document.find({ isDeleted: false }).populate('createdBy', 'username email roleId');
  return res.status(200).json({ status: 'success', data: docs });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const doc = await Document.findOne({ _id: id, isDeleted: false }).populate('createdBy', 'username email roleId');
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function create(req, res) {
  const { title, courseId, sectionId } = req.body || {};
  if (!title) return res.status(400).json({ status: 'fail', message: 'title required' });
  if (!req.fileUrl) return res.status(400).json({ status: 'fail', message: 'file upload required' });

  const doc = await Document.create({
    title,
    courseId: courseId || undefined,
    sectionId: sectionId || undefined,
    fileUrl: req.fileUrl,
    createdBy: req.user.id
  });

  return res.status(201).json({ status: 'success', data: doc });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const payload = { ...(req.body || {}) };
  delete payload.fileUrl; // upload again if needed

  const doc = await Document.findOneAndUpdate({ _id: id, isDeleted: false }, payload, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const doc = await Document.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
}

module.exports = { list, getById, create, updateById, deleteById };

