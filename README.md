# smm-course-viewer

Simple viewer for level files from Super Mario Maker. Based on [MarioUnmaker](https://github.com/Treeki/MarioUnmaker/) and [PointlessMaker](https://github.com/aboood40091/PointlessMaker).   
This package has two main features: 
1. `smmCourseViewer`: Interpret/extract course data from .cdt files.
2. `Draw`: Draw the course in a HTML Canvas element.

The code is developed in Vanilla JS, but with extension to NodeJS. ([Code Documentation](/lib))   
Explore the monsters and objects of your Super Mario Maker courses, see ([Data Format](FORMAT.md)) for more details.   
   
---
### Summary

- [Code Documentation](/lib)
- [Drawing Documentation](/draw)
- [Data Format](FORMAT.md)
- [Installation](#installation)
    - Releases
    - Developing
- [Object Structure](#object-structure)

---
## Installation

See the [release](https://github.com/leomaurodesenv/smm-course-viewer/releases) for a stable HTML version.

1. Download or git clone.
    - `git clone https://github.com/leomaurodesenv/smm-course-viewer.git`
2. Open the `/index.html` in web browser.
3. _Load Example_ or _Browse..._ to a \*.cdt file.


To use the NodeJS version:
```shell
npm install --save smm-course-viewer
```

---
## NodeJS Example

Example: How to read courses files.   
Run this example `nodejs test/test.js`.
```js
/* Include */
const smmCourseViewer = require('smm-course-viewer');

// ## Try interpret a course file
smmCourseViewer.read('path/course_data.cdt', function(err, course, objects) {
    if(!err) {
        console.log(course)
        console.log(objects);
    }
});
```

---
## Object Structure

Accessing by a web browser:   
1. After _Load Example_ or _Browse_ for a file, the object is created.   
2. Open the web console, usually `Ctrl+Shift+k` or `F12`, and type `smmCourseViewer`.

```
course: 
  \_ ​name: string
  \_ ​mode: ['M1', 'M3', 'MW', 'WU']
  \_ ​timeLimit: number
  \_ ​scroll: [0, 1, 2, 3]
  \_ ​scrollName: ['none', 'slow', 'medium', 'fast']
  \_ ​theme: [0, 1, 2, 3, 4, 5]
  \_ ​themeName: ['overworld', 'underground', 'castle', 
                 'airship', 'water', 'ghostHouse']
  \_ year: number (creation)
  \_ ​month: number (creation)
  \_ day: number (creation)
  \_ hour: number (creation)
  \_ ​minute: number (creation)
  \_ ​​width: number
  \_ ​​widthBlock: number of blocks
  \_ ​heightBlock: number of blocks
  \_ ​objectCount: number
  \_ checksum: number (file check)
  \_ ​version: number
  \_ flags: (unknown)
  \_ hexMiiData: (unknown)
objects:
  \_ Array[CourseObject]
```
   
```
CourseObject:
  \_ name: string
  \_ x: X-axis
  \_ ​y: Y-axis
  \_ z: Z-index
  \_ height: number
  \_ width: number
  \_ size: number (only monsters)
  \_ ​​wing: boolean (only monsters)
  \_ ​​type: number (monster ID)
  \_ subType: number (sub ID)
  \_ ​​​flags: number (under discovery)
  \_ ​​​extendedData: number
  \_ effect: number (unknown)
  \_ transform: number (unknown)
  \_ ​​​childFlags: number (under discovery)
​​​  \_ ​​​childTransform: number (unknown)
  \_ ​​​childType: number (coupled monster)
  \_ linkId: number (coupled monster ~father)
```
   
---
### TODO

- Interpret rotation of the objects and monsters
    - [Data Format: TODO](FORMAT.md)
- Drawing
    - Background Theme
    - Objects/monsters rotation
- Take a printscreen of the course map
   
---
### Also look ~

Any suggestions or doubts, please open an "issue".   
If you want to contribute, make a "pull request".   

- [License GPLv3](LICENSE)
- Create by Leonardo Mauro (leo.mauro.desenv@gmail.com)
- GitHub: [leomaurodesenv](https://github.com/leomaurodesenv/)