const { ProgramSubject, class_master, Program, Subject, ElectiveBasket, semester } = require('../models');
exports.getAllProgramSubjects = async (req, res) => {
 
  let {classId}=req.query
  let whereConditon={}
  if(classId){
    whereConditon['classId']=classId
  }

  try {
    const subjects = await ProgramSubject.findAll({
      where:whereConditon,
      include: [
        { model:class_master, as: 'class' },
        { model: Program, as: 'program' },
        { model: Subject, as: 'subject' },
        { model: ElectiveBasket, as: 'electivebasket' },
        { model: semester, as: 'semesterInfo', attributes: ['id', 'semester'] },
      ],
    });

    const data = subjects.map((item) => {
      const plain = item.toJSON();
      plain.semester = plain.semesterInfo?.semester ?? plain.semester;
      delete plain.semesterInfo;
      return plain;
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


exports.getAllProgramSubjectsByClassAndSemester = async (req, res) => {
  console.log('calling *******');
  let {classId}=req.query
  let whereConditon={}
  if(classId){
    whereConditon['classId']=classId
  }

  try {
    // Fetch all relevant ProgramSubject records
    
    const programSubjects = await ProgramSubject.findAll({
      where:whereConditon,
      include: [
        {
          model: class_master,
          as: 'class',
          attributes: ['id', 'class_name'],
        },
        {
          model: Program,
          as: 'program',
          attributes: ['id', 'program_name'],
          required: false, // allow null programId
        },
        {
          model: Subject,
          as: 'subject',
          attributes: ['id', 'value', 'subject_code'],
        },
        {
          model: ElectiveBasket,
          as: 'electivebasket',
          attributes: ['id', 'exactChoices'],
          required: false,
        },
        {
          model: semester,
          as: 'semesterInfo',
          attributes: ['id', 'semester'],
        },
      ],
    });

    // Group by classId + semester
    const grouped = {};

    programSubjects.forEach((ps) => {
      const classId = ps.classId;
      const semesterValue = ps.semesterInfo?.semester ?? ps.semester;
     const key = `${ps.classId}-${ps.semester}-${ps.programId ?? 'null'}`;

      if (!grouped[key]) {
        grouped[key] = {
          classId: classId,
          className: ps.class?.class_name || 'Unknown Class',
          semester: semesterValue,
          programId: ps.program?.id || null,
          programName: ps.program?.program_name || null, // ← added program info here
          compulsorySubjects: [],
          optionalSubjects: [],
          batch: ps.batch || null, // will be grouped by basket
        };
      }

      const subjectData = {
        subjectId: ps.subject?.id,
        subjectName: ps.subject?.value||null,
        subjectCode: ps.subject?.subject_code || null,
        batch: ps.batch || null,
        sequence: ps.sequence,
      };

      if (ps.isCompulsory) {
        // Compulsory → simple array
        grouped[key].compulsorySubjects.push(subjectData);
      } else {
        // Optional → group by elective basket
        const basket = ps.electivebasket;

        if (basket) {
          // Find if this basket already exists in optionalSubjects
          let basketGroup = grouped[key].optionalSubjects.find(
            (b) => b.electiveBasketId === basket?.id
          );

          if (!basketGroup) {
            basketGroup = {
              electiveBasketId: basket?.id,
              exactChoices: basket.exactChoices,
              subjects: [],
            };
            grouped[key].optionalSubjects.push(basketGroup);
          }

          basketGroup.subjects.push(subjectData);
        } else {
          // Optional but no basket assigned (fallback)
          grouped[key].optionalSubjects.push({
            electiveBasketId: null,
            basketName: 'General Optional',
            subjects: [subjectData],
          });
        }
      }
    });

    // Convert grouped object to array
    const result = Object.values(grouped);

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    console.error('Error in getAllProgramSubjectsByClassAndSemester:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
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
      batch:entry.batch,
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