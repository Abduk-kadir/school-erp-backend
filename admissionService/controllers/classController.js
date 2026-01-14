const { class_master } = require('../models'); // adjust path if needed
const { Op } = require('sequelize');
const { getDataTable } = require('../helper');

// Create a new class
const createClass = async (req, res) => {
  try {
    const { class_name, class_code, fall_in_category, status, admission_form_fee } = req.body;

    // Basic validation
    if (!class_name || !class_code) {
      return res.status(400).json({ message: "Class name and Class code are required" });
    }

    const newClass = await class_master.create({
      class_name,
      class_code,
      fall_in_category,
      status,
      admission_form_fee
    });

    res.status(201).json({ message: "Class created", data: newClass });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const getClasses = async (req, res) => {
  try {
    const result = await getDataTable(req, class_master, ['class_name','class_code','fall_in_category']);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all classes
//const getClasses = async (req, res) => {
 // try {
    /*console.log('draw',req.query.draw)
    console.log('start',req.query.start)
    console.log('length',req.query.length)
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
     const search = req.query['search[value]'] || req.query.search?.value || "";

    const classes = await class_master.findAll();
    let filterData=classes*/
   
    /*  if (search) {
      const searchLower = search.toLowerCase();
      filterData = classes.filter(row => 
        row.class_name?.toLowerCase().includes(searchLower) ||
        row.class_code?.toLowerCase().includes(searchLower) ||
        row.fall_in_category?.toLowerCase().includes(searchLower)
      );
    }*/
   
   // const dataSlice = filterData.slice(start,start + length);
 /*const { draw, recordsTotal, recordsFiltered, data } = await getDataTable(
  req,
  class_master,
  ['class_name','class_code','fall_in_category']
);*/
/*res.json({ draw, recordsTotal, recordsFiltered, data });
    res.status(200).json({ 
      draw,
      recordsTotal: classes.length,
      recordsFiltered:filterData.length,
      data: dataSlice
    });*/
  /*  res.json({ draw, recordsTotal, recordsFiltered, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
*/
// Get single class by ID
const getClassById = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await class_master.findByPk(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });
    res.status(200).json({ data: cls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update class
const updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_name, class_code, fall_in_category, status, admission_form_fee } = req.body;

    const cls = await class_master.findByPk(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    await cls.update({ class_name, class_code, fall_in_category, status, admission_form_fee });

    res.status(200).json({ message: "Class updated", data: cls });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete class
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;
    const cls = await class_master.findByPk(id);
    if (!cls) return res.status(404).json({ message: "Class not found" });

    await cls.destroy();
    res.status(200).json({ message: "Class deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createClass,
  getClasses,
  getClassById,
  updateClass,
  deleteClass
};
