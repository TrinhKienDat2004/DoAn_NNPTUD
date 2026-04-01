const TeacherProfile = require('../../models/teacherProfile.model');
const { createCrudController } = require('./resource.controller');

module.exports = createCrudController({ model: TeacherProfile, allowSoftDelete: true });

