/**
 * @module _SmmCourseViewer
 * This class can read and interpret a course (*.cdt) of Super Mario Maker game.
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-course-viewer GitHub
 * @license https://opensource.org/licenses/GPL-3.0 GNU Public License (GPLv3)
 * @copyright 2019 Leonardo Mauro
 * @package smm-course-search
 * @access public
 */
class _SmmCourseViewer {

    /**
     * @method module:_SmmCourseViewer
     * Constructor of class
     * @arg {File} _file
     * @instance
     * @access public
     * @returns {this}
     */
    constructor(_file) {
        console.log('SmmCourseViewer: start');
        /* global variables */
        this._file = _file;
        this._course = null;
        this._objects = [];
        /* start read the file */
        this._readBinaryFile(this._file);
    }

    /**
     * @method module:_SmmCourseViewer::_readBinaryFile
     * Read the binary file
     * @arg {File} _file
     * @access private
     * @returns {null}
     */
    _readBinaryFile(_file) {
        const $this = this;
        var reader = new FileReader();
        
        /* load file */
        reader.onloadend = function(eventReader) {
            let raw = reader.result;
            console.log('SmmCourseViewer: load file - raw '+raw.byteLength);
            const rawHex = $this._raw2hex(raw);
            $this._interpreterBinaryFile(rawHex);
        }
        reader.readAsArrayBuffer(_file);
    }

    /**
     * @method module:_SmmCourseViewer::_raw2hex
     * Raw to hexadecimal array
     * @arg {String} _raw
     * @access private
     * @returns {Array[String]}
     */
    _raw2hex(_raw) {
        let rawBytes = new Uint8Array(_raw);
        var rawHex = [];
        for (let cycle = 0; cycle < _raw.byteLength; cycle++) {
            let value = rawBytes[cycle].toString(16);
            rawHex.push((value.length == 1) ? '0'+value : value);
        }
        return rawHex;
    }

    /**
     * @method module:_SmmCourseViewer::_rawHex2hex
     * Hexadecimal array to hexadecimal string
     * @arg {Array[String]} _rawHex
     * @arg {Integer} _i
     * @arg {Integer} _size
     * @access private
     * @returns {String}
     */
    _rawHex2hex(_rawHex, _i, _size=1) {
        let hexString = '';
        for(let idx=_i; idx<_i+_size; idx++) hexString += _rawHex[idx];
        return hexString;
    }

    /**
     * @method module:_SmmCourseViewer::_rawHex2int
     * Hexadecimal array to integer
     * @arg {Array[String]} _rawHex
     * @arg {Integer} _i
     * @arg {Integer} _size
     * @access private
     * @returns {Integer}
     */
    _rawHex2int(_rawHex, _i, _size=1) {
        let hexString = this._rawHex2hex(_rawHex, _i, _size);
        return parseInt(hexString, 16);
    }

    /**
     * @method module:_SmmCourseViewer::_rawHex2string
     * Hexadecimal array to string
     * @arg {Array[String]} _rawHex
     * @arg {Integer} _i
     * @arg {Integer} _size
     * @access private
     * @returns {String}
     */
    _rawHex2string(_rawHex, _i, _size=1) {
        let hexString = this._rawHex2hex(_rawHex, _i, _size).toString();
        /* convert hex to ascii */
        let asciiVal = hexString.match(/.{1,2}/g).map(function(c){
            return String.fromCharCode(parseInt(c, 16));
        }).join('');
        /* remove unknow caracter (ascii = 0) */
        let str = asciiVal.match(/[\x01-\x7F]/g).join('');
        return str;
    }

    /**
     * @method module:_SmmCourseViewer::_interpreterBinaryFile
     * Interpreter the binary file
     * @arg {Array[String]} _rawHex Hexadecimal array
     * @access private
     * @returns {null}
     */
    _interpreterBinaryFile(_rawHex) {
        this.course = this._interpreterCourse(_rawHex);
    }

    /**
     * @method module:_SmmCourseViewer::_interpreterCourse
     * Interpreter course data from the binary file
     * @arg {Array[String]} _rawHex Hexadecimal array
     * @access private
     * @returns {Object}
     */
    _interpreterCourse(_rawHex) {
        /* FormatNotes
         * https://github.com/Treeki/MarioUnmaker/blob/master/FormatNotes.md
         */
        let version = this._rawHex2int(_rawHex, 0x00, 8);
        let checksum = this._rawHex2int(_rawHex, 0x08, 4);
        let year = this._rawHex2int(_rawHex, 0x10, 2);
        let month = this._rawHex2int(_rawHex, 0x12, 1);
        let day = this._rawHex2int(_rawHex, 0x13, 1);
        let hour = this._rawHex2int(_rawHex, 0x14, 1);
        let minute = this._rawHex2int(_rawHex, 0x15, 1);
        let name = this._rawHex2string(_rawHex, 0x28, 66);
        let mode = this._rawHex2string(_rawHex, 0x6A, 2);
        let theme = this._rawHex2int(_rawHex, 0x6D, 1);
        /* Course theme (0 = overworld, 1 = underground, 2 = castle, 3 = airship, 4 = water, 5 = ghost house) */
        let themeName = (theme == 0) ? 'overworld' :
                        (theme == 1) ? 'underground' :
                        (theme == 2) ? 'castle' :
                        (theme == 3) ? 'airship' :
                        (theme == 4) ? 'water' : 'ghostHouse';
        let timeLimit = this._rawHex2int(_rawHex, 0x70, 2);
        /* Autoscroll (0 = none, 1 = slow, 2 = medium, 3 = fast) */
        let scroll = this._rawHex2int(_rawHex, 0x72, 1);
        let scrollName = (scroll == 0) ? 'none' : 
                         (scroll == 1) ? 'slow' :
                         (scroll == 2) ? 'medium' : 'fast';
        let flags = this._rawHex2int(_rawHex, 0x73, 1);
        let areaWidth = this._rawHex2int(_rawHex, 0x74, 4);
        let hexMiiData = this._rawHex2hex(_rawHex, 0x78, 60); /* usually nothing */
        let objectCount = this._rawHex2int(_rawHex, 0xEC, 4);
        /* course object */
        var course = new Course(version, checksum, year, month, day, hour, minute,
                            name, mode, theme, themeName, timeLimit, scroll, scrollName,
                            flags, areaWidth, hexMiiData, objectCount);
        return course;
    }

}