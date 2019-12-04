'use strict';
const {readInactiveLicenses} = require('./cron/readInactiveLicenses');

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
 */

module.exports = {

  // Send SMS Cronjob

  '0 */1 * * * *': async () => {
    // '*/15 * * * * *': async () => {

    try {
      strapi.log.info('Starting lisences cronjob');
      readInactiveLicenses();
    }
    catch (e) {
      strapi.log.info(`Error ${e.message}`);
    }
  },
};
