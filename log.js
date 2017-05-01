/**
 * Map of functions that can be used for logging.
 *
 * Use log.info, log.err, and log.debug instead of console.log.
 */
const log = {
  "debug": console.log,
  "err": console.error,
  "info": console.log
};

module.exports = log;
