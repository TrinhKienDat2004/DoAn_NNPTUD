const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (!token || scheme !== 'Bearer') {
    return res.status(401).json({ status: 'fail', message: 'Missing Bearer token' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub).populate('roleId', 'name');

    if (!user || user.isDeleted) {
      return res.status(401).json({ status: 'fail', message: 'Invalid token (user not found)' });
    }

    req.user = {
      id: user._id,
      email: user.email,
      roleId: user.roleId?._id,
      roleName: user.roleId?.name || ''
    };
    next();
  } catch (err) {
    return res.status(401).json({ status: 'fail', message: 'Invalid or expired token' });
  }
}

module.exports = { authMiddleware };

