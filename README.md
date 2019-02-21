# smm-course-viewer

Simple viewer for level files from Super Mario Maker.   
This package has two main features: 
1. `SmmCourseViewer`: Interpret/extract course data from .cdt files (of Wii U/CEMU).
2. `Draw`: Draw the course in a HTML Canvas element.

The code is developed in Vanilla JS, but with extension to NodeJs (_under development_). ([Documentation](/lib))   
Based on [MarioUnmaker](https://github.com/Treeki/MarioUnmaker/blob/master/FormatNotes.md) and [PointlessMaker](https://github.com/aboood40091/PointlessMaker).   
   
---

**Summary**:
- [Documentation](/lib)
- [Installation](#installation)
    - Releases
    - Developing
- [Object Structure](#object-structure)
- [TODO](#todo)

---
## Installation

See the [release](https://github.com/leomaurodesenv/smm-course-viewer/releases) for a stable version.

1. Download or git clone.
    - `git clone https://github.com/leomaurodesenv/smm-course-viewer.git`
2. Open the `/index.html` in web browser.
3. _Load Example_ or _Browse..._ to your .cdt file.

---

## Object Structure

After _Load Example_ or _Browse_ for a file, the `courseViewer` object is created.   
To access the course data, open the web console, usually `Ctrl+Shift+k` or `F12`.

```json
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
   
```json
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
###TODO:

- Interpret objects
    - Inanimate objects ~Blocks (ok)
    - Monsters and player (_doing_)
- Draw
    - Draw blocks (ok)
    - Draw monsters (_doing_)
- Take a printscreen of the course map
- _Extract characteristics from the course_ (Data Mining)

Any suggestions or doubts, please open an "issue".   
If you want to contribute, make a "pull request".   
   
---
### Also look ~

- [License GPLv3](LICENSE)
- Create by Leonardo Mauro (leo.mauro.desenv@gmail.com)
- GitHub: [leomaurodesenv](https://github.com/leomaurodesenv/)
- Site: [Portfolio](http://leonardomauro.com/portfolio/)