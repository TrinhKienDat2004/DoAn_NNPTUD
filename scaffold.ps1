param(
  [string]$Root = "."
)

# Scaffold a RESTful Node.js + Express + MongoDB (Mongoose) project skeleton
# that matches the task partition (A/B/C/D) without implementing full business logic.

$ErrorActionPreference = "Stop"

function Ensure-Dir($p) {
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
}

function Write-File-If-Missing($path, $content) {
  if (-not (Test-Path $path)) {
    $parent = Split-Path $path -Parent
    Ensure-Dir $parent
    Set-Content -Path $path -Value $content -Encoding UTF8
  }
}

$rootAbs = (Resolve-Path -Path $Root).Path

# Folders (must exist for clone)
Ensure-Dir "$rootAbs/client"
Ensure-Dir "$rootAbs/docs/postman"
Ensure-Dir "$rootAbs/uploads/avatars"
Ensure-Dir "$rootAbs/uploads/documents"
Ensure-Dir "$rootAbs/uploads/submissions"
Ensure-Dir "$rootAbs/uploads/tmp"

Ensure-Dir "$rootAbs/src/config/db"
Ensure-Dir "$rootAbs/src/routes/v1"
Ensure-Dir "$rootAbs/src/controllers/v1"
Ensure-Dir "$rootAbs/src/models"
Ensure-Dir "$rootAbs/src/middlewares"
Ensure-Dir "$rootAbs/src/utils"
Ensure-Dir "$rootAbs/src/validators"
Ensure-Dir "$rootAbs/src/services"
Ensure-Dir "$rootAbs/src/swagger"

# .gitignore (do not commit secrets/uploads)
$gitignore = @"
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
.env
.env.*
uploads/
.vscode/
.idea/
dist/
build/
coverage/
"@
Write-File-If-Missing "$rootAbs/.gitignore" $gitignore

# Package.json
$packageJson = @"
{
  "name": "doan-nnptud",
  "version": "1.0.0",
  "private": true,
  "main": "app.js",
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-validator": "^7.2.0",
    "helmet": "^7.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.3.1",
    "morgan": "^1.10.0",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
"@
Write-File-If-Missing "$rootAbs/package.json" $packageJson

# .env.example
$envExample = @"
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/doan_nnptud
JWT_SECRET=change_me_super_secret
JWT_EXPIRES_IN=7d
SEED_DEFAULTS=false
UPLOAD_BASE_URL=http://localhost:3000/uploads
"@
Write-File-If-Missing "$rootAbs/.env.example" $envExample

# app.js (mount routes)
$appJs = @"
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectMongo } = require('./src/config/db/mongoose');
const { notFoundHandler, errorHandler } = require('./src/utils/errorHandlers');
const v1Routes = require('./src/routes/v1/index.routes');

const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/health', (req, res) => res.status(200).json({ ok: true }));
app.use('/api/v1', v1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
async function start() {
  await connectMongo();
  app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
}
start().catch((err) => {
  console.error(err);
  process.exit(1);
});
"@
Write-File-If-Missing "$rootAbs/app.js" $appJs

# mongoose connection
$mongooseJs = @"
const mongoose = require('mongoose');
async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('Missing MONGODB_URI in .env');
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}
module.exports = { connectMongo };
"@
Write-File-If-Missing "$rootAbs/src/config/db/mongoose.js" $mongooseJs

# error handlers
$errHandlers = @"
function notFoundHandler(req, res) {
  res.status(404).json({ status: 'fail', message: 'Route not found' });
}
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || err.status || 500;
  res.status(statusCode).json({ status: 'error', message: err.message || 'Internal Server Error' });
}
module.exports = { notFoundHandler, errorHandler };
"@
Write-File-If-Missing "$rootAbs/src/utils/errorHandlers.js" $errHandlers

# validateRequest
$validateRequest = @"
const { validationResult } = require('express-validator');
function validateRequest(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'fail', message: 'Validation error', errors: errors.array() });
  }
  next();
}
module.exports = { validateRequest };
"@
Write-File-If-Missing "$rootAbs/src/utils/validateRequest.js" $validateRequest

# Middlewares stubs
$authMw = @"
async function authMiddleware(req, res, next) {
  return res.status(501).json({ status: 'fail', message: 'authMiddleware not implemented (A)' });
}
module.exports = { authMiddleware };
"@
Write-File-If-Missing "$rootAbs/src/middlewares/auth.middleware.js" $authMw

$authorizeMw = @"
function authorize() {
  return async (req, res, next) => res.status(501).json({ status: 'fail', message: 'authorize not implemented (A)' });
}
module.exports = { authorize };
"@
Write-File-If-Missing "$rootAbs/src/middlewares/authorize.middleware.js" $authorizeMw

