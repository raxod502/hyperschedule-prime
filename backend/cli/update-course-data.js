#!/usr/bin/env node

let log = require("../lib/log"),
    updateCourseData = require("../lib/api").updateCourseData;

updateCourseData()
  .then(result => process.exit(0))
  .catch(err => {
    log.err(err);
    process.exit(1);
  });
