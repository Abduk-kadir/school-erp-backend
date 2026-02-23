const {classWiseSchool,class_master} = require('../models');
const path = require('path');
const fs=require('fs');
const { json } = require('sequelize');

const classwiseSchoolController = {

async create(req, res) {
    try {
      const { class_id,school_name,address,contact_number,email,gst_number} = req.body;

      if (!class_id || !school_name) {
        return res.status(400).json({ message: 'class and school are required' });
      }
      let logo = null;
      if (req.file) {
        // Save relative path or full URL depending on your frontend needs
        logo = `/uploads/classWiseSchools/logos/${req.file.filename}`;
        // or: logoPath = `${process.env.BASE_URL}/uploads/logos/${req.file.filename}`;
      }
      console.log('path is:', req.file)

      const inst = await classWiseSchool.create({
         class_id,school_name,address,contact_number,email,gst_number,
        logo: logo,
      });
     
      return res.status(201).json({
        message: 'class wise created successfully',
        data: inst,
      });
    } catch (error) {
      console.error(error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ message: 'classWiseSchool name or code already exists' });
      }
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  },

async bulkCreate(req, res) {
  try {
    let  { class_id,school_name,address,contact_number,email,gst_number} = req.body;

   class_id=JSON.parse(class_id)
   let logo = null;
      if (req.file) {
        // Save relative path or full URL depending on your frontend needs
        logo = `/uploads/classwiseInstitutes/logos/${req.file.filename}`;
        // or: logoPath = `${process.env.BASE_URL}/uploads/logos/${req.file.filename}`;
      }

    let items=class_id.map(elem=>{
         return {class_id:elem.class_id,school_name,address,contact_number,email,gst_number,logo:logo}
       })
    
    const createdSchools = await classWiseSchool.bulkCreate(items, {
      validate: true,          
      individualHooks: false,   
    
    });
    
    

    return res.status(201).json({
      message: `Successfully created`,
      data:items
     
      
    });

  } catch (error) {
    console.error('Bulk create error:', error);

    

    return res.status(500).json({
      message: 'Server error during bulk creation',
      error: error.message,
    });
  }
},  
async update(req, res) {
  try {
    const { id } = req.params;
    const {class_id,school_name,address,contact_number,email,gst_number } = req.body;

    const inst = await classWiseSchool.findByPk(id);
    if (!inst) {
      return res.status(404).json({ message: 'classWiseSchool not found' });
    }

    let logoPath = inst.logo;           // default: keep old
    let oldLogoFullPath = null;         // for deletion

    if (req.file) {                     // new file was uploaded
      logoPath = `/uploads/classWiseSchools/logos/${req.file.filename}`;

      // Prepare to delete old file (only if there was one before)
      if (inst.logo) {
        // Build full disk path — IMPORTANT: match your actual save location
        // This example assumes files are saved in E:\classWiseSchools\logos
        // and DB path starts with /uploads/classWiseSchools/logos/...
        oldLogoFullPath = path.join(
          'E:\\classWiseSchools\\logos',
          path.basename(inst.logo)   // extracts just the filename
        );
      }
    }

    // Update database
    await inst.update({
      class_id: class_id || inst.class_id,
      school_name: school_name|| inst.school_name,
      address:address||inst.address,
      contact_number:contact_number||inst.contact_number,
      email:email||inst.email,
      gst_number:gst_number||inst.gst_number,
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

   
    

    return res.json({ message: 'classWiseSchool updated', data: inst });

  } catch (error) {
    console.error('Update error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
},
 async getAll(req, res) {
    try {
      const classWiseSchools = await classWiseSchool.findAll({
        include:[{
            model:class_master,
            as:"class",
            attributes: ['class_name']

        }]
       
      });

      // Optional: make logo URLs absolute
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const classWiseSchoolsWithFullLogo = classWiseSchools.map(inst => ({
        ...inst.toJSON(),
        logo: inst.logo ? `${baseUrl}${inst.logo}` : null,
      }));

      return res.json({success:true,data:classWiseSchoolsWithFullLogo});
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },
   async getOne(req, res) {
    try {
      const { id } = req.params;

      const classWiseSchool = await classWiseSchool.findByPk(id);
      if (!classWiseSchool) {
        return res.status(404).json({ message: 'classWiseSchool not found' });
      }

      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const response = {
        ...classWiseSchool.toJSON(),
        logo: classWiseSchool.logo ? `${baseUrl}${classWiseSchool.logo}` : null,
      };

      return res.json(response);
    } catch (error) {
      return res.status(500).json({ message: 'Server error' });
    }
  },


};

module.exports = classwiseSchoolController;