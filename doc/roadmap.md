**Roadmap**: planned features

## Fetching data

* **DONE** - Download JSONP from csearch.yancey.io and parse it into a
  sane format.
* **DONE** - Fetch and parse the JSONP on the backend and save it to a
  static file. Then load the file asynchronously on the client side.
* Hook up the JSON parser to the Portal Lingk API, once I get access
  to it, instead of csearch.yancey.io.

## User interface

* **DONE** - Create an HTML template for the webapp
* Add Bootstrap or Material Design to make the CSS look nice.

### Search pane

* Display a list of courses, paginating it if necessary. Make sure
  this doesn't lag.
* Allow filtering the courses using a search query.
* Make the table rows expandable and display the sections in the
  detail view.
* Add a Saved Courses data structure and enable the Save buttons in
  the Search table.

### Saved Courses pane

* Display saved courses in a list.
* Get the three-way toggle switch for sectioning commands working.
* Add sectioning functionality.
* Allow classes to be dragged and dropped to reorder them.
* Add a detail view.
* Add a data structure to keep track of which sections and courses are
  enabled, and allow these things to be toggled by the buttons.

### Schedule pane

* Make the toggle between Search and Schedule work.
* Figure out how to display courses on the Schedule table.
* Figure out what schedules are legit and allow displaying them.
* Display multiple schedules and allow toggling between them using the
  buttons.
* Add a slider that performs the same function as the buttons.
* Allow customizing the appearance of classes using the checkboxes.
* Display half-semester classes correctly.
* Display information about conflicts in the message area.
* Allow toggling between sections by clicking on a class block.

### Persistence and sync

* Save the state of the webapp to cookies on every update, and load it
  if possible.
