#!/usr/bin/env node

////////////////////////////////////////////////////////////////////////////////
//// Dependencies

let express = require("express"),
    log = require("../lib/log"),
    path = require("path"),
    updateCourseData = require("../lib/api").updateCourseData;

////////////////////////////////////////////////////////////////////////////////
//// Command-line arguments

/**
 * If true, suppress automatic courses.json generation.
 */
let isManual = false;
for (let arg of process.argv.slice(2)) {
  if (arg == "--manual") {
    isManual = true;
  }
  else if (arg == "--no-manual") {
    isManual = false;
  }
}

////////////////////////////////////////////////////////////////////////////////
//// Express app init and config

/**
 * The Express app.
 */
let app = express();

// Allow setting the port from the environment, for Heroku.
app.set("port", process.env.PORT || 5000);

////////////////////////////////////////////////////////////////////////////////
//// Middleware

let resourcesDirectory = path.join(__dirname, "../../public");

app.use(express.static(resourcesDirectory));

////////////////////////////////////////////////////////////////////////////////
//// Main script

/**
 * Start the server asynchronously. It runs on port 5000 by default,
 * but this can be overridden by means of the PORT environment
 * variable.
 */
function startServer() {
  return new Promise((resolve, reject) => {
    app.listen(app.get("port"), () => resolve(app.get("port")));
  });
}

/**
 * Update courses.json, then start the server, then update
 * courses.json repeatedly in the background.
 *
 * If courses.json cannot be properly created, the operation is
 * retried repeatedly every second until it succeeds, before the
 * server is started. After the server is started, courses.json is
 * updated every 10 seconds.
 *
 * If isManual is true, only start the server.
 */
async function autoUpdateCourseData(doStartServer) {
  if (!isManual) {
    try {
      log.info("Generating courses.json...");
      await updateCourseData();
    }
    catch (err) {
      log.err(err.name + ": " + err.message);
      log.err("Error while generating courses.json. " +
              "Trying again in 1 second.");
      setTimeout(autoUpdateCourseData, 1000, doStartServer);
      return;
    }
    log.info("Generated courses.json.");
  }
  if (doStartServer) {
    log.info("Starting server...");
    let port = await startServer();
    log.info(`Server running on port ${port}.`);
  }
  if (!isManual) {
    log.info("Regenerating courses.json in 60 seconds.");
    setTimeout(autoUpdateCourseData, 60000, false);
  }
}

autoUpdateCourseData(true)
  .catch(err => {
    log.err(err);
    process.exit(1);
  });
