const asyncHandler = require('express-async-handler');
const db = require('../models')
const sequelize = db.sequelize;
const ExcelJS = require('exceljs');
const { par_student_subject, par_student_personal_information, class_master, Program, Subject, ElectiveBasket, division_master, caste_master, par_parentparticular, par_educational_detail, par_other_information, par_student_transport, institute,gender_master,gender,studenttype } = require('../models');


let allColumnOfTable = asyncHandler(async (req, res) => {
    const personal = await sequelize.getQueryInterface().describeTable(par_student_personal_information.getTableName());
    const parentPar = await sequelize.getQueryInterface().describeTable(par_parentparticular.getTableName());
    const edu = await sequelize.getQueryInterface().describeTable(par_educational_detail.getTableName());
    const oth = await sequelize.getQueryInterface().describeTable(par_other_information.getTableName());
    const dec = await sequelize.getQueryInterface().describeTable('student_declarations');
    const sub = await sequelize.getQueryInterface().describeTable(par_student_subject.getTableName());
    const trans = await sequelize.getQueryInterface().describeTable(par_student_transport.getTableName());

    // Helper function to filter out 'id', 'reg_no', and timestamps
    const excludeCols = ['id', 'reg_no', 'createdAt', 'updatedAt', 'created_at', 'updated_at'];
    const filterColumns = (columns) => Object.keys(columns).filter(col => !excludeCols.includes(col));

    res.send({
        message: "Columns fetched successfully",
        data: {
            "Personal Infromation": filterColumns(personal),
            "Parent Particulars": filterColumns(parentPar),
            "Educational Details": filterColumns(edu),
            "Other Infromation": filterColumns(oth),
            "Declaration": filterColumns(dec),
            "Subjects": filterColumns(sub),
            "Transport": filterColumns(trans)
        }
    });
});



