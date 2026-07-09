const crypto = require('crypto');
const { Op } = require('sequelize');
const { StaffRegistration,staffFcmtoken } = require('../../models');
const generateToken = require('../../utils/generateToken');

function hashPassword(plain) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

function verifyPassword(plain, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, keyHex] = stored.split(':');
  const derived = crypto.scryptSync(plain, salt, 64);
  try {
    return crypto.timingSafeEqual(Buffer.from(keyHex, 'hex'), derived);
  } catch {
    return false;
  }
}

function toPublicStaff(row) {
  if (!row) return null;
  const o = typeof row.toJSON === 'function' ? row.toJSON() : { ...row };
  delete o.password;
  return o;
}

const registration = async (req, res) => {
  try {
    const {
      surname,
      firstname,
      lastname,
      dob,
      gender,
      email,
      mobile_number,
      department,
      designation,
      userType,
      address,
      date_of_join,
      emergency_contact_number,
      password
    } = req.body;

    if (!email || !mobile_number || !password) {
      return res.status(400).json({
        success: false,
        message: 'email, mobile_number, and password are required'
      });
    }

    const existing = await StaffRegistration.findOne({
      where: {
        [Op.or]: [{ email: email.trim() }, { mobile_number: String(mobile_number).trim() }]
      }
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email or mobile number already exists'
      });
    }

    const staff = await StaffRegistration.create({
      surname,
      firstname,
      lastname,
      dob,
      gender,
      email: email.trim(),
      mobile_number: String(mobile_number).trim(),
      department,
      designation,
      userType,
      address,
      date_of_join,
      emergency_contact_number,
      password: hashPassword(password)
    });

    return res.status(201).json({
      success: true,
      message: 'Staff registered successfully',
      data: toPublicStaff(staff)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, mobile_number, password, fcmToken} = req.body;

    if ((!email && !mobile_number) || !password) {
      return res.status(400).json({
        success: false,
        message: 'email or mobile_number and password are required'
      });
    }

    const where = email
      ? { email: String(email).trim() }
      : { mobile_number: String(mobile_number).trim() };

    const staff = await StaffRegistration.findOne({ where });

    if (!staff || !verifyPassword(password, staff.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (fcmToken) {
      const existing = await staffFcmtoken.findOne({
        where: { staffid: staff.id },
      });
      if (existing) {
        await existing.update({ token: fcmToken });
      } else {
        await staffFcmtoken.create({ staffid: staff.id, token: fcmToken });
      }
    }

    const token = generateToken({
      id: staff.id,
      userType: staff.userType,
      scope: 'staff'
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      //data: toPublicStaff(staff)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const staffDetail = async (req, res) => {
  try {
    const staff = await StaffRegistration.findByPk(req.staff, {
      attributes: { exclude: ['password'] }
    });

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: toPublicStaff(staff)
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

const allStaff = async (req, res) => {
  try {
    const rows = await StaffRegistration.findAll({
      attributes: { exclude: ['password'] },
      order: [
        ['surname', 'ASC'],
        ['firstname', 'ASC'],
        ['id', 'ASC']
      ]
    });

    const data = rows.map((r) => toPublicStaff(r));

    return res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { registration, login, staffDetail, allStaff };
