////////////////////////////////////////////////////////////////////////////////
//// Dependencies

let fs = require("fs"),
    fetch = require("node-fetch");

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
//// Making API call

/**
 * URL that returns JSONP containing course data from the Portal Lingk
 * API.
 */
let apiURL = "https://csearch.yancey.io/courses.json";

/**
 * Return the JSON from the Portal Lingk API.
 *
 * The JSONP is unwrapped.
 */
async function getJSON() {
  let response = await fetch(apiURL);
  if (!response.ok) {
    throw new Error("API call failed: %d %s",
                    response.status, response.statusText);
  }
  let text = await response.text();
  if (text.slice(0, 14) == "lingkCallback(" &&
      text.slice(-2) == ")\n") {
    return JSON.parse(text.slice(14, -2));
  }
  else {
    let responseSummary;
    if (text.length > 16) {
      responseSummary = '"' + text.slice(0, 14) + "..." + text.slice(-2) + '"';
    }
    else {
      responseSummary = '"' + text + '"';
    }
    throw new Error("Malformed JSONP response: " + responseSummary);
  }
}

////////////////////////////////////////////////////////////////////////////////
//// JSON parsing utility functions

/**
 * Make sure obj is a string, and otherwise return null.
 *
 * Non-strings and empty strings are transformed into null.
 */
function parseString(obj) {
  if (typeof obj == "string" && obj.length > 0) {
    return obj;
  }
  return null;
}

/**
 * Make sure obj is an array, optionally parsing each element.
 *
 * Non-arrays are converted to empty arrays. If parser is provided, it
 * is used to transform each element, and falsy values are discarded.
 */
function parseArray(obj, parser) {
  if (Array.isArray(obj)) {
    return obj.map(parser || (x => x)).filter(x => x);
  }
  return [];
}

/**
 * Unwrap a single-element array.
 *
 * If obj is not an array, return null. Otherwise, return the first
 * element of obj. If parser is provided, it is used to transform the
 * element before it is returned.
 */
function parseSingleElementArray(obj, parser) {
  if (Array.isArray(obj) && obj.length > 0) {
    return (parser || (x => x))(obj[0]);
  }
  return null;
}

/**
 * Make sure obj is an integer, and otherwise return null.
 */
function parseInteger(obj) {
  let x = parseInt(obj);
  if (!isNaN(x)) {
    return x;
  }
  return null;
}

/**
 * Make sure obj is a Date. The format is YYYY-MM-DD.
 *
 * Strings that are not in this format are transformed to null.
 */
function parseDate(obj) {
  if (typeof obj == "string") {
    let parts = obj.split("-");
    if (parts.length == 3) {
      let year = parseInteger(parts[0]),
          month = parseInteger(parts[1]),
          day = parseInteger(parts[2]);
      if (year && month && day) {
        // JavaScript counts months from 0...
        return new Date(year, month - 1, day);
      }
    }
  }
  return null;
}

/**
 * Make sure obj is a time. The format is HHMM.
 *
 * Strings that are not in this format are transformed to null. The
   return value is a map with integer keys "hour" and "minute".
 */
function parseTime(obj) {
  if (typeof obj == "string" && obj.length == 4) {
    let hour = parseInteger(obj.slice(0, 2)),
        minute = parseInteger(obj.slice(2));
    if (hour && minute) {
      // JavaScript has no Time object, only DateTime... so we have to
      // handle things ourselves. If this gets unwieldy we can bring
      // in js-joda.
      return {
        "hour": hour,
        "minute": minute
      };
    }
  }
  return null;
}

/**
 * Parse and sanitize a days-of-week string.
 *
 * The string should be seven characters, where each character is "-"
 * if there is no class on a day, and something else if there is class
 * on that day. The first character corresponds to Sunday.
 *
 * Information about Saturday and Sunday is discarded. The return
 * value is an array of integers representing the days on which there
 * is class, with 1-5 corresponding to Monday-Friday respectively.
 *
 * Non-strings and improperly formatted strings are transformed to
 * null.
 */
function parseDays(obj) {
  if (typeof obj == "string" && obj.length == 7) {
    let days = [];
    // As of 2017-04-30, no classes have weekend sessions, so we
    // discard that information.
    for (let i = 1; i < 6; i++) {
      if (obj[i] != "-") {
        days.push(i);
      }
    }
    return days;
  }
  return null;
}

////////////////////////////////////////////////////////////////////////////////
//// JSON parsing

