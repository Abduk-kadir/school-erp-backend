const asyncHandler = require('express-async-handler');
const { par_student_personal_information, studentFcmtoken} = require('../../models');
const { Op } = require('sequelize');
const generateToken = require('../../utils/generateToken');

const login=asyncHandler(async(req,res)=>{
    const { username,password, device_token,account_type ,academic_year} = req.body;
    if(account_type=='Parent'){
     
    let data = await par_student_personal_information.findOne({
      where: { [Op.and]: [{ email: username }, { password }] },
      raw: true,
    });
    if (!data) {
      data = await par_student_personal_information.findOne({
        where: { [Op.and]: [{ contact_number: username }, { password }] },
        raw: true,
      });
    }
    if (!data) return res.status(404).json({ message: 'username or passwor is not correct' });
    data.url='https://dds-erp.com/dyan-ganaga-webapp/student-dashboard'

    let allData=await par_student_personal_information.findAll({
      where: { contact_number: data.contact_number },
      raw:true
    })
    if (device_token) {
      const existing = await studentFcmtoken.findOne({
        where: { studentid: data.id },
      });
      if (existing) {
        await existing.update({ token: device_token });
      } else {
        await studentFcmtoken.create({ studentid: data.id, token: device_token });
      }
    }
    const token = generateToken({ reg_no: data.id });
    res.status(200).json({ success: true,
      message:"Welcome to School Management System",
       token, 
       data:data,
       academic_year:academic_year,
       account_type:account_type,
       is_from:'permanent',
       number_users:allData.length,
       multiple_user_data:allData

      });

    }
    else{

    }

  })

 const forefullyLogin=asyncHandler(async(req,res)=>{
  const { username,password, device_token,account_type ,academic_year} = req.params;
  if(account_type=='Parent'){
     
    let data = await par_student_personal_information.findOne({
      where: { [Op.and]: [{ email: username }, { password }] },
      raw: true,
    });
    if (!data) {
      data = await par_student_personal_information.findOne({
        where: { [Op.and]: [{ contact_number: username }, { password }] },
        raw: true,
      });
    }
    if (!data) return res.status(404).json({ message: 'username or passwor is not correct' });
    data.url='https://dds-erp.com/dyan-ganaga-webapp/student-dashboard'

    let allData=await par_student_personal_information.findAll({
      where: { contact_number: data.contact_number },
      raw:true
    })
    if (device_token) {
      const existing = await studentFcmtoken.findOne({
        where: { studentid: data.id },
      });
      if (existing) {
        await existing.update({ token: device_token });
      } else {
        await studentFcmtoken.create({ studentid: data.id, token: device_token });
      }
    }
    const token = generateToken({ reg_no: data.id });
    res.status(200).json({ success: true,
      message:"Welcome to School Management System",
       token, 
       data:data,
       academic_year:academic_year,
       account_type:account_type,
       is_from:'permanent',
       number_users:allData.length,
       multiple_user_data:allData

      });

    }
    else{

    }

 })
 const logout=asyncHandler(async(req,res)=>{
  const { device_token } = req.body;
  await studentFcmtoken.destroy({ where: { token: device_token } });
  res.status(200).json({ success: true, message: 'user is logout successfully' });
 })
  module.exports={login,forefullyLogin,logout}
