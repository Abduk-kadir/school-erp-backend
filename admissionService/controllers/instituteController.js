const { institute } = require('../models');
const path = require('path');
const fs=require('fs')

const instituteController = {

async create(req, res) {
    try {
      const { name, code } = req.body;

      if (!name || !code) {
        return res.status(400).json({ message: 'name and code are required' });
      }

      let logoPath = null;

      if (req.file) {
        // Save relative path or full URL depending on your frontend needs
        logoPath = `/uploads/institutes/logos/${req.file.filename}`;
        // or: logoPath = `${process.env.BASE_URL}/uploads/logos/${req.file.filename}`;
      }
      console.log('path is:', req.file)

      const inst = await institute.create({
        name,
        code,
        logo: logoPath,
      });
     
      return res.status(201).json({
        message: 'institute created successfully',
        data: inst,
      });
    } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'institute name or code already exists' });
      }
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },
async update(req, res) {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    const inst = await institute.findByPk(id);
    if (!inst) {
      return res.status(404).json({ message: 'institute not found' });
    }

    let logoPath = inst.logo;           // default: keep old
    let oldLogoFullPath = null;         // for deletion

    if (req.file) {                     // new file was uploaded
      logoPath = `/uploads/institutes/logos/${req.file.filename}`;

      // Prepare to delete old file (only if there was one before)
      if (inst.logo) {
        // Build full disk path — IMPORTANT: match your actual save location
        // This example assumes files are saved in E:\institutes\logos
        // and DB path starts with /uploads/institutes/logos/...
        oldLogoFullPath = path.join(
          'E:\\institutes\\logos',
          path.basename(inst.logo)   // extracts just the filename
        );
      }
    }

    // Update database
    await inst.update({
      name: name || inst.name,
      code: code || inst.code,
      logo: logoPath,
    });

    // Delete old file AFTER database is updated (safer)
    if (oldLogoFullPath && fs.existsSync(oldLogoFullPath)) {
      fs.unlink(oldLogoFullPath, (err) => {
        if (err) {
          console.error('Failed to delete old logo file:', err.message);
        } else {
          console.log('Old logo deleted successfully:', oldLogoFullPath);
        }
      });
    }

   
    

    return res.json({ message: 'institute updated', data: inst });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
},
 async getAll(req, res) {
    try {
      const institutes = await institute.findAll({
        attributes: ['id', 'name', 'code', 'logo', 'createdAt'],
        order: [['name', 'ASC']],
      });

      // Optional: make logo URLs absolute
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const institutesWithFullLogo = institutes.map(inst => ({
        ...inst.toJSON(),
        logo: inst.logo ? `${baseUrl}${inst.logo}` : null,
      }));

      return res.json({success:true,data:institutesWithFullLogo});
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },
   async getOne(req, res) {
    try {
      const { id } = req.params;

      const institute = await institute.findByPk(id);
      if (!institute) {
        return res.status(404).json({ message: 'institute not found' });
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const response = {
        ...institute.toJSON(),
        logo: institute.logo ? `${baseUrl}${institute.logo}` : null,
      };

      return res.json(response);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },


};

module.exports = instituteController;