$uploadMw = @"
function makeFileUrl(destSubdir, filename) {
  const base = process.env.UPLOAD_BASE_URL || 'http://localhost:3000/uploads';
  return `${base}/${destSubdir}/${filename}`;
}

// For rubric, members should implement multer storage + field filtering.
const avatarUpload = (req, res, next) => res.status(501).json({ status: 'fail', message: 'avatar upload not implemented (A)' });
const documentUpload = (req, res, next) => res.status(501).json({ status: 'fail', message: 'document upload not implemented (C)' });
const submissionUpload = (req, res, next) => res.status(501).json({ status: 'fail', message: 'submission upload not implemented (C)' });

module.exports = { avatarUpload, documentUpload, submissionUpload, makeFileUrl };
"@
Write-File-If-Missing "$rootAbs/src/middlewares/upload.middleware.js" $uploadMw

# Controllers stubs
$stubCrud = @"
async function list(req, res) { return res.status(501).json({ status: 'fail', message: 'CRUD list not implemented' }); }
async function getById(req, res) { return res.status(501).json({ status: 'fail', message: 'CRUD getById not implemented' }); }
async function create(req, res) { return res.status(501).json({ status: 'fail', message: 'CRUD create not implemented' }); }
async function updateById(req, res) { return res.status(501).json({ status: 'fail', message: 'CRUD update not implemented' }); }
async function deleteById(req, res) { return res.status(501).json({ status: 'fail', message: 'CRUD delete not implemented' }); }
module.exports = { list, getById, create, updateById, deleteById };
"@

Write-File-If-Missing "$rootAbs/src/controllers/v1/auth.controller.js" @"
async function register(req, res) { return res.status(501).json({ status: 'fail', message: 'register not implemented (A)' }); }
async function login(req, res) { return res.status(501).json({ status: 'fail', message: 'login not implemented (A)' }); }
module.exports = { register, login };
"@

Write-File-If-Missing "$rootAbs/src/controllers/v1/users.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/roles.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/permissions.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/studentProfiles.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/teacherProfiles.controller.js" $stubCrud

Write-File-If-Missing "$rootAbs/src/controllers/v1/courses.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/sections.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/enrollments.controller.js" $stubCrud

Write-File-If-Missing "$rootAbs/src/controllers/v1/assignments.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/submissions.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/grades.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/documents.controller.js" $stubCrud
Write-File-If-Missing "$rootAbs/src/controllers/v1/notifications.controller.js" $stubCrud

# resource routes stubs
function writeRoutes([string]$routePath, [string]$content) {
  Write-File-If-Missing $routePath $content
}

writeRoutes "$rootAbs/src/routes/v1/index.routes.js" @"
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

module.exports = router;
"@

# Each routes file
writeRoutes "$rootAbs/src/routes/v1/auth.routes.js" @"
const express = require('express');
const router = express.Router();
const { register, login } = require('../../controllers/v1/auth.controller');
const { validateRequest } = require('../../utils/validateRequest');
// Validators can be added by A

router.post('/register', validateRequest, register);
router.post('/login', validateRequest, login);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/users.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { avatarUpload, makeFileUrl } = require('../../middlewares/upload.middleware');
const usersController = require('../../controllers/v1/users.controller');

router.use(authMiddleware);
router.post('/:id/avatar', avatarUpload, (req, res, next) => { req.fileUrl = req.fileUrl || ''; next(); }, (req, res) => res.status(501).json({ status: 'fail', message: 'upload avatar not implemented' }));

