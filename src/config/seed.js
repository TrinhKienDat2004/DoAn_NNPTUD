const bcrypt = require('bcryptjs');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const RolePermission = require('../models/rolePermission.model');
const User = require('../models/user.model');

async function seedDefaultsIfEnabled() {
  if (process.env.SEED_DEFAULTS !== 'true') return;

  const [adminRole, teacherRole, studentRole] = await Promise.all([
    Role.findOne({ name: 'ADMIN' }),
    Role.findOne({ name: 'GIANGVIEN' }),
    Role.findOne({ name: 'SINHVIEN' })
  ]);

  const rolesToUpsert = [
    { name: 'ADMIN' },
    { name: 'GIANGVIEN' },
    { name: 'SINHVIEN' }
  ];

  const roleDocs = [];
  for (const r of rolesToUpsert) {
    const doc = await Role.findOneAndUpdate({ name: r.name }, r, { new: true, upsert: true });
    roleDocs.push(doc);
  }

  const permissionsToUpsert = [
    // Users/Auth
    'users:manage',
    // Learning domain
    'courses:manage',
    'sections:manage',
    'enrollments:manage',
    'assignments:manage',
    'submissions:manage',
    'grades:manage',
    'documents:upload'
  ];

  const permissionDocs = [];
  for (const p of permissionsToUpsert) {
    const doc = await Permission.findOneAndUpdate({ name: p }, { name: p }, { new: true, upsert: true });
    permissionDocs.push(doc);
  }

  const roleByName = Object.fromEntries(roleDocs.map((d) => [d.name, d]));
  const permByName = Object.fromEntries(permissionDocs.map((d) => [d.name, d]));

  // Very simple RBAC mapping
  const adminPermNames = permissionsToUpsert;
  const giangVienPermNames = [
    'courses:manage',
    'sections:manage',
    'assignments:manage',
    'grades:manage',
    'documents:upload'
  ];
  const sinhVienPermNames = [
    'enrollments:manage',
    'submissions:manage'
  ];

  const upserts = [
    ...adminPermNames.map((pn) => ({ roleId: roleByName.ADMIN._id, permissionId: permByName[pn]._id })),
    ...giangVienPermNames.map((pn) => ({ roleId: roleByName.GIANGVIEN._id, permissionId: permByName[pn]._id })),
    ...sinhVienPermNames.map((pn) => ({ roleId: roleByName.SINHVIEN._id, permissionId: permByName[pn]._id }))
  ];

  for (const rp of upserts) {
    await RolePermission.findOneAndUpdate(
      { roleId: rp.roleId, permissionId: rp.permissionId },
      rp,
      { upsert: true, new: true }
    );
  }

  const adminEmail = 'admin@example.com';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: adminEmail,
      password: hashed,
      roleId: roleByName.ADMIN._id
    });
    console.log('Seeded admin@example.com / admin123');
  }
}

module.exports = { seedDefaultsIfEnabled };

