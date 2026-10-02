/**
 * Ensures a "Super Admin" role exists (is_super_admin = true) and optionally
 * assigns it to a staff member by email.
 *
 * Run from admissionService:
 *   node seedSuperAdmin.js                     -> only create/fix the role
 *   node seedSuperAdmin.js admin@school.com    -> also assign it to that staff
 */
require('dotenv').config();

const { Role, StaffRegistration, sequelize } = require('./models');

const ROLE_NAME = 'Super Admin';

async function main() {
  const email = process.argv[2] ? String(process.argv[2]).trim() : null;

  const [role, created] = await Role.findOrCreate({
    where: { role_name: ROLE_NAME },
    defaults: { is_super_admin: true, is_active: true, description: 'Full access to every module' },
  });

  if (!created && (!role.is_super_admin || !role.is_active)) {
    await role.update({ is_super_admin: true, is_active: true });
  }

  console.log(`${created ? 'Created' : 'Found'} role "${ROLE_NAME}" (id ${role.id})`);

  if (!email) {
    console.log('No email given. Run again with a staff email to assign this role.');
    return;
  }

  const staff = await StaffRegistration.findOne({ where: { email } });
  if (!staff) {
    console.error(`No staff found with email ${email}`);
    process.exitCode = 1;
    return;
  }

  await staff.update({ role_id: role.id });
  console.log(`Assigned "${ROLE_NAME}" to staff ${staff.id} (${staff.firstname || ''} ${staff.surname || ''})`.trim());
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
