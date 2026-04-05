const mongoose = require('mongoose');

const Notification = require('../../models/notification.model');

async function list(req, res) {
  const filter = { isDeleted: false };
  const roleName = req.user?.roleName || '';

  if (roleName !== 'ADMIN') {
    filter.userId = req.user.id;
  }

  const docs = await Notification.find(filter).sort({ createdAt: -1 });
  
  // Trả thêm số lượng thông báo chưa đọc nếu là user đang xem của chính mình
  let unreadCount = 0;
  if (roleName !== 'ADMIN') {
    unreadCount = await Notification.countDocuments({ userId: req.user.id, isRead: false, isDeleted: false });
  }

  return res.status(200).json({ 
    status: 'success', 
    data: docs,
    unreadCount 
  });
}

async function getById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName !== 'ADMIN') filter.userId = req.user.id;

  const doc = await Notification.findOne(filter);
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function create(req, res) {
  const payload = req.body || {};
  if (!payload.title) return res.status(400).json({ status: 'fail', message: 'title required' });

  const roleName = req.user?.roleName || '';
  const userId = roleName === 'ADMIN' ? payload.userId : req.user.id;
  if (!userId) return res.status(400).json({ status: 'fail', message: 'userId required' });

  const doc = await Notification.create({
    userId,
    title: payload.title,
    content: payload.content || '',
    isRead: false
  });

  return res.status(201).json({ status: 'success', data: doc });
}

async function updateById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName !== 'ADMIN') filter.userId = req.user.id;

  const payload = { ...(req.body || {}) };
  if (payload.userId) delete payload.userId;

  const doc = await Notification.findOneAndUpdate(filter, payload, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', data: doc });
}

async function deleteById(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const roleName = req.user?.roleName || '';
  const filter = { _id: id, isDeleted: false };
  if (roleName !== 'ADMIN') filter.userId = req.user.id;

  const doc = await Notification.findOneAndUpdate(filter, { isDeleted: true }, { new: true });
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
}

// Đánh dấu 1 thông báo là đã đọc
async function markAsRead(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) return res.status(400).json({ status: 'fail', message: 'Invalid id' });

  const doc = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id, isDeleted: false },
    { isRead: true },
    { new: true }
  );
  if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
  
  return res.status(200).json({ status: 'success', data: doc });
}

// Đánh dấu tất cả thông báo của user là đã đọc
async function markAllAsRead(req, res) {
  await Notification.updateMany(
    { userId: req.user.id, isRead: false, isDeleted: false },
    { $set: { isRead: true } }
  );
  return res.status(200).json({ status: 'success', message: 'Đã đánh dấu đọc tất cả' });
}

module.exports = { list, getById, create, updateById, deleteById, markAsRead, markAllAsRead };