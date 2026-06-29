// controllers/yearController.js
const { getDbForYear } = require('../config/databaseManager');

// Switch Academic Year
const switchYear = async (req, res) => {
  try {
    const { year } = req.body;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: "Academic year is required"
      });
    }

    // Validate year format (optional)
    if (!/^\d{4}$/.test(year)) {
      return res.status(400).json({
        success: false,
        message: "Invalid year format. Use YYYY (e.g., 2026)"
      });
    }

    // Check if database exists for this year
    await getDbForYear(year);

    // Attach to user (for this request)
    req.currentYear = year;

    // If you are using JWT, you should generate new token with updated year
    let token = null;
    if (req.user) {
      req.user.currentYear = year;
      // If you have JWT, regenerate token here (optional)
      // token = generateNewToken(req.user);
    }

    res.status(200).json({
      success: true,
      message: `Successfully switched to academic year ${year}`,
      year: year,
      // token: token  // Uncomment if using JWT
    });

  } catch (error) {
    console.error("Year switch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to switch academic year",
      error: error.message
    });
  }
};

// Get Current Year
const getCurrentYear = (req, res) => {
  res.json({
    success: true,
    currentYear: req.currentYear || null
  });
};

module.exports = {
  switchYear,
  getCurrentYear
};