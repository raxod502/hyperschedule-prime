This file outlines the plans for the user interface layout of
Hyperschedule.

## Page layout

Two columns. The left column has a toggle at the top between Search
and Schedule. The right column is Saved Courses.

## Search

On top, the search area. Below that, the results area.

In the search area, top left, two search boxes, Course and Professor.
Search is asynchronous and updates automatically. Both search queries
act as filters, unless one is blank. A number of heuristics are used
to determine whether it is a course code or course name that is being
searched for, and to normalize weird spacing, capitalization, and
other discrepancies that plague Portal search.

To the right of the search box, a list of potential filters. For
example:
* Department (dropdown menu)
* Time (dropdown menu)
* No conflicts with existing schedule
To the right of each filter, a + button to enable it. Enabled filters
appear on the left, below the search boxes.

In the results area, a table similar to the C-Search table. Columns:
Course Code, Name, Professor, Schedule, State. The State column has a
button labeled Save, or the text "Saved" and an X button, depending on
whether the course has been added to Saved Courses.

When you click on a row of the table, a detail pane opens directly
below, as in C-Search. The header is "Title (Course Code) - Full/Half
Semester", with a description following, and then a table of sections
(columns: Section, Professor, Schedule, Status).

## Schedule

On top, a pane for messages and settings. Naturally, this contains
buttons for moving between schedules, as well as a slider to move
quickly through a large number of schedules. (The two controls are
synchronized.)

A message would be displayed in the case that you enabled a course
that has a conflict with another course. The schedule would remain
unchanged, but the message would tell you about the conflict and which
class(es) you could remove to resolve the conflict.

Settings include: checkboxes for what you would like to display on
classes: course code, name, professor, status (open/closed).

The main schedule would be mostly the same as the traditional layout,
except that half-semester classes would be displayed on only one half
of their columns.

If you click on a class, it becomes highlighted, and all the other
sections of the class become visible on the schedule. If two sections
share a time, they are both listed on the box for that time, with the
current schedule's section number highlighted. Clicking elsewhere
cancels this mode, while clicking on the highlighted class cycles
through the sections. Clicking on another section at a different time
selects the first section at that time instead. If switching sections
creates a conflict, the conflicting class is removed (temporarily, if
the operation is canceled; persistently otherwise) with a message to
that effect in the message area.

## Saved Courses

At the top of the Saved Courses area there is a master toggle between
"By department" and "By time". The first sorts courses by their
department, and the second sorts them by their time slots.

Below each header (either a department name or a time-slot schedule),
there is a table of the courses falling into that category. It is laid
out the same as the table in the Search pane, except that there is an
additional column. The second-to-last column is now disable/enable for
the schedule, rather than add/remove from Saved Courses, and the (new)
last column has a button to remove the course from Saved Courses.

Clicking on a row of one of the tables (which automatically collapses
any other row previously expanded) reveals a detail view similar to
the one in Search, except that there is an additional column in the
table which allows you to disable/enable individual sections for
inclusion in the Schedule pane. If some sections are enabled and
others are disabled, the master disable/enable switch for the class is
shown in an intermediate state.
