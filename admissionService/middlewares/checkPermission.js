const { ACTIONS, getEffectivePermissions } = require('../utils/accessPermission');

/**
 * Must run after verifystaff (needs req.staff).
 * Usage: router.post('/', verifystaff, checkPermission('subject', 'add'), controller.create)
 */
function checkPermission(moduleKey, action) {
  if (!ACTIONS.includes(action)) {
    throw new Error(`checkPermission: unknown action "${action}". Use one of: ${ACTIONS.join(', ')}`);
  }

  return async (req, res, next) => {
    try {
      if (!req.staff) {
        return res.status(401).json({ success: false, message: 'Access denied. Staff login required' });
      }

      const result = await getEffectivePermissions(req.staff);
      if (!result) {
        return res.status(401).json({ success: false, message: 'Staff not found' });
      }
     //console.log('results*****************************',result)
      req.permissions = result;

      if (result.role?.is_super_admin || result.permissions[moduleKey]?.[action]) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: `You do not have ${action} permission on ${moduleKey}`,
      });
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = checkPermission;
