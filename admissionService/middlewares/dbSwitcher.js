// middlewares/dbSwitcher.js
const { getDbForYear } = require('../config/databaseManager');

const dbSwitcher = async (req, res, next) => {
  try {
    let year = req.headers['x-school-year'] || 
               req.query.year || 
               req.body.year;

    // If year not passed in request, use from authenticated user
    if (!year && req.user && req.user.currentYear) {
      year = req.user.currentYear;
    }

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Academic year is required. Please switch year first.'
      });
    }

    const db = await getDbForYear(year);

    req.db = db;
    req.sequelize = db.sequelize;
    req.models = db;
    req.currentYear = year;

    next();
  } catch (error) {
    console.error('Database switch error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to connect to database for selected year'
    });
  }
};

module.exports = dbSwitcher;