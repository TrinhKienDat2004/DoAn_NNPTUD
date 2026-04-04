console.log('INDEX ROUTES LOADED');
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');

const usersRoutes = require('./users.routes');
const rolesRoutes = require('./roles.routes');
const permissionsRoutes = require('./permissions.routes');
const studentProfilesRoutes = require('./studentProfiles.routes');
const teacherProfilesRoutes = require('./teacherProfiles.routes');
const coursesRoutes = require('./courses.routes');
const sectionsRoutes = require('./sections.routes');
const enrollmentsRoutes = require('./enrollments.routes');
const assignmentsRoutes = require('./assignments.routes');
const submissionsRoutes = require('./submissions.routes');
const gradesRoutes = require('./grades.routes');
const documentsRoutes = require('./documents.routes');
const notificationsRoutes = require('./notifications.routes');

const uploadRoutes = require('./upload.routes');

router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/roles', rolesRoutes);
router.use('/permissions', permissionsRoutes);
router.use('/studentProfiles', studentProfilesRoutes);
router.use('/teacherProfiles', teacherProfilesRoutes);

router.use('/courses', coursesRoutes);
router.use('/sections', sectionsRoutes);
router.use('/enrollments', enrollmentsRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/submissions', submissionsRoutes);
router.use('/grades', gradesRoutes);
router.use('/documents', documentsRoutes);
router.use('/notifications', notificationsRoutes);

router.use('/upload', uploadRoutes);

module.exports = router;

