const StudentProfile = require('../../models/studentProfile.model');
const { createCrudController } = require('./resource.controller');

module.exports = createCrudController({ model: StudentProfile, allowSoftDelete: true });

