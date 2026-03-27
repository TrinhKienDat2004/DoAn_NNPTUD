const mongoose = require('mongoose');
const { makeFilterQuery } = require('../../utils/queryHelpers');

function createCrudController({ model, allowSoftDelete = true }) {
  async function list(req, res) {
    const filter = makeFilterQuery(req, { isDeleted: allowSoftDelete });
    const docs = await model.find(filter);
    return res.status(200).json({ status: 'success', data: docs });
  }

  async function getById(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid id' });
    }
    const filter = { _id: id };
    if (allowSoftDelete) filter.isDeleted = false;
    const doc = await model.findOne(filter);
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
    return res.status(200).json({ status: 'success', data: doc });
  }

  async function create(req, res) {
    const payload = req.body || {};
    if (allowSoftDelete && payload.isDeleted !== undefined) delete payload.isDeleted;
    const doc = await model.create(payload);
    return res.status(201).json({ status: 'success', data: doc });
  }

  async function updateById(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid id' });
    }
    const payload = req.body || {};
    if (allowSoftDelete && payload.isDeleted !== undefined) delete payload.isDeleted;

    const filter = { _id: id };
    if (allowSoftDelete) filter.isDeleted = false;

    const doc = await model.findOneAndUpdate(filter, payload, { new: true });
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
    return res.status(200).json({ status: 'success', data: doc });
  }

  async function deleteById(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid id' });
    }

    if (allowSoftDelete) {
      const doc = await model.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true }, { new: true });
      if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
      return res.status(200).json({ status: 'success', message: 'Deleted (soft)', data: doc });
    }

    const doc = await model.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ status: 'fail', message: 'Not found' });
    return res.status(200).json({ status: 'success', message: 'Deleted', data: doc });
  }

  return {
    list,
    create,
    getById,
    updateById,
    deleteById
  };
}

module.exports = { createCrudController };

