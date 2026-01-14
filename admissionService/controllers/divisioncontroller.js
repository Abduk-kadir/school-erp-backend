const { division_master } = require('../models'); // adjust path if needed

// Create a new division
const createDivision = async (req, res) => {
  try {
    const { division_name, division_code } = req.body;

    if (!division_name || !division_code) {
      return res.status(400).json({ message: "Division name and code are required" });
    }

    const newDivision = await division_master.create({ division_name, division_code });
    res.status(201).json({ message: "Division created", data: newDivision });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all divisions
const getDivisions = async (req, res) => {
  try {
    const divisions = await division_master.findAll();
    res.status(200).json({ data: divisions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single division by ID
const getDivisionById = async (req, res) => {
  try {
    const { id } = req.params;
    const division = await division_master.findByPk(id);
    if (!division) return res.status(404).json({ message: "Division not found" });
    res.status(200).json({ data: division });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update division
const updateDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const { division_name, division_code } = req.body;

    const division = await division_master.findByPk(id);
    if (!division) return res.status(404).json({ message: "Division not found" });

    await division.update({ division_name, division_code });
    res.status(200).json({ message: "Division updated", data: division });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete division
const deleteDivision = async (req, res) => {
  try {
    const { id } = req.params;
    const division = await division_master.findByPk(id);
    if (!division) return res.status(404).json({ message: "Division not found" });

    await division.destroy();
    res.status(200).json({ message: "Division deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createDivision,
  getDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision
};
