const Assignment = require('../../models/assignment.model');
const { createCrudController } = require('./resource.controller');

module.exports = createCrudController({ model: Assignment, allowSoftDelete: true });

