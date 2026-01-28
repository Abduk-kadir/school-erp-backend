const {PersonalInformation} = require('../models'); // adjust path if needed

// Create a new academic year
const createPersonalInformation = async (req, res) => {
  try {
    const data = await PersonalInformation.create(req.body);
    res.status(201).json({ message: "personal information are created", data:data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all academic years
const getPersonalInformation = async (req, res) => {
  try {
    const data = await PersonalInformation.findAll();
    res.status(200).json({ data: data,success:true});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single academic year by ID
const getPersonalInformationById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await PersonalInformation.findByPk(id);
    if (!data) return res.status(404).json({ message: "personal detail not found" });
    res.status(200).json({ data: data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update academic year
const updatePersonalInformation = async (req, res) => {
  try {
    const { id } = req.params;
    const p= await PersonalInformation.findByPk(id);
    if (!p) return res.status(404).json({ message: "personal Information not found" });
    await PersonalInformation.update(req?.body,{where:{id:id}});
    res.status(200).json({ message: "Academic year updated", data: req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deletePersonalInformation = async (req, res) => {
  try {
    const { id } = req.params;
    const p= await PersonalInformation.findByPk(id);
    if (!p) return res.status(404).json({ message: "Personal Information not found" });
    await p.destroy();
    res.status(200).json({ message: "Personal Detail deleted",success:true});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createPersonalInformation,
  getPersonalInformation,
  getPersonalInformationById,
  updatePersonalInformation,
  deletePersonalInformation
};
