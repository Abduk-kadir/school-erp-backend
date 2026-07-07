const asyncHandler = require('express-async-handler');
const { division_master } = require('../models'); // adjust path if needed

// Create a new division
const createDivision = asyncHandler(async (req, res) => {
  const { division_name, division_code } = req.body;

  if (!division_name || !division_code) {
    return res.status(400).json({success:false, message: "Division name and code are required" });
  }

  const newDivision = await division_master.create({ division_name, division_code });
  res.status(201).json({success:true, message: "Division created", data: newDivision });
});

// Get all divisions
const getDivisions = asyncHandler(async (req, res) => {
  const divisions = await division_master.findAll();
  res.status(200).json({ data: divisions ,success:true});
});

// Get single division by ID
const getDivisionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const division = await division_master.findByPk(id);
  if (!division) return res.status(404).json({success:false, message: "Division not found" });
  res.status(200).json({success:true, data: division });
});

// Update division
const updateDivision = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { division_name, division_code } = req.body;

  const division = await division_master.findByPk(id);
  if (!division) return res.status(404).json({success:false, message: "Division not found" });

  await division.update({ division_name, division_code });
  res.status(200).json({success:true, message: "Division updated", data: division });
});

// Delete division
const deleteDivision = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const division = await division_master.findByPk(id);
  if (!division) return res.status(404).json({success:false, message: "Division not found" });

  await division.destroy();
  res.status(200).json({ success:true,message: "Division deleted" });
});

module.exports = {
  createDivision,
  getDivisions,
  getDivisionById,
  updateDivision,
  deleteDivision
};
