const Course = require('../../models/course.model');
const { createCrudController } = require('./resource.controller');

module.exports = createCrudController({ model: Course, allowSoftDelete: true });

