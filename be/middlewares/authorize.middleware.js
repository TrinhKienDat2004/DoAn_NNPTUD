const RolePermission = require('../models/rolePermission.model');

function authorize({ roles = [], permissions = [] } = {}) {
  return async (req, res, next) => {
    const roleName = req.user?.roleName;
    if (!roleName && roles.length > 0) {
      return res.status(403).json({ status: 'fail', message: 'Forbidden (no role)' });
    }

    // If roles requirement exists, check it first.
    if (roles.length > 0) {
      if (roles.includes(roleName)) return next();
      return res.status(403).json({ status: 'fail', message: 'Forbidden (role not allowed)' });
    }

    // If permissions requirement exists, check user's role permissions.
    if (permissions.length > 0) {
      const roleId = req.user?.roleId;
      if (!roleId) {
        return res.status(403).json({ status: 'fail', message: 'Forbidden (no roleId)' });
      }

      const rolePerms = await RolePermission.find({
        roleId,
        isDeleted: false
      }).populate('permissionId', 'name');

      const userPermNames = new Set(rolePerms.map((rp) => rp.permissionId?.name).filter(Boolean));
      const ok = permissions.every((p) => userPermNames.has(p));
      if (!ok) {
        return res.status(403).json({ status: 'fail', message: 'Forbidden (permission not allowed)' });
      }
      return next();
    }

    return res.status(500).json({ status: 'fail', message: 'Bad authorization config' });
  };
}

module.exports = { authorize };