let importStudentData = asyncHandler(async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    let datafromexcel = {}
    const [allClasses, allDivisions, allCasts, allParentPar, allEduDetails,allGenders,allStudentTypes] = await Promise.all([
        class_master.findAll({ raw: true }),
        division_master.findAll({ raw: true }),
        caste_master.findAll({ raw: true }),
        gender.findAll({ raw: true }),
        studenttype.findAll({ raw: true }),
        //ParentParticular.findAll({ raw: true }),
        //EducationDetail.findAll({ raw: true }),
        //OtherInformation.findAll({ raw: true })
    ]);

    workbook.eachSheet((worksheet) => {
        const tableName = worksheet.name.trim();
        //console.log('tableName is:',tableName)
        if (tableName === 'Instructions') return;

        const rows = worksheet.getSheetValues();
        if (rows.length < 2) return;
        const headers = rows[1].slice(1); // Remove empty first cell if any
        const allrows = rows.slice(2);
        const records = allrows.map(row => {

            let record = {}
            headers.forEach((header, i) => {

                record[header] = row[i + 1];

            })
            return record
        })
        datafromexcel[tableName] = records

    });

    //console.log('datafrom excel is:',datafromexcel)
    const classMap = new Map(
        allClasses.map(c => [c.class_name, c.id])
    );

    const divisionMap = new Map(
        allDivisions.map(d => [d.division_name, d.id])
    );

    const casteMap = new Map(
        allCasts.map(c => [c.value, c.id])
    );
    const genderMap=new Map(allGenders.map(g=>[g.gender_name,g.id]))
    const studentTypeMap=new Map(allStudentTypes.map(s=>[s.studenttype,s.id]))

    const originalPersonal = (datafromexcel['Personal Infromation'] || []).map(r => ({ ...r }));
    const originalParent = (datafromexcel['Parent Particulars'] || []).map(r => ({ ...r }));
    const originalEdu = (datafromexcel['Educational Details'] || []).map(r => ({ ...r }));
    const originalOther = (datafromexcel['Other Infromation'] || []).map(r => ({ ...r }));

    let incorrectPersonal = []
    let incorrectParentParticulars = []
    let incorrectEduDetails = []
    let incorrectOtherInfo = []
    let correctPersonal = datafromexcel['Personal Infromation'].filter(item => {
        if (
            classMap.has(item.class) &&
            divisionMap.has(item.division) &&
            casteMap.has(item.cast)
            &&genderMap.has(item.gender)
            &&studentTypeMap.has(item.studenttype)
        ) {
            // Replace text with IDs
            item.class = classMap.get(item.class);
            item.division = divisionMap.get(item.division);
            item.cast = casteMap.get(item.cast);
            item.gender = genderMap.get(item.gender);
            item.studenttype = studentTypeMap.get(item.studenttype);
            return true;
        } else {
            const errors = [];
            if (!classMap.has(item.class)) errors.push(`invalid class: ${item.class}`);
            if (!divisionMap.has(item.division)) errors.push(`invalid division: ${item.division}`);
            if (!casteMap.has(item.cast)) errors.push(`invalid cast: ${item.cast}`);
            if (!genderMap.has(item.gender)) errors.push(`invalid gender: ${item.gender}`);
            if (!studentTypeMap.has(item.studenttype)) errors.push(`invalid student type: ${item.studenttype}`);
            item.error = errors.join(', ');
            incorrectPersonal.push(item);
            return false;
        }
    });

    const correctPersonalidset = new Set(correctPersonal.map(c => c.id));
    let correctParentParticulars = datafromexcel['Parent Particulars'].filter((item) => {
        if (correctPersonalidset.has(item.id)) {
            return true;
        }
        else {
            incorrectParentParticulars.push({ ...item })
            return false
        }
    })
    const correctEduDetails = datafromexcel['Educational Details'].filter((item) => {
        if (correctPersonalidset.has(item.id)) {
            return true;
        }
        else {
            incorrectEduDetails.push({ ...item })
            return false
        }
    })

    const correctOtherInfo = datafromexcel['Other Infromation'].filter((item) => {
        if (correctPersonalidset.has(item.id)) {
            return true;
        }
        else {
            incorrectOtherInfo.push({ ...item })
            return false
        }
    })


    const inst = await institute.findOne();
    const yy = String(new Date().getFullYear()).slice(-2);
    const excelToReg = {};

    try {
        await sequelize.transaction(async (t) => {
            try {
                const created = await par_student_personal_information.bulkCreate(
                    correctPersonal.map(({ id, reg_no, ...data }) => data),
                    { transaction: t }
                );

                for (let i = 0; i < created.length; i++) {
                    const reg_no = Number(`${yy}${inst.code}${String(created[i].id).padStart(4, '0')}`);
                    excelToReg[correctPersonal[i].id] = reg_no;
                    await created[i].update({ reg_no }, { transaction: t });
                }
            } catch (err) {
                correctPersonal.forEach(item => {
                    const orig = originalPersonal.find(r => r.id === item.id) || item;
                    incorrectPersonal.push({ ...orig, error: err.message });
                });
                correctPersonal = [];
                throw err;
            }

            const now = new Date();
            const forInsert = (rows) =>
                rows.map(({ id, ...data }) => ({ ...data, reg_no: excelToReg[id], createdAt: now, updatedAt: now }));

            try {
                if (correctParentParticulars.length)
                    await sequelize.getQueryInterface().bulkInsert(par_parentparticular.getTableName(), forInsert(correctParentParticulars), { transaction: t });
            } catch (err) {
                correctParentParticulars.forEach(item => incorrectParentParticulars.push({ ...item, error: err.message }));
                throw err;
            }

            try {
                if (correctEduDetails.length)
                    await sequelize.getQueryInterface().bulkInsert(par_educational_detail.getTableName(), forInsert(correctEduDetails), { transaction: t });
            } catch (err) {
                correctEduDetails.forEach(item => incorrectEduDetails.push({ ...item, error: err.message }));
                throw err;
            }

            try {
                if (correctOtherInfo.length)
                    await sequelize.getQueryInterface().bulkInsert(par_other_information.getTableName(), forInsert(correctOtherInfo), { transaction: t });
            } catch (err) {
                correctOtherInfo.forEach(item => incorrectOtherInfo.push({ ...item, error: err.message }));
                throw err;
            }
        });
    } catch (err) {
        // transaction rolled back; failed rows already added to incorrect arrays
    }

    const errorIds = new Set(
        [...incorrectPersonal, ...incorrectParentParticulars, ...incorrectEduDetails, ...incorrectOtherInfo]
            .map(r => r.id)
            .filter(id => id !== undefined && id !== null)
    );

    const fillRelated = (sourceRows, destArr) => {
        const existingIds = new Set(destArr.map(r => r.id));
        sourceRows.forEach(row => {
            if (row.id === undefined || row.id === null) return;
            if (!errorIds.has(row.id) || existingIds.has(row.id)) return;
            destArr.push({ ...row });
            existingIds.add(row.id);
        });
    };

    fillRelated(originalPersonal, incorrectPersonal);
    fillRelated(originalParent, incorrectParentParticulars);
    fillRelated(originalEdu, incorrectEduDetails);
    fillRelated(originalOther, incorrectOtherInfo);

    const hasErrors = incorrectPersonal.length > 0 || incorrectParentParticulars.length > 0 || incorrectEduDetails.length > 0 || incorrectOtherInfo.length > 0;
    const total = datafromexcel['Personal Infromation']?.length || 0;
    const message = hasErrors
        ? `${correctPersonal.length} of ${total} imported. ${incorrectPersonal.length} personal records failed — check incorrect data.`
        : `${correctPersonal.length} of ${total} imported successfully.`;

    res.json({
        message,
        workbook: req.file.originalname,
        incorrect: {
            "Personal Infromation": incorrectPersonal,
            "Parent Particulars": incorrectParentParticulars,
            "Educational Details": incorrectEduDetails,
            "Other Infromation": incorrectOtherInfo
        }
    });
});





