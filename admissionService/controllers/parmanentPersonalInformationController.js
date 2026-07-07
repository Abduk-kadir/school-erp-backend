const asyncHandler = require('express-async-handler');
const { par_student_personal_information, studentFcmtoken, sequelize } = require('../models');
const { Op } = require('sequelize');
const generateToken = require('../utils/generateToken');

const ParmanentPersonalInformation = {
  login: asyncHandler(async (req, res) => {
    const { email,reg_no, password, fcmToken } = req.body;
    console.log('fcm token is***********:',fcmToken)
    const data = await par_student_personal_information.findOne({
      where: { [Op.and]: [{ email }, { password },{reg_no}] },
      raw: true,
    });
    if (!data) return res.status(404).json({ message: 'email or passwor is not correct' });

    if (fcmToken) {
      const existing = await studentFcmtoken.findOne({
        where: { studentid: data.id },
      });
      if (existing) {
        await existing.update({ token: fcmToken });
      } else {
        await studentFcmtoken.create({ studentid: data.id, token: fcmToken });
      }
    }

    const token = generateToken({ reg_no: data.id });
    res.status(200).json({ success: true, token, reg_no: data.reg_no });
  }),

 
  create: asyncHandler(async (req, res) => {
    const {
      reg_no,
      first_name,
      last_name,
      father_name,
      class: classId,
      feegroupid,
      division,
      contact_number,
      password,
      dob,
      blood_groop,
    } = req.body;

    const row = await par_student_personal_information.create({
      reg_no,
      first_name,
      last_name,
      father_name,
      class: classId,
      feegroupid,
      division,
      contact_number,
      password,
      dob,
      blood_groop,
    });

    res.status(201).json({ message: 'Created', data: row });
  }),

  getAll: asyncHandler(async (req, res) => {
    const q = req.query;
    const where = {};

    if (q.class !== undefined && q.class !== '') {
      where.class = parseInt(q.class, 10);
    }
    if (q.reg_no !== undefined && q.reg_no !== '') {
      where.reg_no = q.reg_no;
    }
    if (q.division !== undefined && q.division !== '') {
      where.division = parseInt(q.division, 10);
    }
    if (q.feegroupid !== undefined && q.feegroupid !== '') {
      where.feegroupid = parseInt(q.feegroupid, 10);
    }

    const rows = await par_student_personal_information.findAll({
      where: Object.keys(where).length ? where : {},
    });
    res.status(200).json({ success: true, message: 'data fetched successfully', data: rows });
  }),



  getByEmail: asyncHandler(async(req,res)=>{
    const email=req.params.email ?? req.params.Email;
    const data=await par_student_personal_information.findAll({where:{email},raw:true});
    if(!data) return res.status(404).json({message:"personal detail not found"});
    res.status(200).json({success:true,data:data});
  }),
  getByReg: asyncHandler(async (req, res) => {
    const regNoParam = req.params.reg_no ?? req.params.regNo;
    const reg_no = Number(regNoParam);
    if (!Number.isFinite(reg_no)) return res.status(400).json({ message: 'reg_no is required' });

    const row = await par_student_personal_information.findOne({ where: { reg_no } });
    if (!row) return res.status(404).json({ message: 'Student not found', success: false });
    res.status(200).json({ message: 'student is found', data: row, success: true });
  }),

  update: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const {
      reg_no,
      first_name,
      last_name,
      father_name,
      class: classId,
      feegroupid,
      division,
      contact_number,
      password,
      dob,
      blood_groop,
    } = req.body;

    const row = await par_student_personal_information.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });

    await row.update({
      reg_no,
      first_name,
      last_name,
      father_name,
      class: classId,
      feegroupid,
      division,
      contact_number,
      password,
      dob,
      blood_groop,
    });

    res.status(200).json({ message: 'Updated', data: row });
  }),

  remove: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const row = await par_student_personal_information.findByPk(id);
    if (!row) return res.status(404).json({ message: 'Not found' });

    await row.destroy();
    res.status(200).json({ message: 'Deleted' });
  }),

  getAllColumns: asyncHandler(async (req, res) => {
    console.log('get all coluns is called***********************')
    const tableName = par_student_personal_information.getTableName();
    const columns = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :tableName AND TABLE_SCHEMA = DATABASE()`,
      { replacements: { tableName }, type: sequelize.QueryTypes.SELECT }
    );

    const columnNames = columns.map(col => col.COLUMN_NAME).filter(name => name !== 'id');

    return res.status(200).json({
      success: true,
      data: columnNames
    });
  }),

  bulkUpdatePersonalInformation: asyncHandler(async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
      const { records } = req.body;

      if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ success: false, message: 'records array is required and must not be empty' });
      }

      let updatedCount = 0;

      for (const record of records) {
        const { reg_no, ...updateData } = record;

        if (!reg_no) continue;

        const columns = Object.keys(updateData);
        if (columns.length === 0) continue;

        const setClause = columns.map(c => `\`${c}\` = ?`).join(', ');
        const values = columns.map(c => updateData[c]);
        values.push(reg_no);

        const updateQuery = `
          UPDATE \`${par_student_personal_information.getTableName()}\`
          SET ${setClause}
          WHERE \`reg_no\` = ?
        `;

        const [result] = await sequelize.query(updateQuery, {
          replacements: values,
          type: sequelize.QueryTypes.UPDATE,
          transaction
        });

        updatedCount += result;
      }

      await transaction.commit();

      return res.status(200).json({
        success: true,
        message: `${updatedCount} record(s) updated successfully`
      });
    } catch (error) {
      await transaction.rollback();
      console.error('Bulk update error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while bulk updating records',
        error: error.message
      });
    }
  }),

};

module.exports = ParmanentPersonalInformation;
