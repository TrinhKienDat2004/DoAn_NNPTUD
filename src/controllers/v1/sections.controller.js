const CourseSection = require('../../models/courseSection.model');
const { createCrudController } = require('./resource.controller');

module.exports = createCrudController({ model: CourseSection, allowSoftDelete: true });

