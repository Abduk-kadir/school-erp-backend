const db = require('../models')
const sequelize = db.sequelize;
const ExcelJS = require('exceljs');


let allColumnOfTable = async (req, res) => {
    try {
        const personal = await sequelize.getQueryInterface().describeTable('personalinformations');
        const parentPar = await sequelize.getQueryInterface().describeTable('parentparticulars');
        const edu = await sequelize.getQueryInterface().describeTable('educationdetails');
        const oth = await sequelize.getQueryInterface().describeTable('otherinformations');
        const dec = await sequelize.getQueryInterface().describeTable('student_declarations');
        const sub = await sequelize.getQueryInterface().describeTable('student_subjects');
        const trans = await sequelize.getQueryInterface().describeTable('studenttransports');

        // Helper function to filter out 'id' and 'reg_no'
        const filterColumns = (columns) => Object.keys(columns).filter(col => col !== 'id' && col !== 'reg_no');

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
    exportAllStudentData

}