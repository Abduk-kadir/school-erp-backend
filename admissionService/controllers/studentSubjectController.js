const { student_subject, PersonalInformation, class_master, Program, Subject, ElectiveBasket } = require('../models');

exports.getAllStudentSubjects = async (req, res) => {
    console.log('this is calling')
  try {
    const records = await student_subject.findAll({
      include: [
        
        { model: class_master, as: 'class', attributes: ['id', 'class_name'] },
        { model: Program, as: 'program', attributes: ['id', 'program_name'] },
        { model: Subject, as: 'subject', attributes: ['id', 'value', 'subject_code'] },
        { model: ElectiveBasket, as: 'electiveBasket', attributes: ['id'] },
      ],
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Get all subjects assigned to a specific student (useful for student dashboard/admission)
exports.getStudentSubjects = async (req, res) => {
  try {
    const { student_reg_no } = req.params;

    const records = await student_subject.findAll({
      where: { student_reg_no: parseInt(student_reg_no) },
      include: [
       
        { model: Subject, as: 'subject' },
       
      ],
    
    });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Create single subject assignment
exports.createStudentSubject = async (req, res) => {
  try {
    const {
      student_reg_no,
      class_id,
      program_id,
      semester,
      subject_id,
      elective_basket_id,
    } = req.body;

    if (!student_reg_no || !class_id || !semester || !subject_id) {
      return res.status(400).json({
        success: false,
        message: 'student_reg_no, class_id, semester, subject_id are required',
      });
    }

    const record = await student_subject.create({
      student_reg_no,
      class_id,
      program_id: program_id || null,
      semester,
      subject_id,
      elective_basket_id: elective_basket_id || null,
    });

    return res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error(error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ success: false, message: 'Duplicate subject assignment' });
    }
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Bulk create (assign multiple subjects to a student at once - perfect for admission)
exports.bulkCreateStudentSubjects = async (req, res) => {
  try {
    const { assignments } = req.body;
    console.log('assignment is*************************************',assignments)

    if (!Array.isArray(assignments) || assignments.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'assignments must be a non-empty array',
      });
    }

    // Validate each entry
    for (const ass of assignments) {
      if (!ass.student_reg_no || !ass.class_id || !ass.semester || !ass.subject_id) {
        return res.status(400).json({
          success: false,
          message: 'Each assignment must have student_reg_no, class_id, semester, subject_id',
        });
      }
    }

    const created = await student_subject.bulkCreate(assignments, {
      validate: true,
      returning: true,
    });

    return res.status(201).json({
      success: true,
      count: created.length,
      data: created,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

//bulkupdate



// Update single assignment
exports.updateStudentSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await student_subject.findByPk(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await record.update(req.body);

    return res.status(200).json({ success: true, data: record });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Delete single assignment
exports.deleteStudentSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await student_subject.findByPk(id);

    if (!record) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    await record.destroy();

    return res.status(200).json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};