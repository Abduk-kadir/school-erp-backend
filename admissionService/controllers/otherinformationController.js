const { OtherInformation, PersonalInformation ,sequelize} = require('../models');
const { Op } = require('sequelize');

const createOtherInformation = async (req, res) => {
  try {
    const { reg_no } = req.body;
    if (!reg_no) {
      return res.status(400).json({ success: false, message: 'reg_no is required' });
    }
    const columns = Object.keys(req.body);
    if (columns.length === 0) {
      return res.status(400).json({ success: false, message: 'No data provided' });
    }
    const columnNames = columns.map(c => `\`${c}\``).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const values = Object.values(req.body);

    const query = `
      INSERT INTO \`otherinformations\` (${columnNames}, \`createdAt\`, \`updatedAt\`)
      VALUES (${placeholders}, NOW(), NOW())
    `;

    // For MySQL: no RETURNING * support → insert first, then fetch the row if needed
    await sequelize.query(query, {
      replacements: values,
      type: sequelize.QueryTypes.INSERT
    });


    return res.status(201).json({
      success: true,
      message: 'Other information created successfully',
     
    });
  } catch (error) {
    console.error('Create error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
// ────────────────────────────────────────────────


const updateOtherInformation = async (req, res) => {
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
      UPDATE \`otherinformations\`
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

const getOtherInformationByRegNo = async (req, res) => {
  try {
    const { reg_no } = req.params;

    if (!reg_no) {
      return res.status(400).json({
        success: false,
        message: 'reg_no is required'
      });
    }

    const [records] = await sequelize.query(`
      SELECT *
      FROM otherinformations WHERE otherinformations.reg_no = :reg_no
    `, {
      replacements: { reg_no },
      type: sequelize.QueryTypes.SELECT
    });

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Other information not found'
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
};

// ────────────────────────────────────────────────
// GET ALL (paginated + optional search)
// GET /api/other-information
// ────────────────────────────────────────────────
const getAllOtherInformation = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    const where = {};
    if (search) {
      where.reg_no = { [Op.like]: `%${search}%` };
      // add more fields if you want to search them later
    }

    const { count, rows } = await OtherInformation.findAndCountAll({
      where,
      include: [
        {
          model: PersonalInformation,
          as: 'PersonalInformation',
          attributes: ['first_name', 'last_name', 'class'],
        },
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  createOtherInformation,
  updateOtherInformation,
  getOtherInformationByRegNo,
  getAllOtherInformation,
};