const exportAllStudentData = asyncHandler(async (req, res) => {
    // Get selected columns from request body
    let {
        "Personal Infromation": personal = {},
        "Parent Particulars": parentPar = {},
        "Educational Details": edudetail = {},
        "Other Infromation": otherInfo = {},
        "Declaration": declaration = {},

        "Transport": transport = {}
    } = req.body;
    console.log('personal data is:', personal)
    // Map columns for each table
    const tableColumns = {
        p: Object.keys(personal),
        parent: Object.keys(parentPar),
        edu: Object.keys(edudetail),
        other: Object.keys(otherInfo),
        decl: Object.keys(declaration),

        trans: Object.keys(transport)
    };

    // Build select clause dynamically
    // Build select clause dynamically, replacing 'class' with class name
    const selectClause = Object.entries(tableColumns)
        .map(([alias, cols]) =>
            cols.map(col => {
                if (alias === 'p' && col === 'class') {
                    return 'cm.class_name AS class'; // replace class ID with class name
                } else {
                    return `${alias}.\`${col}\``;
                }
            }).join(", ")
        )
        .filter(clause => clause) // remove empty strings
        .join(", ");

    console.log("Select clause:", selectClause);


    // Build query with joins
    const query = `
      SELECT 
        p.reg_no,
        ${selectClause}
      FROM \`${par_student_personal_information.getTableName()}\` p
      LEFT JOIN \`${par_parentparticular.getTableName()}\` parent ON parent.reg_no = p.reg_no
      LEFT JOIN class_masters cm ON cm.id = p.class

      LEFT JOIN \`${par_educational_detail.getTableName()}\` edu ON edu.reg_no = p.reg_no
      LEFT JOIN \`${par_other_information.getTableName()}\` other ON other.reg_no = p.reg_no
      LEFT JOIN student_declarations decl ON decl.reg_no = p.reg_no
      LEFT JOIN \`${par_student_transport.getTableName()}\` trans ON trans.reg_no = p.reg_no
    `;

    console.log("Query:", query);

    const results = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT
    });


    const records = await par_student_subject.findAll({
        include: [

            { model: class_master, as: 'class', attributes: ['id', 'class_name'] },
            { model: Program, as: 'program', attributes: ['id', 'program_name'] },
            { model: Subject, as: 'subject', attributes: ['id', 'value', 'subject_code'] },
            { model: ElectiveBasket, as: 'electiveBasket', attributes: ['id'] },
        ],
    });


    if (results.length === 0) {
        return res.status(404).json({ message: "No student data found" });
    }

    // Clean null values → empty string (looks better in Excel)
    const finalData = results.map(row => {
        const cleaned = { ...row };
        Object.keys(cleaned).forEach(key => {
            if (cleaned[key] === null || cleaned[key] === undefined) {
                cleaned[key] = '';
            }
        });
        return cleaned;
    });

    // ── Excel Generation ────────────────────────────────────────
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('All Students');

    // Headers from actual column names (no artificial prefixes)
    const headers = Object.keys(finalData[0]);
    worksheet.columns = headers.map(header => ({
        header: header
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        key: header,
        width: header.includes('name') || header.includes('address') || header.includes('remark') || header.length > 20
            ? 35
            : 18
    }));

    worksheet.addRows(finalData);

    // Header styling
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1565C0' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=All_Students_Selected_Columns.xlsx');

    await workbook.xlsx.write(res);

    res.end();
});






module.exports = {
    allColumnOfTable,
    exportAllStudentData,
    importStudentData

}
