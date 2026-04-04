const Assignment = require('../../models/assignment.model');
const { createCrudController } = require('./resource.controller');
const { makeFilterQuery } = require('../../utils/queryHelpers');

const crudController = createCrudController({ model: Assignment, allowSoftDelete: true });

async function list(req, res) {
  const filter = makeFilterQuery(req, { isDeleted: false });
  if (req.query.sectionId) {
    filter.sectionId = req.query.sectionId;
  }
  const docs = await Assignment.find(filter)
    .populate({ path: 'sectionId', populate: { path: 'courseId' } })
    .sort({ createdAt: -1 });
  return res.status(200).json({ status: 'success', data: docs });
}

module.exports = {
  ...crudController,
  list
};

