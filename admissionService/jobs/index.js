const startAttendanceReminderJob = require('./attendanceCrone.js');

function startAllJobs() {
  console.log('Starting all cron jobs...');

  startAttendanceReminderJob();
 

  console.log('All cron jobs are running');
}

module.exports = startAllJobs;