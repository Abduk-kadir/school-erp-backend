const { raw } = require('express');
const {PersonalInformation,institute} = require('../models'); // adjust path if needed
const generateToken=require('../utils/generateToken')
const { Op } = require("sequelize");

const createPersonalInformation = async (req, res) => {
  try {
    const data = await PersonalInformation.create(req.body);

    const inst = await institute.findOne(); 
    let code=inst?.code
   
    const year = new Date().getFullYear(); // 2026
    const lastTwoDigits = year.toString().slice(-2);
    const reg_no = `${lastTwoDigits}${code}000${data.id}`;
    console.log('reg no is:',reg_no)
    await data.update({ reg_no });

    res.status(201).json({ message: "personal information are created", data:data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const getPersonalInformationbyEmail = async (req, res) => {
  try {
    let {email}=req.body
    const data = await PersonalInformation.findAll({where:{email},raw:true});
    res.status(200).json({ data: data,success:true});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single academic year by ID
const login = async (req, res) => {
  try {
    const {email,reg_no} = req.body;
    const data = await PersonalInformation.findOne({where:{[Op.and]:[{ email: email },{ reg_no: reg_no }]},raw: true});
    if (!data) return res.status(404).json({ message: "personal detail not found" });
    console.log('data is********',data)
    let token=generateToken({reg_no:data?.id})
    res.status(200).json({ success:true,token:token,reg_no: data.reg_no});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// get all personal information
const getAllPersonalInformation = async (req, res) => {
  try {
   
    const data = await PersonalInformation.findAll();
    res.status(200).json({ success:true, data:data});

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
  getPersonalInformationbyEmail,
  login,
  getAllPersonalInformation,
  updatePersonalInformation,
  deletePersonalInformation
};
