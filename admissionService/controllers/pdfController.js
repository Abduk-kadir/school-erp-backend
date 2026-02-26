// controllers/pdfController.js
const { sequelize } = require('../models');
const { student_subject, PersonalInformation, class_master, Program, Subject, ElectiveBasket, StudentTransport, Route, SubRoute ,student_declaration,Declaration} = require('../models');

const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');

exports.generateAdmissionPDF = async (req, res) => {
    let browser;
    try {
        const { reg_no } = req.body;

        const [personalData] = await sequelize.query(`
      SELECT *
      FROM personalinformations WHERE personalinformations.reg_no = :reg_no
    `, {
            replacements: { reg_no },
            type: sequelize.QueryTypes.SELECT
        });

        const [educationData] = await sequelize.query(`
      SELECT *
      FROM educationdetails WHERE educationdetails.reg_no = :reg_no
    `, {
            replacements: { reg_no },
            type: sequelize.QueryTypes.SELECT
        });

        const [parentPartData] = await sequelize.query(`
      SELECT *
      FROM parentparticulars WHERE parentparticulars.reg_no = :reg_no
    `, {
            replacements: { reg_no },
            type: sequelize.QueryTypes.SELECT
        });

        const [otherinfor] = await sequelize.query(`
      SELECT *
      FROM otherinformations WHERE otherinformations.reg_no = :reg_no
    `, {
            replacements: { reg_no },
            type: sequelize.QueryTypes.SELECT
        });



        const stSubject = await student_subject.findAll({
            where: { student_reg_no: parseInt(reg_no) },
            include: [

                { model: Subject, as: 'subject' },

            ],

        });
        const plainSubjects = stSubject.map(record => record.get({ plain: true }));

       
        const transp = await StudentTransport.findOne({
            where: { reg_no },
            include: [
                { model: Route, as: 'Route' },
                { model: SubRoute, as: 'SubRoute' },

            ],
            order: [['createdAt', 'DESC']]
        });
       const transportData = transp ? transp.get({ plain: true }) : null;

      const dec = await student_declaration.findOne({
        where: { reg_no },
        include: [
          {
            model: Declaration,
            as: 'declaration',
            attributes: ['id', 'content'],
          },
        ],
      
      });

      const declarationData=dec? dec.get({ plain: true }) : null;


       console.log('transportData',transportData)
        const renderData = {
            personalInformationData: personalData,
            educationalData: educationData,
            parentparticularData: parentPartData,
            otherInformationData: otherinfor,

            subjectData: plainSubjects,
            transportData: transportData,
            declarationData:declarationData

        };



        const templatePath = path.join(__dirname, '../views/admission-form.ejs');

        // 2. Render EJS → get HTML string
        const html = await ejs.renderFile(templatePath, renderData, {
            // Helps EJS find partials if you use <%- include('partial.ejs') %>
            views: [path.join(__dirname, '../views')],
        });

        // 3. Launch puppeteer
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--font-render-hinting=medium',
            ],
        });

        const page = await browser.newPage();

        // 4. Load HTML into page
        await page.setContent(html, {
            waitUntil: ['networkidle0', 'load', 'domcontentloaded'],
            timeout: 45000,
        });

        // Wait for fonts (especially if using Devanagari/Marathi fonts)
        await page.evaluate(() => document.fonts.ready);

        // 5. Generate PDF
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,       // Very important → shows borders, colors, images
            margin: { top: '8mm', right: '6mm', bottom: '8mm', left: '6mm' },
            scale: 0.92,                 // Tiny shrink often fixes overflow in dense forms
            preferCSSPageSize: true,
        });

        await browser.close();

        // 6. Send PDF to frontend
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="admission-${'student'}-${reg_no || ''}.pdf"`
        );

        return res.send(pdfBuffer);

    } catch (err) {
        if (browser) await browser.close().catch(() => { });
        console.error('PDF Error:', err);
        return res.status(500).json({
            success: false,
            message: 'PDF generation failed',
            error: err.message,
        });
    }
};