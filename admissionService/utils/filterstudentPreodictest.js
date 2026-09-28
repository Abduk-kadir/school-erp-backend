const { QueryTypes } = require('sequelize');
const { sequelize, ProgramSubject } = require('../models');

const filterStudentPreodictest = async (row) => {
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
    try {

        let isComplusarySubject = await ProgramSubject.findOne({ where: { classId: row.class, subjectId: row.subject } })
        if (isComplusarySubject) {
        let sqlQuery = `select student.id, student.reg_no,student.first_name,student.last_name,student.rollnumber,student.class ,student.division, subject.subjectId 
        from par_student_personal_informations as student 
        join ProgramSubjects subject on student.class=subject.classId 
        ${whereSql} order by student.rollnumber asc`;
            console.log('sqlQuery is***********:', sqlQuery);
            let students = await sequelize.query(sqlQuery, {
                type: QueryTypes.SELECT,
                raw: true,
            });
            let uniqueStudents=[...new Map(students.map((s)=>[s.reg_no,s])).values()];
            return uniqueStudents;
        }
        else{
            if (row.subject) {
                whereClause = whereClause.filter(
                    (item) => item !== `subject.subjectId=${row.subject}`
                );
                whereClause.push(`subject.subject_id=${row.subject}`);
            }
            whereSql = whereClause.length
                ? ` where ${whereClause.join(' and ')}`
                : '';
            let sqlQuery = `select student.id, student.reg_no,student.first_name,student.last_name,student.rollnumber,student.class ,student.division, subject.subject_id 
            from par_student_personal_informations as student 
            join student_subjects subject on student.reg_no=subject.student_reg_no 
            ${whereSql} order by student.rollnumber asc`;
            let students=await sequelize.query(sqlQuery, {
                type: QueryTypes.SELECT,
                raw: true,
            });
            let uniqueStudents=[...new Map(students.map((s)=>[s.reg_no,s])).values()];
            return uniqueStudents;
            

        }
    }
    catch (error) {
        console.log('error in filterStudentPreodictest',error);
        throw error

    }
};

module.exports = filterStudentPreodictest;
