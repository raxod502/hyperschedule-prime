/**
   The course data, parsed out of the Portal Lingk API response.
*/
let courses = null;

/**
   Given the JSON returned by the Portal Lingk API, process it into a
   list of courses. See the documentation for the courses variable.
*/
function parseCourseDataJSON(json) {
  // FIXME: actually parse course data
  return json;
}

// This function is a hack, since the API at csearch.yancey.io returns
// JSONP rather than JSON. It should be removed once we have our own
// API.
/**
   This function is called from the JSONP fetched from apiURL. It sets
   the value of the courses variable to the parsed JSON.
*/
function lingkCallback(json) {
  courses = parseCourseDataJSON(json);
}
