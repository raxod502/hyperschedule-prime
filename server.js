////////////////////////////////////////////////////////////////////////////////
//// Dependencies

let express = require("express"),
    log = require("./log"),
    runParser = require("./parser");

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

let app = express();

// Allow setting the port from the environment, for Heroku.
app.set("port", process.env.PORT || 5000);

////////////////////////////////////////////////////////////////////////////////
//// Middleware

app.use(express.static(__dirname));

////////////////////////////////////////////////////////////////////////////////
//// Routing

app.get("/", (req, res) => {
  res.render("index.html");
});

app.get("/hyperschedule.js", (req, res) => {
  res.render("hyperschedule.js");
});

app.get("/courses.json", (req, res) => {
  res.render("courses.json");
});

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
 * Run the parser, then start the server, then run the parser
 * repeatedly in the background.
 *
 * The parser is run repeatedly every second until it succeeds, before
 * the server is started. After the server is started, the parser is
 * run every 10 seconds.
 *
 * If isManual is true, only start the server.
 */
async function runParserRepeatedly(doStartServer) {
  if (!isManual) {
    try {
      log.info("Generating courses.json...");
      await runParser();
    }
    catch (err) {
      log.err("Error while generating courses.json. " +
              "Trying again in 1 second.");
      setTimeout(runParserRepeatedly, 1000, doStartServer);
    }
    log.info("Generated courses.json.");
  }
  if (doStartServer) {
    log.info("Starting server...");
    let port = await startServer();
    log.info(`Server running on port ${port}.`);
  }
  if (!isManual) {
    log.info("Regenerating courses.json in 10 seconds.");
    setTimeout(runParserRepeatedly, 10000, false);
  }
}

runParserRepeatedly(true)
  .catch(err => {
    log.err(err);
    process.exit(1);
  });