/**
 * Given the JSON returned by the Portal Lingk API, process it into
 * nicely formatted course data. See the documentation for the
 * courseData variable.
 */
function parseJSON(json) {
  let courses = {},
      sections = {},
      calendarRanges = {},
      sessions = {},
      instructors = {},
      schools = {};
  for (let course of json.data) {
    // Some implementation notes:
    //
    // We want to use null, not undefined, for absent values. Missing
    // arrays should be represented as empty arrays, not null. We
    // don't care about a one-to-one representation of the API output,
    // just what will make the most sense for the interface.
    let courseCode = parseString(course.courseNumber); // we use this later
    courses[course.courseGuid] = {
      "code": courseCode,
      "description": parseString(course.description),
      "name": parseString(course.courseTitle),
      "school": parseString(course.institutionGuid),
      "sections": parseArray(
        course.courseSections,
        x => parseString(x.courseSectionGuid)
      )
    };
    for (let section of course.courseSections || []) {
      sections[section.courseGuid] = {
        // As far as I can tell (2017-04-29), it's only ever possible
        // for a section to have one calendarSession. So we won't
        // bother with keeping track of other ones. If we don't have
        // any, it'll be null.
        "calendarRange": parseSingleElementArray(
          section.calendarSessions,
          x => parseString(x.calendarSessionGuid)
        ),
        "enrollment": {
          "current": parseInteger(section.currentEnrollment),
          "max": parseInteger(section.capacity)
        },
        "instructors": parseArray(
          section.sectionInstructor,
          x => parseString(x.staffGuid)
        ),
        "sessions": parseArray(
          section.courseSectionSchedule,
          x => x.CourseSectionScheduleGuid
        )
      };
      // There's only one calendarSession per section (see above), but
      // might as well iterate through all of them. It's cleaner, and
      // just in case the API changes later, we'll have less to
      // change.
      for (let calendarSession of section.calendarSessions || []) {
        calendarRanges[calendarSession.calendarSessionGuid] = {
          "start": parseDate(calendarSession.beginDate),
          "end": parseDate(calendarSession.endDate)
        };
      }
      for (let session of section.courseSectionSchedule || []) {
        sessions[session.CourseSectionScheduleGuid] = {
          "start": parseTime(session.ClassBeginningTime),
          "end": parseTime(session.ClassEndingTime),
          "days": parseDays(session.ClassMeetingDays)
        };
      }
      for (let instructor of section.sectionInstructor || []) {
        instructors[instructor.staffGuid] = {
          "firstName": parseString(instructor.firstName),
          "lastName": parseString(instructor.lastName)
        };
      }
    }
    if (courseCode) {
      let courseCodeSuffix = course.courseNumber.slice(-3);
      if (courseCodeSuffix[0] == " ") {
        let schoolID = courseCodeSuffix.slice(1);
        if (schoolID == "HM") {
          schools[course.institutionGuid] = "Harvey Mudd";
        }
        else if (schoolID == "PZ") {
          schools[course.institutionGuid] = "Pitzer";
        }
        else if (schoolID == "PO") {
          schools[course.institutionGuid] = "Pomona";
        }
        else if (schoolID == "CM") {
          schools[course.institutionGuid] = "CMC";
        }
        else if (schoolID == "SC") {
          schools[course.institutionGuid] = "Scripps";
        }
        // If none of the IDs match, that's OK, we can just skip this
        // course. We only need one course to match to identify the
        // institution. In theory, we could end up with an unmatched
        // GUID this way, but as of 2017-04-30, that doesn't happen.
      }
    }
  }
  return {"courses": courses,
          "sections": sections,
          "calendarRanges": calendarRanges,
          "sessions": sessions,
          "instructors": instructors,
          "schools": schools};
}

////////////////////////////////////////////////////////////////////////////////
//// Saving to disk

/**
 * Given the course data map, stringify it and write it to
 * courses.json.
 */
async function writeCourseData(courseData) {
  return new Promise((resolve, reject) => {
    fs.writeFile("courses.json", JSON.stringify(courseData), error => {
      if (error === null) {
        resolve(null);
      }
      else {
        reject(error);
      }
    });
  });
}

////////////////////////////////////////////////////////////////////////////////
//// Main script

/**
 * Download JSONP from the Portal Lingk API, parse it, and write it to
 * courses.json.
 *
 * If an error occurs, log a message and exit non-zero.
 */
function main() {
  getJSON()
    .then(parseJSON)
    .then(writeCourseData)
    .catch(error => {
      log.err(error.message);
      process.exit(1);
    });
}

main();
