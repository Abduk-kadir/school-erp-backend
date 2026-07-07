const asyncHandler = require('express-async-handler');
const { class_master } = require('../models'); // adjust path if needed
const { Op } = require('sequelize');
const { getDataTable } = require('../helper');

// Create a new class
const createClass = asyncHandler(async (req, res) => {
  const { class_name, class_code, status, admission_form_fee } = req.body;

  // Basic validation
  if (!class_name || !class_code) {
    return res.status(400).json({ message: "Class name and Class code are required" });
  }

  const newClass = await class_master.create({
    class_name,
    class_code,
    status,
    admission_form_fee
  });

  res.status(201).json({ message: "Class created", data: newClass });
});

const getClasses = asyncHandler(async (req, res) => {
  const result = await getDataTable(req, class_master, ['class_name','class_code','fall_in_category']);
  res.json(result);
});


const getClassById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cls = await class_master.findByPk(id);
  if (!cls) return res.status(404).json({ message: "Class not found" });
  res.status(200).json({ data: cls });
});

// Update class
const updateClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { class_name, class_code, status, admission_form_fee } = req.body;

  const cls = await class_master.findByPk(id);
  if (!cls) return res.status(404).json({ message: "Class not found" });

  await cls.update({ class_name, class_code, status, admission_form_fee });

  res.status(200).json({ message: "Class updated", data: cls });
});

// Delete class
const deleteClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const cls = await class_master.findByPk(id);
  if (!cls) return res.status(404).json({ message: "Class not found" });

  await cls.destroy();
  res.status(200).json({ message: "Class deleted" });
});

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass
};
