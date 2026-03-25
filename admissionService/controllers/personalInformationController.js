const { raw } = require('express');
const {PersonalInformation,institute,sequelize} = require('../models'); // adjust path if needed
const generateToken=require('../utils/generateToken')
const { Op } = require("sequelize");

const createPersonalInformation = async (req, res) => {
  console.log('create personal information is called');

  try {
    const data = req.body;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided' });
    }

    // Add timestamps manually (MySQL-friendly)
    const now = new Date();           // or use Sequelize.fn('NOW') if you prefer
    data.createdAt = now;
    data.updatedAt = now;

    const columns = Object.keys(data);
    const columnNames = columns.map(c => `\`${c}\``).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(data);
    console.log('column name is**********',columnNames)
    console.log('values is**********',values)
    const insertQuery = `
      INSERT INTO \`personalinformations\` (${columnNames})
      VALUES (${placeholders})
    `;

    const [result] = await sequelize.query(insertQuery, {
      replacements: values,
      type: sequelize.QueryTypes.INSERT
    });

    const insertedId = result;  // usually the inserted ID in MySQL

    if (!insertedId) {
      throw new Error('Failed to get inserted ID');
    }

    // ── Generate reg_no ───────────────────────────────────────
    const inst = await institute.findOne();
    if (!inst?.code) {
      throw new Error('Institute code not found');
    }

    const year = new Date().getFullYear();
   const yy = year.toString().slice(-2);
   const paddedId = String(insertedId).padStart(4, '0'); // adjust padding if needed

  
   const reg_no = Number(`${yy}${inst.code}${paddedId}`)
   

    // Update reg_no
    await sequelize.query(
      'UPDATE `personalinformations` SET `reg_no` = ? WHERE `id` = ?',
      { replacements: [reg_no, insertedId], type: sequelize.QueryTypes.UPDATE }
    );

    return res.status(201).json({
      success: true,
      message: 'Personal information created successfully',
      data: {reg_no:reg_no},
      id: insertedId
    });

  } catch (error) {
    console.error('Create error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
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

const getPersonalInformationbyRegNO = async (req, res) => {
  try {
    const { reg_no } = req.params;
    console.log('reg**',reg_no)

    if (!reg_no) {
      return res.status(400).json({
        success: false,
        message: 'reg_no is required'
      });
    }

    const [records] = await sequelize.query(`
      SELECT *
      FROM personalinformations WHERE personalinformations.reg_no = :reg_no
    `, {
      replacements: { reg_no },
      type: sequelize.QueryTypes.SELECT
    });

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'personal information not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: records
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}

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

const getAllColumns = async (req, res) => {
  try {
    console.log('get all coluns is called***********************')
    const columns = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'personalinformations' AND TABLE_SCHEMA = DATABASE()`,
      { type: sequelize.QueryTypes.SELECT }
    );

    const columnNames = columns.map(col => col.COLUMN_NAME).filter(name => name !== 'id');

    return res.status(200).json({
      success: true,
      data: columnNames
    });
  } catch (error) {
    console.error('Get columns error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}
const bulkUpdatePersonalInformation = async (req, res) => {
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
        UPDATE \`personalinformations\`
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
};

const updatePersonalInformation = async (req, res) => {
  try {
    const { reg_no, ...updateData } = req.body; // Destructure: reg_no separate, rest are fields to update

    if (!reg_no) {
      return res.status(400).json({ success: false, message: 'reg_no is required' });
    }

    const columns = Object.keys(updateData);
    if (columns.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update provided' });
    }

    // Build SET clause dynamically: `column1` = ?, `column2` = ?, ...
    const setClause = columns.map(c => `\`${c}\` = ?`).join(', ');
    const values = columns.map(c => updateData[c]); // values in order

    // Add reg_no at the end for WHERE
    values.push(reg_no);

    const updateQuery = `
      UPDATE \`personalinformations\`
      SET ${setClause}
      WHERE \`reg_no\` = ?
    `;
    console.log('setClause *******************',setClause)
    console.log('values *******************',values)
    console.log('query is *******************',updateQuery)
    // Execute UPDATE
    const [updateResult] = await sequelize.query(updateQuery, {
      replacements: values,
      type: sequelize.QueryTypes.UPDATE
    });

    // Check if anything was updated
    if (updateResult === 0) { // affected rows = 0
      return res.status(404).json({
        success: false,
        message: 'No record found with this reg_no or no changes applied',
      });
    }

   

    return res.status(200).json({
      success: true,
      message: 'Other information updated successfully',
     
    });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating record',
      error: error.message,
    });
  }
};
// ────────────────────────────────────────────────





module.exports = {
  createPersonalInformation,
  getPersonalInformationbyEmail,
  login,
  getAllPersonalInformation,
  getAllColumns,
  updatePersonalInformation,
  bulkUpdatePersonalInformation,
  getPersonalInformationbyRegNO
};
