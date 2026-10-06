const ExcelJS = require('exceljs');

async function generateExcel({ title, columns, data }) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  worksheet.addRow(columns).font = { bold: true };
  worksheet.addRows(data);

  return workbook.xlsx.writeBuffer();
}

module.exports = { generateExcel };
