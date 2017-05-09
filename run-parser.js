#!/usr/bin/env node

let log = require("./log"),
    runParser = require("./parser");

runParser()
  .then(result => process.exit(0))
  .catch(err => {
    log.err(err);
    process.exit(1);
  });
