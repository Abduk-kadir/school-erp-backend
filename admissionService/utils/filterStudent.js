const { QueryTypes } = require('sequelize');
const { sequelize } = require('../models');

const filterStudent = async (row) => {
    let whereClause = [];
    if (row.class) {
        whereClause.push(`student.class=${row.class}`)
    }
    if (row.division) {
        whereClause.push(`student.division=${row.division}`)
    }
    if (row.subject) {
        whereClause.push(`subject.subjectId=${row.subject}`)
    }
    let whereSql = whereClause.length ? ` where ${whereClause.join(' and ')}` : '';
    let sqlQuery = `select student.id, student.reg_no,student.class ,student.division, subject.subjectId ,token.token
    from par_student_personal_informations as student 
    join ProgramSubjects subject on student.class=subject.classId 
    inner join student_fcmtokens as token on token.studentid=student.id
    ${whereSql}
    `;
    console.log('sqlQuery is***********:', sqlQuery);
    let students = await sequelize.query(sqlQuery, {
        type: QueryTypes.SELECT,
        raw: true,
    });
    return students;
};

module.exports = filterStudent;
