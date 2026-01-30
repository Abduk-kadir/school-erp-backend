const { StudentDocument } = require('../models');
const fs = require('fs');
const path = require('path');
const UPLOAD_ROOT = 'E:\\school-uploads-client1\\students';

class StudentDocumentController {
  // GET /api/student-documents/student/:reg_number
  static async getByStudent(req, res) {
    try {
      const { reg_number } = req.params;
      console.log('calling here:',reg_number)
      const documents = await StudentDocument.findAll({
        where: { reg_number: Number(reg_number) },
        include: [
          { model: require('../models').document_types, as: 'documentType',attributes: ['name'] },
        ],
        order: [['createdAt', 'DESC']],
      });
      const formattedData = documents.map(elem => {
      const plain = elem.toJSON();
      plain.document_type = elem.documentType?.name || null;
      delete plain.documentType;
      return plain;
    });
      return res.status(200).json({
        success: true,
        count: documents.length,
        data: formattedData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch student documents',
        error: error.message,
      });
    }
  }

  // GET /api/student-documents/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const doc = await StudentDocument.findByPk(id, {
        include: [
          { model: require('../models').DocumentType, as: 'documentType' },
        ],
      });

      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      return res.status(200).json({ success: true, data: doc });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST /api/student-documents/upload
 static async upload(req, res) {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { reg_number, document_id } = req.body;

    if (!reg_number || !document_id) {
      return res.status(400).json({
        success: false,
        message: 'reg_number and document_id are required',
      });
    }

    const regNumStr = reg_number.toString().trim();
    const docIdStr = document_id.toString().trim();

    // Generate filename
    const ext = path.extname(req.file.originalname || '.pdf');
    const newFileName = `${regNumStr}_${docIdStr}_${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;

    // Final path – directly in students folder (no subfolders)
    const newPath = path.join(UPLOAD_ROOT, newFileName);

    // Log for debugging
    console.log('Attempting to write file to:', newPath);
    console.log('Buffer size:', req.file.buffer.length);

    // Ensure the root folder exists
    if (!fs.existsSync(UPLOAD_ROOT)) {
      console.log('Creating root folder:', UPLOAD_ROOT);
      fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
    }

    // Write the file
    fs.writeFileSync(newPath, req.file.buffer);

    // Verify file was created
    if (!fs.existsSync(newPath)) {
      throw new Error('File was not created on disk after write');
    }

    console.log('File successfully written to disk');

    const relativePath = `/uploads/students/${newFileName}`;

    const newDoc = await StudentDocument.create({
      reg_number: Number(reg_number),
      document_id: Number(document_id),
      file_path: relativePath,
      original_filename: req.file.originalname,
    });

    return res.status(201).json({
      success: true,
      message: 'Document uploaded successfully',
      data: newDoc,
    });
  } catch (error) {
    console.error('Upload error details:', error);
    return res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
}
// PUT /api/student-documents/:id
static async update(req, res) {
  try {
    const { id } = req.params;

    const doc = await StudentDocument.findByPk(id);
    if (!doc) {
      return res.status(404).json({
        success: false,
        message: 'Document record not found',
      });
    }

    const { reg_number, document_id } = req.body;

    let newFilePath = doc.file_path; // keep old path if no new file
    let newOriginalName = doc.original_filename;
     console.log('new file path***',new file_path)
    console.log('new file name***',newOriginalName)

    // If a new file is uploaded → replace the old one
    if (req.file && req.file.buffer) {
      // Delete old file from disk (if exists)
      const oldFullPath = path.join(UPLOAD_ROOT, path.basename(doc.file_path));
      if (fs.existsSync(oldFullPath)) {
        fs.unlinkSync(oldFullPath);
        console.log('Old file deleted:', oldFullPath);
      }

      // Generate new filename
      const regNumStr = (reg_number || doc.reg_number).toString().trim();
      const docIdStr = (document_id || doc.document_id).toString().trim();
      const ext = path.extname(req.file.originalname || '.pdf');
      const newFileName = `${regNumStr}_${docIdStr}_${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`;
      const newPath = path.join(UPLOAD_ROOT, newFileName);

      // Write new file
      fs.writeFileSync(newPath, req.file.buffer);

      // Update path and name
      newFilePath = `/uploads/students/${newFileName}`;
      newOriginalName = req.file.originalname;
    }

    // Update record
    await doc.update({
      reg_number: reg_number !== undefined ? Number(reg_number) : doc.reg_number,
      document_id: document_id !== undefined ? Number(document_id) : doc.document_id,
      file_path: newFilePath,
      original_filename: newOriginalName,
      // Add more fields here later if needed (e.g., status, notes)
    });

    // Fetch updated record
    const updatedDoc = await StudentDocument.findByPk(id);

    return res.status(200).json({
      success: true,
      message: 'Document updated successfully',
      data: updatedDoc,
    });
  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Update failed',
      error: error.message,
    });
  }
}
  



  static async delete(req, res) {
    try {
      const { id } = req.params;

      const doc = await StudentDocument.findByPk(id);
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Document not found' });
      }

      // Delete physical file from disk
      const fullPath = path.join(__dirname, '..', doc.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }

      await doc.destroy();

      return res.status(200).json({
        success: true,
        message: 'Document deleted successfully',
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete document',
        error: error.message,
      });
    }
  }
}

module.exports = StudentDocumentController;