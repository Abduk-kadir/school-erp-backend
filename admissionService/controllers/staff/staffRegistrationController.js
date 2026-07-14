const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const { Op, QueryTypes } = require('sequelize');
const { StaffRegistration, staffFcmtoken, department, designation, sequelize } = require('../../models');
const generateToken = require('../../utils/generateToken');

const STAFF_DOCUMENT_ROOT = 'E:\\staffDocument';

function saveStaffFileWithId(file, staffId, typeMarker) {
  if (!file) return null;
  const originalName = file.originalname.replace(/\s+/g, '_');
  const newName = `${staffId}-${typeMarker}-${originalName}`;
  const oldPath = path.join(STAFF_DOCUMENT_ROOT, file.filename);
  const newPath = path.join(STAFF_DOCUMENT_ROOT, newName);
  try {
    fs.renameSync(oldPath, newPath);
  } catch (err) {
    console.error('Failed to move staff file:', err.message);
    return `/uploads/staffDocument/${file.filename}`;
  }
  return `/uploads/staffDocument/${newName}`;
}

function stripStaffFilePrefix(fileUrl) {
  if (!fileUrl) return fileUrl;
  return path.basename(fileUrl).replace(/^\d+-[ps]-/, '');
}

function removeStaffFile(fileUrl) {
  if (!fileUrl) return;
  const filePath = path.join(STAFF_DOCUMENT_ROOT, path.basename(fileUrl));
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Failed to delete staff file:', err.message);
    });
  }
}

const PASSWORD_SECRET = process.env.JWT_KEY || 'default_secret';
const PASSWORD_KEY = crypto.scryptSync(PASSWORD_SECRET, 'staff_pwd_salt', 32);

function encryptPassword(plain) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', PASSWORD_KEY, iv);
  let encrypted = cipher.update(String(plain), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

function decryptPassword(stored) {
  if (!stored || !stored.includes(':')) return '';
  try {
    const [ivHex, encrypted] = stored.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== 16) return '';
    const decipher = crypto.createDecipheriv('aes-256-cbc', PASSWORD_KEY, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return '';
  }
}

function verifyPassword(plain, stored) {
  const decrypted = decryptPassword(stored);
  return decrypted !== '' && decrypted === String(plain);
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
      departmentid,
      designationid,
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
      departmentid: departmentid ?? null,
      designationid: designationid ?? null,
      userType,
      address,
      date_of_join,
      emergency_contact_number,
      password: encryptPassword(password)
    });

    const photoFile = req.files?.staff_photo?.[0] || null;
    const signatureFile = req.files?.staff_sig_photo?.[0] || null;

    const staff_photo = saveStaffFileWithId(photoFile, staff.id, 'p');
    const staff_sig_photo = saveStaffFileWithId(signatureFile, staff.id, 's');

    if (staff_photo || staff_sig_photo) {
      await staff.update({ staff_photo, staff_sig_photo });
    }

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
      attributes: { exclude: ['password'] },
      include: [
        {
          model: department,
          as: 'departmentInfo',
          attributes: ['id', 'department_name'],
        },
        {
          model: designation,
          as: 'designationInfo',
          attributes: ['id', 'designation_name'],
        },
      ],
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

const staffDetailById = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await sequelize.query(
      `SELECT
        sr.id,
        sr.surname,
        sr.firstname,
        sr.lastname,
        sr.dob,
        sr.gender,
        sr.password,
        sr.email,
        sr.mobile_number,
        sr.departmentid,
        sr.designationid,
        sr.userType,
        sr.address,
        sr.date_of_join,
        sr.emergency_contact_number,
        sr.staff_photo,
        sr.staff_sig_photo,
        dp.department_name,
        dg.designation_name
      FROM StaffRegistrations AS sr
      LEFT JOIN departments AS dp ON sr.departmentid = dp.id
      LEFT JOIN designations AS dg ON sr.designationid = dg.id
      WHERE sr.id = :id
      LIMIT 1`,
      {
        replacements: { id },
        type: QueryTypes.SELECT,
      }
    );

    const staff = rows[0];

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    staff.password = decryptPassword(staff.password);
    staff.staff_photo = stripStaffFilePrefix(staff.staff_photo);
    staff.staff_sig_photo = stripStaffFilePrefix(staff.staff_sig_photo);

    return res.status(200).json({
      success: true,
      data: staff
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

const editStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await StaffRegistration.findByPk(id);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      });
    }

    const {
      surname,
      firstname,
      lastname,
      dob,
      gender,
      email,
      mobile_number,
      departmentid,
      designationid,
      userType,
      address,
      date_of_join,
      emergency_contact_number,
      password
    } = req.body;

    if (email || mobile_number) {
      const orConditions = [];
      if (email) orConditions.push({ email: email.trim() });
      if (mobile_number) orConditions.push({ mobile_number: String(mobile_number).trim() });

      const duplicate = await StaffRegistration.findOne({
        where: {
          [Op.and]: [
            { id: { [Op.ne]: staff.id } },
            { [Op.or]: orConditions }
          ]
        }
      });
      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: 'Another account with this email or mobile number already exists'
        });
      }
    }

    const updates = {};
    if (surname !== undefined) updates.surname = surname;
    if (firstname !== undefined) updates.firstname = firstname;
    if (lastname !== undefined) updates.lastname = lastname;
    if (dob !== undefined) updates.dob = dob;
    if (gender !== undefined) updates.gender = gender;
    if (email !== undefined) updates.email = email.trim();
    if (mobile_number !== undefined) updates.mobile_number = String(mobile_number).trim();
    if (departmentid !== undefined) updates.departmentid = departmentid ?? null;
    if (designationid !== undefined) updates.designationid = designationid ?? null;
    if (userType !== undefined) updates.userType = userType;
    if (address !== undefined) updates.address = address;
    if (date_of_join !== undefined) updates.date_of_join = date_of_join;
    if (emergency_contact_number !== undefined) updates.emergency_contact_number = emergency_contact_number;
    if (password) updates.password = encryptPassword(password);

    const photoFile = req.files?.staff_photo?.[0] || null;
    const signatureFile = req.files?.staff_sig_photo?.[0] || null;

    if (photoFile) {
      removeStaffFile(staff.staff_photo);
      updates.staff_photo = saveStaffFileWithId(photoFile, staff.id, 'p');
    }
    if (signatureFile) {
      removeStaffFile(staff.staff_sig_photo);
      updates.staff_sig_photo = saveStaffFileWithId(signatureFile, staff.id, 's');
    }

    await staff.update(updates);

    return res.status(200).json({
      success: true,
      message: 'Staff updated successfully',
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
      include: [
        {
          model: department,
          as: 'departmentInfo',
          attributes: ['id', 'department_name'],
        },
        {
          model: designation,
          as: 'designationInfo',
          attributes: ['id', 'designation_name'],
        },
      ],
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

module.exports = { registration, login, staffDetail, staffDetailById, editStaff, allStaff };
