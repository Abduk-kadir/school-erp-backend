const db = require('../models')
const sequelize = db.sequelize;
const ExcelJS = require('exceljs');
const { student_subject, PersonalInformation, class_master, Program, Subject, ElectiveBasket } = require('../models');


let allColumnOfTable = async (req, res) => {
    try {
        const personal = await sequelize.getQueryInterface().describeTable('personalinformations');
        const parentPar = await sequelize.getQueryInterface().describeTable('parentparticulars');
        const edu = await sequelize.getQueryInterface().describeTable('educationdetails');
        const oth = await sequelize.getQueryInterface().describeTable('otherinformations');
        const dec = await sequelize.getQueryInterface().describeTable('student_declarations');
        const sub = await sequelize.getQueryInterface().describeTable('student_subjects');
        const trans = await sequelize.getQueryInterface().describeTable('studenttransports');

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
    } catch (err) {
        res.status(500).send({
            message: "Columns not fetched successfully",
            data: null
        });
    }
};



let  importStudentData= async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    let datafromexcel={}
    

    workbook.eachSheet((worksheet) => {
      const tableName = worksheet.name.trim();
      //console.log('tableName is:',tableName)
      if (tableName === 'Instructions') return;

      const rows = worksheet.getSheetValues();
      if (rows.length < 2) return;

      const headers = rows[1].slice(1); // Remove empty first cell if any
      const allrows = rows.slice(2);
      //console.log('headers is:',headers)
      //console.log('dataRows is:',dataRows)

       const records=allrows.map(row => {
           
           let record={}
           headers.forEach((header, i) => {
            
              record[header] = row[i + 1];
            
           })
           return record
        })
        datafromexcel[tableName]=records
       
    });

    console.log('datafrom excel is:',datafromexcel)

    // Example: Insert into database (adapt to your ORM)
    // for (const [tableName, records] of Object.entries(importData)) {
    //   await db(tableName).insert(records);   // or your model
    // }

    res.json({
      message: "Data parsed successfully",
      
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Import failed", error: error.message });
  }
};





const exportAllStudentData = async (req, res) => {
    try {


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
      FROM personalinformations p
      LEFT JOIN parentparticulars parent ON parent.reg_no = p.reg_no
      LEFT JOIN class_masters cm ON cm.id = p.class

      LEFT JOIN educationdetails edu ON edu.reg_no = p.reg_no
      LEFT JOIN otherinformations other ON other.reg_no = p.reg_no
      LEFT JOIN student_declarations decl ON decl.reg_no = p.reg_no
      LEFT JOIN studenttransports trans ON trans.reg_no = p.reg_no
    `;

        console.log("Query:", query);

        const results = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT
        });


       const records = await student_subject.findAll({
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



    } catch (err) {
        console.error('Export error:', err);
        res.status(500).json({
            message: "Error generating Excel file",
            error: err.message || 'Unknown error'
        });
    }
};






module.exports = {
    allColumnOfTable,
    exportAllStudentData,
    importStudentData

}