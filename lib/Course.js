/**
 * @module Course
 * This class is a struct for course data.
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-course-viewer GitHub
 * @license https://opensource.org/licenses/GPL-3.0 GNU Public License (GPLv3)
 * @copyright 2019 Leonardo Mauro
 * @package smm-course-search
 * @access public
 */
class Course {
 
    /**
     * @method module:Course
     * Constructor of class
     * @var {Integer} version       SMM version
     * @var {Integer} checksum      File (.cdt) checksum
     * @var {String} year           Creation time (year)
     * @var {String} month          Creation time (month)
     * @var {String} day            Creation time (day)
     * @var {String} hour           Creation time (hour)
     * @var {String} minute         Creation time (minute)
     * @var {String} name           Name
     * @var {String} mode           Mode: 'M1', 'M3', 'MW', 'WU'
     * @var {Integer} theme         Theme: 0, 1, 2, 3, 4, 5
     * @var {String} themeName      Theme: 'overworld', 'underground', 'castle', 'airship', 'water', 'ghostHouse'
     * @var {Integer} timeLimit     Time limit
     * @var {Integer} scroll        Scroll: 0, 1, 2, 3
     * @var {Integer} scroll        Scroll: 'none', 'slow', 'medium', 'fast'
     * @var {Integer} flags         Unknow -
     * @var {Integer} areaWidth     Width size
     * @var {Integer} objectCount
     * @instance
     * @access public
     * @returns {this}
     */
    constructor(_version, _checksum, _year, _month, _day, _hour, _minute,
                _name, _mode, _theme, _themeName, _timeLimit, _scroll, _scrollName,
                _flags, _areaWidth, _hexMiiData, _objectCount) {
        this.version = _version;
        this.checksum = _checksum;
        this.year = ('0000' + _year).slice(-4);
        this.month = ('00' + _month).slice(-2); this.day = ('00' + _day).slice(-2);
        this.hour = ('00' + _hour).slice(-2); this.minute = ('00' + _minute).slice(-2);
        this.name = _name;
        this.mode = _mode;
        this.theme = _theme; this.themeName = _themeName;
        this.timeLimit = _timeLimit;
        this.scroll = _scroll; this.scrollName = _scrollName;
        this.flags = _flags;
        this.areaWidth = _areaWidth;
        this._hexMiiData = _hexMiiData; // usually nothing
        this.objectCount = _objectCount;
    }


}   