router.get('/', authorize({ permissions: ['users:manage'] }), usersController.list);
router.post('/', authorize({ permissions: ['users:manage'] }), usersController.create);
router.get('/:id', authorize({ permissions: ['users:manage'] }), usersController.getById);
router.put('/:id', authorize({ permissions: ['users:manage'] }), usersController.updateById);
router.delete('/:id', authorize({ permissions: ['users:manage'] }), usersController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/roles.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const rolesController = require('../../controllers/v1/roles.controller');

router.use(authMiddleware);
router.get('/', authorize({ roles: ['ADMIN'] }), rolesController.list);
router.post('/', authorize({ roles: ['ADMIN'] }), rolesController.create);
router.get('/:id', authorize({ roles: ['ADMIN'] }), rolesController.getById);
router.put('/:id', authorize({ roles: ['ADMIN'] }), rolesController.updateById);
router.delete('/:id', authorize({ roles: ['ADMIN'] }), rolesController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/permissions.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const permissionsController = require('../../controllers/v1/permissions.controller');

router.use(authMiddleware);
router.get('/', authorize({ roles: ['ADMIN'] }), permissionsController.list);
router.post('/', authorize({ roles: ['ADMIN'] }), permissionsController.create);
router.get('/:id', authorize({ roles: ['ADMIN'] }), permissionsController.getById);
router.put('/:id', authorize({ roles: ['ADMIN'] }), permissionsController.updateById);
router.delete('/:id', authorize({ roles: ['ADMIN'] }), permissionsController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/studentProfiles.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const studentProfilesController = require('../../controllers/v1/studentProfiles.controller');

router.use(authMiddleware);
router.get('/', authorize({ roles: ['ADMIN'] }), studentProfilesController.list);
router.post('/', authorize({ roles: ['ADMIN'] }), studentProfilesController.create);
router.get('/:id', authorize({ roles: ['ADMIN'] }), studentProfilesController.getById);
router.put('/:id', authorize({ roles: ['ADMIN'] }), studentProfilesController.updateById);
router.delete('/:id', authorize({ roles: ['ADMIN'] }), studentProfilesController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/teacherProfiles.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const teacherProfilesController = require('../../controllers/v1/teacherProfiles.controller');

router.use(authMiddleware);
router.get('/', authorize({ roles: ['ADMIN'] }), teacherProfilesController.list);
router.post('/', authorize({ roles: ['ADMIN'] }), teacherProfilesController.create);
router.get('/:id', authorize({ roles: ['ADMIN'] }), teacherProfilesController.getById);
router.put('/:id', authorize({ roles: ['ADMIN'] }), teacherProfilesController.updateById);
router.delete('/:id', authorize({ roles: ['ADMIN'] }), teacherProfilesController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/courses.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const coursesController = require('../../controllers/v1/courses.controller');

router.use(authMiddleware);
router.get('/', coursesController.list);
router.post('/', authorize({ permissions: ['courses:manage'] }), coursesController.create);
router.get('/:id', coursesController.getById);
router.put('/:id', authorize({ permissions: ['courses:manage'] }), coursesController.updateById);
router.delete('/:id', authorize({ permissions: ['courses:manage'] }), coursesController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/sections.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const sectionsController = require('../../controllers/v1/sections.controller');

router.use(authMiddleware);
router.get('/', sectionsController.list);
router.post('/', authorize({ permissions: ['sections:manage'] }), sectionsController.create);
router.get('/:id', sectionsController.getById);
router.put('/:id', authorize({ permissions: ['sections:manage'] }), sectionsController.updateById);
router.delete('/:id', authorize({ permissions: ['sections:manage'] }), sectionsController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/enrollments.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const enrollmentsController = require('../../controllers/v1/enrollments.controller');

router.use(authMiddleware);
router.get('/', enrollmentsController.list);
router.post('/', authorize({ permissions: ['enrollments:manage'] }), enrollmentsController.create);
router.get('/:id', enrollmentsController.getById);
router.put('/:id', authorize({ permissions: ['enrollments:manage'] }), enrollmentsController.updateById);
router.delete('/:id', authorize({ permissions: ['enrollments:manage'] }), enrollmentsController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/assignments.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const assignmentsController = require('../../controllers/v1/assignments.controller');

router.use(authMiddleware);
router.get('/', assignmentsController.list);
router.post('/', authorize({ permissions: ['assignments:manage'] }), assignmentsController.create);
router.get('/:id', assignmentsController.getById);
router.put('/:id', authorize({ permissions: ['assignments:manage'] }), assignmentsController.updateById);
router.delete('/:id', authorize({ permissions: ['assignments:manage'] }), assignmentsController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/submissions.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { submissionUpload, makeFileUrl } = require('../../middlewares/upload.middleware');
const submissionsController = require('../../controllers/v1/submissions.controller');

router.use(authMiddleware);
router.get('/', submissionsController.list);
router.get('/:id', submissionsController.getById);

router.post('/', authorize({ permissions: ['submissions:manage'] }), submissionUpload, (req, res, next) => {
  // controller will use req.fileUrl
  req.fileUrl = req.fileUrl || '';
  next();
}, submissionsController.create);

router.put('/:id', authorize({ permissions: ['submissions:manage'] }), submissionsController.updateById);
router.delete('/:id', authorize({ permissions: ['submissions:manage'] }), submissionsController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/grades.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const gradesController = require('../../controllers/v1/grades.controller');

router.use(authMiddleware);
router.get('/', gradesController.list);
router.post('/', authorize({ permissions: ['grades:manage'] }), gradesController.create);
router.get('/:id', gradesController.getById);
router.put('/:id', authorize({ permissions: ['grades:manage'] }), gradesController.updateById);
router.delete('/:id', authorize({ permissions: ['grades:manage'] }), gradesController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/documents.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const { authorize } = require('../../middlewares/authorize.middleware');
const { documentUpload, makeFileUrl } = require('../../middlewares/upload.middleware');
const documentsController = require('../../controllers/v1/documents.controller');

router.use(authMiddleware);
router.get('/', documentsController.list);
router.get('/:id', documentsController.getById);

router.post('/', authorize({ permissions: ['documents:upload'] }), documentUpload, (req, res, next) => {
  req.fileUrl = req.fileUrl || '';
  next();
}, documentsController.create);

router.put('/:id', authorize({ permissions: ['documents:upload'] }), documentsController.updateById);
router.delete('/:id', authorize({ permissions: ['documents:upload'] }), documentsController.deleteById);

module.exports = router;
"@

writeRoutes "$rootAbs/src/routes/v1/notifications.routes.js" @"
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../../middlewares/auth.middleware');
const notificationsController = require('../../controllers/v1/notifications.controller');

router.use(authMiddleware);
router.get('/', notificationsController.list);
router.post('/', notificationsController.create);
router.get('/:id', notificationsController.getById);
router.put('/:id', notificationsController.updateById);
router.delete('/:id', notificationsController.deleteById);

module.exports = router;
"@

Write-File-If-Missing "$rootAbs/src/validators/auth.validator.js" @"
// A sẽ bổ sung validate request cho register/login
module.exports = {};
"@

# Model stubs (Mongoose schemas)
$modelStub = @"
const mongoose = require('mongoose');
const schema = new mongoose.Schema({ isDeleted: { type: Boolean, default: false } }, { timestamps: true });
module.exports = mongoose.model('MODEL_NAME', schema);
"@

Write-File-If-Missing "$rootAbs/src/models/role.model.js" ($modelStub.Replace('MODEL_NAME', 'Role'))
Write-File-If-Missing "$rootAbs/src/models/permission.model.js" ($modelStub.Replace('MODEL_NAME', 'Permission'))
Write-File-If-Missing "$rootAbs/src/models/rolePermission.model.js" ($modelStub.Replace('MODEL_NAME', 'RolePermission'))
Write-File-If-Missing "$rootAbs/src/models/user.model.js" ($modelStub.Replace('MODEL_NAME', 'User'))
Write-File-If-Missing "$rootAbs/src/models/studentProfile.model.js" ($modelStub.Replace('MODEL_NAME', 'StudentProfile'))
Write-File-If-Missing "$rootAbs/src/models/teacherProfile.model.js" ($modelStub.Replace('MODEL_NAME', 'TeacherProfile'))
Write-File-If-Missing "$rootAbs/src/models/course.model.js" ($modelStub.Replace('MODEL_NAME', 'Course'))
Write-File-If-Missing "$rootAbs/src/models/courseSection.model.js" ($modelStub.Replace('MODEL_NAME', 'CourseSection'))
Write-File-If-Missing "$rootAbs/src/models/enrollment.model.js" ($modelStub.Replace('MODEL_NAME', 'Enrollment'))
Write-File-If-Missing "$rootAbs/src/models/assignment.model.js" ($modelStub.Replace('MODEL_NAME', 'Assignment'))
Write-File-If-Missing "$rootAbs/src/models/submission.model.js" ($modelStub.Replace('MODEL_NAME', 'Submission'))
Write-File-If-Missing "$rootAbs/src/models/grade.model.js" ($modelStub.Replace('MODEL_NAME', 'Grade'))
Write-File-If-Missing "$rootAbs/src/models/document.model.js" ($modelStub.Replace('MODEL_NAME', 'Document'))
Write-File-If-Missing "$rootAbs/src/models/notification.model.js" ($modelStub.Replace('MODEL_NAME', 'Notification'))

Write-File-If-Missing "$rootAbs/README.md" "# DoAn_NNPTUD - Starter skeleton generated by scaffold.ps1`n"

Write-File-If-Missing "$rootAbs/client/.gitkeep" "# placeholder"
Write-File-If-Missing "$rootAbs/docs/postman/.gitkeep" "# placeholder"

Write-File-If-Missing "$rootAbs/uploads/avatars/.gitkeep" "# placeholder"
Write-File-If-Missing "$rootAbs/uploads/documents/.gitkeep" "# placeholder"
Write-File-If-Missing "$rootAbs/uploads/submissions/.gitkeep" "# placeholder"
Write-File-If-Missing "$rootAbs/uploads/tmp/.gitkeep" "# placeholder"

Write-File-If-Missing "$rootAbs/src/routes/v1/.gitkeep" "# placeholder"
Write-File-If-Missing "$rootAbs/src/controllers/v1/.gitkeep" "# placeholder"
Write-File-If-Missing "$rootAbs/src/models/.gitkeep" "# placeholder"
Write-File-If-Missing "$rootAbs/src/middlewares/.gitkeep" "# placeholder"
Write-File-If-Missing "$rootAbs/src/utils/.gitkeep" "# placeholder"

Write-Host "Scaffold done in: $rootAbs"

