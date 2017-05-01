////////////////////////////////////////////////////////////////////////////////
//// Logging

/**
 * Map of functions that can be used for logging.
 *
 * Use log.info, log.err, and log.debug instead of console.log.
 */
let log = {
  "debug": console.log,
  "err": console.log,
  "info": console.log
};

////////////////////////////////////////////////////////////////////////////////
//// Course data

/**
 * Data about valid courses, as a map.
 *
 * This is a map of maps. The keys in the top-level maps are strings
 * like "courses", "sections", etc. Each value is another map keyed by
 * GUID. Each value in the GUID maps is an entity represented as
 * another map. References between entities is done by GUID. This is
 * the overall layout:
 *
 * courseData
 *   courses
 *     code [string, e.g. "FGSS192  SC"]
 *     name [string, e.g. "Antiracist Feminist Queer Praxis"]
 *     description [string, e.g. "This course will explore intersectional ..."]
 *     school [GUID]
 *     sections [array of GUIDS]
 *   sections
 *     instructors [array of GUIDs]
 *     calendarRange [GUID]
 *     sessions [array of GUIDs]
 *     enrollment [map]
 *       current [integer, e.g. 16]
 *       max [integer, e.g. 20]
 *   calendarRanges
 *     start [date, e.g. 2016-08-30, as Date]
 *     end [date, e.g. 2016-12-16, as Date]
 *   sessions
 *     start [time, e.g. 7pm, as {"hour": 7, "minute": 0}]
 *     end [time, e.g. 9:45pm, as {"hour": 9, "minute": 45}]
 *     days [array of integers, e.g. [1, 3, 5]; Monday = 1, etc.]
 *   instructors
 *     firstName [string]
 *     lastName [string]
 *   schools
 *     name [string, e.g. "Harvey Mudd"]
 *
 * The school names are assigned manually; all other fields are drawn
 * from the Portal Lingk API.
 *
 * This variable is null before the course data has been loaded.
 */
let courseData = null;

////////////////////////////////////////////////////////////////////////////////
//// Fetch data

async function fetchCourseData() {
  log.info("Fetching course data...");
  let response = await fetch("courses.json");
  if (!response.ok) {
    log.err("Could not fetch course data: %d %s",
            response.status, response.statusText);
  }
  try {
    courseData = await response.json();
    log.info("Loaded course data.");
  }
  catch (err) {
    log.err("Could not parse course data: %s",
            err.message);
  }
}

////////////////////////////////////////////////////////////////////////////////
//// Main script

fetchCourseData();
