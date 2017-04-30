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
 *     name [string, e.g. "Harvey Mudd"]]
 *
 * The school names are assigned manually; all other fields are drawn
 * from the Portal Lingk API.
 *
 * This variable is null before the course data has been loaded.
 */
let courseData = null;

/**
 * The raw JSON returned by the Portal Lingk API.
 *
 * This variable is null before the course data has been loaded.
 */
let rawJSON = null;

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

/**
 * Given the JSON returned by the Portal Lingk API, process it into
 * nicely formatted course data. See the documentation for the
 * courseData variable.
 */
function parseCourseDataJSON(json) {
  console.log("Parsing course data JSON...");
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
  console.log("Finished parsing course data JSON.");
  return {"courses": courses,
          "sections": sections,
          "calendarRanges": calendarRanges,
          "sessions": sessions,
          "instructors": instructors,
          "schools": schools};
}

// This function is a hack, since the API at csearch.yancey.io returns
// JSONP rather than JSON. It should be removed once we have our own
// API.
/**
 * This function is called from the JSONP fetched from apiURL. It sets
 * the value of the courseData variable to the parsed JSON, and the
   value of the rawJSON variable to the unparsed JSON.
 */
function lingkCallback(json) {
  rawJSON = json;
  courseData = parseCourseDataJSON(json);
}
