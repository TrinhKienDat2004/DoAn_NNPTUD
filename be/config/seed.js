const bcrypt = require('bcryptjs');
const Role = require('../models/role.model');
const Permission = require('../models/permission.model');
const RolePermission = require('../models/rolePermission.model');
const User = require('../models/user.model');
const Course = require('../models/course.model');
const CourseSection = require('../models/courseSection.model');

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
    'submissions:manage',
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

  const adminEmail = 'admin@gmail.com';
  const existingAdmin = await User.findOne({ email: adminEmail }); // Kiểm tra mọi trạng thái (kể cả đã xóa mềm)
  if (!existingAdmin) {
    const hashed = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      email: adminEmail,
      password: hashed,
      roleId: roleByName.ADMIN._id
    });
    console.log('Seeded admin@gmail.com / admin123');
  }

  const gvEmail = 'giangvien@gmail.com';
  const existingGV = await User.findOne({ email: gvEmail });
  if (!existingGV) {
    const hashed = await bcrypt.hash('gv123456', 10);
    const gv = await User.create({
      username: 'Nguyễn Văn Giảng',
      email: gvEmail,
      password: hashed,
      roleId: roleByName.GIANGVIEN._id
    });
    console.log('Seeded giangvien@example.com / gv123456');

    const svEmails = [
      { email: 'sv01@example.com', username: 'Trần Minh Tuấn' },
      { email: 'sv02@example.com', username: 'Lê Thị Hương' },
      { email: 'sv03@example.com', username: 'Phạm Đức Anh' }
    ];
    for (const sv of svEmails) {
      const ex = await User.findOne({ email: sv.email }); // Tránh trùng lặp khi seed lại
      if (!ex) {
        const hashed = await bcrypt.hash('sv123456', 10);
        await User.create({
          username: sv.username,
          email: sv.email,
          password: hashed,
          roleId: roleByName.SINHVIEN._id
        });
      }
    }
    console.log('Seeded 3 sinh viên mẫu (sv01-03@example.com / sv123456)');

    const sampleCourses = [
      { code: 'CS101', title: 'Nhập môn Lập trình', description: 'Giới thiệu các khái niệm cơ bản về lập trình và thuật toán.', category: 'Công nghệ thông tin' },
      { code: 'CS201', title: 'Cấu trúc Dữ liệu & Giải thuật', description: 'Nghiên cứu các cấu trúc dữ liệu và thuật toán nâng cao.', category: 'Công nghệ thông tin' },
      { code: 'CS301', title: 'Cơ sở Dữ liệu', description: 'Thiết kế, xây dựng và quản trị hệ quản trị cơ sở dữ liệu.', category: 'Công nghệ thông tin' },
      { code: 'MA101', title: 'Toán cao cấp A1', description: 'Giải tích hàm một biến, đạo hàm, tích phân và chuỗi.', category: 'Toán học' },
      { code: 'MA201', title: 'Xác suất Thống kê', description: 'Lý thuyết xác suất, biến ngẫu nhiên và thống kê toán.', category: 'Toán học' },
      { code: 'EN101', title: 'Tiếng Anh A2', description: 'Giao tiếp tiếng Anh cơ bản, ngữ pháp và từ vựng.', category: 'Ngoại ngữ' }
    ];
    const courseDocs = [];
    for (const c of sampleCourses) {
      const existingCourse = await Course.findOne({ code: c.code, isDeleted: false });
      if (!existingCourse) {
        const doc = await Course.create(c);
        courseDocs.push(doc);
      } else {
        courseDocs.push(existingCourse);
      }
    }
    console.log(`Seeded ${courseDocs.length} môn học mẫu`);

    const currentSemester = '20251';
    const sampleSections = [
      { courseIdx: 0, semester: currentSemester, capacity: 60, startDate: '2025-01-15', endDate: '2025-05-30' },
      { courseIdx: 1, semester: currentSemester, capacity: 45, startDate: '2025-01-15', endDate: '2025-05-30' },
      { courseIdx: 2, semester: currentSemester, capacity: 50, startDate: '2025-01-15', endDate: '2025-05-30' },
      { courseIdx: 3, semester: currentSemester, capacity: 80, startDate: '2025-01-15', endDate: '2025-05-30' },
      { courseIdx: 4, semester: currentSemester, capacity: 70, startDate: '2025-01-15', endDate: '2025-05-30' },
      { courseIdx: 5, semester: currentSemester, capacity: 90, startDate: '2025-01-15', endDate: '2025-05-30' },
      // Học kỳ trước
      { courseIdx: 0, semester: '20242', capacity: 55, startDate: '2024-08-01', endDate: '2024-12-15' },
      { courseIdx: 1, semester: '20242', capacity: 40, startDate: '2024-08-01', endDate: '2024-12-15' }
    ];
    let sectionCount = 0;
    for (const s of sampleSections) {
      const course = courseDocs[s.courseIdx];
      if (!course) continue;
      const existing = await CourseSection.findOne({
        courseId: course._id, semester: s.semester, isDeleted: false
      });
      if (!existing) {
        await CourseSection.create({
          courseId: course._id,
          teacherId: gv._id,
          semester: s.semester,
          capacity: s.capacity,
          startDate: s.startDate,
          endDate: s.endDate
        });
        sectionCount++;
      }
    }
    console.log(`Seeded ${sectionCount} lớp học phần mẫu (học kỳ ${currentSemester})`);
  }
}

module.exports = { seedDefaultsIfEnabled };

