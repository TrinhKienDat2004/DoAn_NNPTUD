const Permission = require('../../models/permission.model');
const { createCrudController } = require('./resource.controller');

module.exports = createCrudController({ model: Permission, allowSoftDelete: true });

