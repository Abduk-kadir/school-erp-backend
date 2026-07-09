const getTokenFromHeader = require('../utils/getTokenFromHeader');
const verifyToken = require('../utils/verifyToken');
const { StaffRegistration } = require('../models');

const verifystaff = async (req, res, next) => {
  try {
    const token = getTokenFromHeader(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided'
      });
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    const staff = await StaffRegistration.findByPk(decoded.id);

    if (!staff) {
      return res.status(401).json({
        success: false,
        message: 'Staff not found'
      });
    }

    req.staff = staff.id;
    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = verifystaff;
