const { Academic_Year } = require('../models'); // adjust path if needed

// Create a new academic year
const createAcademicYear = async (req, res) => {
  try {
    const { academic_year, start_date, end_date } = req.body;

    // Basic validation
    if (!academic_year || !start_date || !end_date) {
      return res.status(400).json({ message: "Academic year, start date, and end date are required" });
    }

    const newYear = await Academic_Year.create({
      academic_year,
      start_date,
      end_date
    });

    res.status(201).json({ message: "Academic year created", data: newYear });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all academic years
const getAcademicYears = async (req, res) => {
  try {
    const years = await Academic_Year.findAll();
    res.status(200).json({ data: years });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single academic year by ID
const getAcademicYearById = async (req, res) => {
  try {
    const { id } = req.params;
    const year = await Academic_Year.findByPk(id);
    if (!year) return res.status(404).json({ message: "Academic year not found" });
    res.status(200).json({ data: year });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update academic year
const updateAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const { academic_year, start_date, end_date } = req.body;

    const year = await Academic_Year.findByPk(id);
    if (!year) return res.status(404).json({ message: "Academic year not found" });

    await year.update({ academic_year, start_date, end_date });
    res.status(200).json({ message: "Academic year updated", data: year });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete academic year
const deleteAcademicYear = async (req, res) => {
  try {
    const { id } = req.params;
    const year = await Academic_Year.findByPk(id);
    if (!year) return res.status(404).json({ message: "Academic year not found" });

    await year.destroy();
    res.status(200).json({ message: "Academic year deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createAcademicYear,
  getAcademicYears,
  getAcademicYearById,
  updateAcademicYear,
  deleteAcademicYear
};
