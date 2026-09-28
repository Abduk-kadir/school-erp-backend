const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const {
  diary,
  notes,
  assignment,
  studentnotification,
  timetable,
  holidarmaster,
  eventmaster,
  par_student_personal_information,
  ProgramSubject,
} = require('../../models');

const studentDashboard = {
  getStats: asyncHandler(async (req, res) => {
    const { reg_no } = req.params;

    const student = await par_student_personal_information.findOne({
      where: { reg_no },
      raw: true,
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const classId = student.class;
    const division = student.division;

    const studentSubjects = await ProgramSubject.findAll({
      where: { classId },
      raw: true,
    });
    const subjects = studentSubjects.map((s) => s.subjectId);

    const subjectWhere = {
      class: classId,
      division,
      subject: { [Op.in]: subjects.length ? subjects : [-1] },
    };
    const classDivWhere = { class: classId, division };

    const [
      diarystat,
      notificationstat,
      holidaystat,
      notesstat,
      assignmentstat,
      eventstat,
      timetablestat,
    ] = await Promise.all([
      diary.count({ where: subjectWhere }),
      studentnotification.count({ where: classDivWhere }),
      holidarmaster.count({ where: classDivWhere }),
      notes.count({ where: subjectWhere }),
      assignment.count({ where: subjectWhere }),
      eventmaster.count({ where: classDivWhere }),
      timetable.count({ where: classDivWhere }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        diarystat,
        notificationstat,
        holidaystat,
        notesstat,
        assignmentstat,
        eventstat,
        timetablestat,
      },
    });
  }),
};

module.exports = studentDashboard;
