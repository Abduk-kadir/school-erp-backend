// utils/generatePdf.js
const path = require('path');
const PDFDocument = require('pdfkit-table');
const { institute } = require('../models');
const { UPLOAD_ROOT } = require('../middlewares/multerConfig');

async function generatePdf({ title, columns, data }) {
 

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const chunks = []
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    (async () => {
        
      try {
        const inst = await institute.findOne({ raw: true });
        const logoPath = path.join(UPLOAD_ROOT, String(inst.logo).replace(/^\/uploads\/?/, ''));

        const headerTop = doc.y;
        const logoSize = 50;

        doc.image(logoPath, doc.page.margins.left, headerTop, {
          fit: [logoSize, logoSize],
        });

        const textWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        doc.fontSize(16).text(String(inst.name), doc.page.margins.left, headerTop + 5, {
          align: 'center',
          width: textWidth,
        });

        doc.fontSize(18).text(String(title), {
          align: 'center',
          width: textWidth,
        });

        doc.y = Math.max(doc.y, headerTop + logoSize);
        doc.moveDown();

        const tableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const columnsSize =
          columns.length > 0
            ? Array(columns.length).fill(tableWidth / columns.length)
            : [];

        await doc.table(
          {
            headers:columns,
            rows:data
          },
          {
            width: tableWidth,
            columnsSize,
            prepareHeader: () => doc.font('Helvetica-Bold').fontSize(9),
            prepareRow: () => doc.font('Helvetica').fontSize(8),
          }
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    })();
  });
}

module.exports = { generatePdf };
