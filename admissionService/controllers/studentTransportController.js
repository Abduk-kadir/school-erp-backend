const { StudentTransport, Route, SubRoute, PersonalInformation } = require('../models');
const { Op } = require('sequelize');

class StudentTransportController {
  // GET /api/student-transport
  static async getAll(req, res) {
    try {
      const transports = await StudentTransport.findAll({
        include: [
          { model: Route, as: 'Route', attributes: ['id', 'name'] },
          { model: SubRoute, as: 'SubRoute', attributes: ['id', 'name', 'distance_km'] },
          { model: PersonalInformation, as: 'PersonalInformation', attributes: ['reg_no', 'full_name', 'class', 'section'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: transports.length,
        data: transports
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // GET /api/student-transport/:id
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const transport = await StudentTransport.findByPk(id, {
        include: [
          { model: Route, as: 'Route' },
          { model: SubRoute, as: 'SubRoute' },
          { model: PersonalInformation, as: 'PersonalInformation' }
        ]
      });

      if (!transport) {
        return res.status(404).json({ success: false, message: 'Student transport record not found' });
      }

      return res.status(200).json({ success: true, data: transport });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // GET /api/student-transport/student/:reg_no
  static async getByStudent(req, res) {
    try {
      const { reg_no } = req.params;

      const records = await StudentTransport.findAll({
        where: { reg_no },
        include: [
          { model: Route, as: 'Route' },
          { model: SubRoute, as: 'SubRoute' },
          { model: PersonalInformation, as: 'PersonalInformation' }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: records.length,
        data: records
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // POST /api/student-transport
  static async create(req, res) {
    try {
      const { reg_no, route_id, sub_route_id, is_taken } = req.body;

      if (!reg_no || !route_id || !sub_route_id) {
        return res.status(400).json({
          success: false,
          message: 'reg_no, route_id and sub_route_id are required'
        });
      }

      // Prevent duplicate assignment (same student + same route + same sub-route)
      const existing = await StudentTransport.findOne({
        where: { reg_no, route_id, sub_route_id }
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'This student is already assigned to this route + sub-route combination'
        });
      }

      const transport = await StudentTransport.create({
        reg_no,
        route_id,
        sub_route_id,
        is_taken: is_taken || 'No'   // default
      });

      

      return res.status(201).json({ success: true, data: req.body, message: 'Student transport assignment created successfully' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // PATCH /api/student-transport/:id
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { is_taken, route_id, sub_route_id } = req.body;

      const transport = await StudentTransport.findByPk(id);

      if (!transport) {
        return res.status(404).json({ success: false, message: 'Transport record not found' });
      }

      await transport.update({
        is_taken: is_taken !== undefined ? String(is_taken) : transport.is_taken,
        route_id: route_id || transport.route_id,
        sub_route_id: sub_route_id || transport.sub_route_id
      });

      const updated = await StudentTransport.findByPk(id, {
        include: [
          { model: Route, as: 'Route' },
          { model: SubRoute, as: 'SubRoute' },
          { model: PersonalInformation, as: 'PersonalInformation' }
        ]
      });

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  // DELETE /api/student-transport/:id
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const transport = await StudentTransport.findByPk(id);

      if (!transport) {
        return res.status(404).json({ success: false, message: 'Transport record not found' });
      }

      await transport.destroy();

      return res.status(200).json({ success: true, message: 'Student transport assignment removed' });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
}

module.exports = StudentTransportController;