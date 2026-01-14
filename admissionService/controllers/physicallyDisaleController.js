const { phyically_disable } = require('../models'); // import your model
const { getDataTable } = require('../helper');
// ── Get all disabilities ─────────────────────────────
const getAllDisabilities = async (req, res) => {
  try {
    
    const result = await getDataTable(req, phyically_disable , ['name']);
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Get single disability by ID ──────────────────────
const getDisabilityById = async (req, res) => {
  try {
    const { id } = req.params;
    const disability = await phyically_disable.findByPk(id);
    if (!disability) {
      return res.status(404).json({ message: "Disability not found" });
    }
    res.status(200).json(disability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Create new disability ────────────────────────────
const createDisability = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const newDisability = await phyically_disable.create({ name });
    res.status(201).json(newDisability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Update disability ───────────────────────────────
const updateDisability = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const disability = await phyically_disable.findByPk(id);
    if (!disability) {
      return res.status(404).json({ message: "Disability not found" });
    }

    disability.name = name || disability.name;
    await disability.save();

    res.status(200).json(disability);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ── Delete disability ───────────────────────────────
const deleteDisability = async (req, res) => {
  try {
    const { id } = req.params;
    const disability = await phyically_disable.findByPk(id);
    if (!disability) {
      return res.status(404).json({ message: "Disability not found" });
    }

    await disability.destroy();
    res.status(200).json({ message: "Disability deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getAllDisabilities,
  getDisabilityById,
  createDisability,
  updateDisability,
  deleteDisability,
};
