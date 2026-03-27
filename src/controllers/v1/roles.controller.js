const Role = require('../../models/role.model');
const { createCrudController } = require('./resource.controller');

module.exports = createCrudController({ model: Role, allowSoftDelete: true });

