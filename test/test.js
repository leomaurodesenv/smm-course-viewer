/* Include */
const smmCourseViewer = require("../lib/main.js");

// ## Try interpret a course file
// For example file in this path:
//   "[smm-course-viewer]/course-example/course_data.cdt"

smmCourseViewer.read("course-example/course_data.cdt", function(err, course, objects) {
    if(!err) {
        console.log(course);
        console.log(["array size of objects:", objects.length]);
    }
});
