const { caste_master } = require('../models'); // adjust path if needed

// Create a new caste
const createCaste = async (req, res) => {
  try {
    const { cast_name } = req.body;

    if (!cast_name) {
      return res.status(400).json({ message: "Caste name is required" });
    }

    const newCaste = await caste_master.create({ value:cast_name });
    res.status(201).json({ message: "Caste created", data: newCaste });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all castes
const getCastes = async (req, res) => {
  try {
    const castes = await caste_master.findAll();
    res.status(200).json({ data: castes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single caste by ID
const getCasteById = async (req, res) => {
  try {
    const { id } = req.params;
    const caste = await caste_master.findByPk(id);
    if (!caste) return res.status(404).json({ message: "Caste not found" });
    res.status(200).json({ data: caste });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update caste
const updateCaste = async (req, res) => {
  try {
    const { id } = req.params;
    const { cast_name } = req.body;

    const caste = await caste_master.findByPk(id);
    if (!caste) return res.status(404).json({ message: "Caste not found" });

    await caste.update({ cast_name });
    res.status(200).json({ message: "Caste updated", data: caste });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete caste
const deleteCaste = async (req, res) => {
  try {
    const { id } = req.params;
    const caste = await caste_master.findByPk(id);
    if (!caste) return res.status(404).json({ message: "Caste not found" });

    await caste.destroy();
    res.status(200).json({ message: "Caste deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createCaste,
  getCastes,
  getCasteById,
  updateCaste,
  deleteCaste
};
