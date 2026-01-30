const { ProgramSubject, Class, Program, Subject, ElectiveBasket } = require('../models');
exports.getAllProgramSubjects = async (req, res) => {
  try {
    const subjects = await ProgramSubject.findAll({
      include: [
        { model: Class, as: 'class' },
        { model: Program, as: 'program' },
        { model: Subject, as: 'subject' },
        { model: ElectiveBasket, as: 'basket' },
      ],
    });
    return res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Very useful endpoint: Get subjects for a specific class + semester
// GET /api/program-subjects/class/:classId/semester/:semester
exports.getSubjectsByClassAndSemester = async (req, res) => {
  try {
    const { classId, semester } = req.params;

    const subjects = await ProgramSubject.findAll({
      where: {
        classId: parseInt(classId),
        semester: parseInt(semester),
      },
      include: [
        { model: Subject, as: 'subject' },
        { model: Program, as: 'program' },
        { model: ElectiveBasket, as: 'basket' },
      ],
      order: [['isCompulsory', 'DESC'], ['sequence', 'ASC']],
    });

    return res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getProgramSubjectById = async (req, res) => {
  try {
    const ps = await ProgramSubject.findByPk(req.params.id, {
      include: [
        { model: Class, as: 'class' },
        { model: Program, as: 'program' },
        { model: Subject, as: 'subject' },
        { model: ElectiveBasket, as: 'basket' },
      ],
    });

    if (!ps) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    return res.status(200).json({ success: true, data: ps });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.createProgramSubject = async (req, res) => {
  try {
    const {
      classId,
      programId,       // can be null
      subjectId,
      semester,
      isCompulsory = true,
      basketId,        // can be null
      sequence = 0,
    } = req.body;

    if (!classId || !subjectId || !semester) {
      return res.status(400).json({
        success: false,
        message: 'classId, subjectId, semester are required',
      });
    }

    const newEntry = await ProgramSubject.create({
      classId,
      programId: programId || null,
      subjectId,
      semester,
      isCompulsory,
      basketId: basketId || null,
      sequence,
    });

    return res.status(201).json({ success: true, data: newEntry });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
// POST /api/program-subjects/bulk
exports.bulkCreateProgramSubjects = async (req, res) => {
  try {
    const { arr} = req.body;
    console.log('entrie is:',arr)

  

    // Prepare data - ensure programId & basketId are null if not provided
    const preparedEntries = arr.map((entry) => ({
      classId: entry.classId,
      programId: entry.programId ?? null,
      subjectId: entry.subjectId,
      semester: entry.semester,
      isCompulsory: entry.isCompulsory ?? true,
      basketId: entry.basketId ?? null,
      sequence: entry.sequence ?? 0,
      // createdAt / updatedAt will be auto-handled by Sequelize
    }));

    // Bulk insert - very efficient (one INSERT statement with multiple values)
    const createdEntries = await ProgramSubject.bulkCreate(preparedEntries, {
      validate: true,           // run model validations
      individualHooks: false,   // faster, but skips individual hooks if you have any
      returning: true,          // return the created records (supported in PostgreSQL & MySQL 8+)
    });

    return res.status(201).json({
      success: true,
      count: createdEntries.length,
      data: createdEntries,
    });
  } catch (error) {
    console.error('Bulk create error:', error);

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map(e => ({
          field: e.path,
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during bulk insert',
      error: error.message,
    });
  }
};

exports.updateProgramSubject = async (req, res) => {
  try {
    const ps = await ProgramSubject.findByPk(req.params.id);
    if (!ps) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await ps.update(req.body);
    return res.status(200).json({ success: true, data: ps });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteProgramSubject = async (req, res) => {
  try {
    const ps = await ProgramSubject.findByPk(req.params.id);
    if (!ps) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    await ps.destroy();
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};