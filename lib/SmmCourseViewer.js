/**
 * @module _SmmCourseViewer
 * This class can read and interpret a course (*.cdt) of Super Mario Maker game.
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-course-viewer GitHub
 * @license https://opensource.org/licenses/GPL-3.0 GNU Public License (GPLv3)
 * @copyright 2019 Leonardo Mauro
 * @package smm-course-viewer
 * @access public
 */
class _SmmCourseViewer {

    /**
     * @method module:_SmmCourseViewer
     * Constructor of class
     * @var {Object} course
     * @var {Array[Object]} objects
     * @instance
     * @access public
     * @return {this}
     */
    constructor() {
        /* global variables */
        this.course = null;
        this.objects = [];
    }

    /**
     * @method module:_SmmCourseViewer::read
     * Read a file to extract course data
     * @arg {File} _file
     * @arg {Function} _callback
     * @instance
     * @access public
     * @return {this}
     */
    read(_file, _callback=function(){}) {
        console.log('SmmCourseViewer: read');
        this._file = _file;
        /* start read the file */
        this._readBinaryFile(this._file, function(eventRead) {
            if(eventRead) _callback(true);
            else _callback(false);
        });
    }

    /**
     * @method module:_SmmCourseViewer::_readBinaryFile
     * Read the binary file
     * @arg {File} _file
     * @arg {Function} _callback
     * @access private
     * @return {null}
     */
    _readBinaryFile(_file, _callback) {
        const $this = this;
        var reader = new FileReader();
        /* load file */
        reader.onloadend = function(eventReader) {
            try {
                let raw = reader.result;
                console.log('SmmCourseViewer: load file - raw '+raw.byteLength);
                const rawHex = $this._raw2hex(raw);
                $this._interpreterBinaryFile(rawHex, _callback);
            }
            catch(err) {
                console.log('SmmCourseViewer: Error: Read the binary!');
                console.log(err);
                _callback(false);
            }
        }
        reader.readAsArrayBuffer(_file);
    }

    /**
     * @method module:_SmmCourseViewer::_raw2hex
     * Raw to hexadecimal array
     * @arg {String} _raw
     * @access private
     * @return {Array[String]}
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
     * @arg {Integer} _pos
     * @arg {Integer} _size
     * @access private
     * @return {String}
     */
    _rawHex2hex(_rawHex, _pos, _size=1) {
        let hexString = '';
        for(let idx=_pos; idx<_pos+_size; idx++) hexString += _rawHex[idx];
        return hexString;
    }

    /**
     * @method module:_SmmCourseViewer::_rawHex2sint
     * Hexadecimal array to integer
     * @arg {Array[String]} _rawHex
     * @arg {Integer} _pos
     * @arg {Integer} _size
     * @access private
     * @return {Integer}
     */
    _rawHex2sint(_rawHex, _pos, _size=1) {
        /* extract hexadecimal and define sign rule */
        let hexString = this._rawHex2hex(_rawHex, _pos, _size);
        let hexParsed = parseInt(hexString, 16);
        let hexRule = {
            mask: 0x8 * Math.pow(16, hexString.length-1),
            sub: -0x1 * Math.pow(16, hexString.length)
        }
        /* return value signed */
        if((hexParsed & hexRule.mask) > 0) return (hexRule.sub + hexParsed); /* negative */
        else return hexParsed; /* positive */
    }

    /**
     * @method module:_SmmCourseViewer::_rawHex2uint
     * Hexadecimal array to integer
     * @arg {Array[String]} _rawHex
     * @arg {Integer} _pos
     * @arg {Integer} _size
     * @access private
     * @return {Integer}
     */
    _rawHex2uint(_rawHex, _pos, _size=1) {
        let hexString = this._rawHex2hex(_rawHex, _pos, _size);
        /* force unsigned (>>>) */
        return parseInt(hexString, 16) >>> 0;
    }

    /**
     * @method module:_SmmCourseViewer::_rawHex2string
     * Hexadecimal array to string
     * @arg {Array[String]} _rawHex
     * @arg {Integer} _pos
     * @arg {Integer} _size
     * @access private
     * @return {String}
     */
    _rawHex2string(_rawHex, _pos, _size=1) {
        let hexString = this._rawHex2hex(_rawHex, _pos, _size).toString();
        /* convert hex to ascii */
        let asciiVal = hexString.match(/.{1,2}/g).map(function(c){
            return String.fromCharCode(parseInt(c, 16));
        }).join('');
        /* remove null digit (ascii = 0) */
        let str = asciiVal.match(/[\x01-\x7F]/g).join('');
        return str;
    }

    /**
     * @method module:_SmmCourseViewer::_interpreterBinaryFile
     * Interpreter the binary file
     * @arg {Array[String]} _rawHex Hexadecimal array
     * @arg {Function} _callback
     * @access private
     * @return {null}
     */
    _interpreterBinaryFile(_rawHex, _callback) {
        const $this = this;
        $this._interpreterCourse(_rawHex, function(eventInterpreter) {
            if(eventInterpreter) _callback(true);
            else {
                console.log('SmmCourseViewer: Error: Interpret the binary!');
                _callback(false);
            }
        });
    }

    /**
     * @method module:_SmmCourseViewer::_interpreterCourse
     * Interpreter course data from the binary file
     * @arg {Array[String]} _rawHex Hexadecimal array
     * @arg {Function} _callback
     * @access private
     * @return {null}
     */
    _interpreterCourse(_rawHex, _callback) {
        /* FormatNotes
         * https://github.com/Treeki/MarioUnmaker/blob/master/FormatNotes.md
         */
        let version = this._rawHex2uint(_rawHex, 0x00, 8);
        let checksum = this._rawHex2uint(_rawHex, 0x08, 4);
        let year = this._rawHex2uint(_rawHex, 0x10, 2);
        let month = this._rawHex2uint(_rawHex, 0x12, 1);
        let day = this._rawHex2uint(_rawHex, 0x13, 1);
        let hour = this._rawHex2uint(_rawHex, 0x14, 1);
        let minute = this._rawHex2uint(_rawHex, 0x15, 1);
        let name = this._rawHex2string(_rawHex, 0x28, 66);
        let mode = this._rawHex2string(_rawHex, 0x6A, 2);
        let theme = this._rawHex2uint(_rawHex, 0x6D, 1);
        /* Course theme (0 = overworld, 1 = underground, 2 = castle, 3 = airship, 4 = water, 5 = ghost house) */
        let themeName = (theme == 0) ? 'overworld' :
                        (theme == 1) ? 'underground' :
                        (theme == 2) ? 'castle' :
                        (theme == 3) ? 'airship' :
                        (theme == 4) ? 'water' : 'ghostHouse';
        let timeLimit = this._rawHex2uint(_rawHex, 0x70, 2);
        /* Autoscroll (0 = none, 1 = slow, 2 = medium, 3 = fast) */
        let scroll = this._rawHex2uint(_rawHex, 0x72, 1);
        let scrollName = (scroll == 0) ? 'none' : 
                         (scroll == 1) ? 'slow' :
                         (scroll == 2) ? 'medium' : 'fast';
        let flags = this._rawHex2uint(_rawHex, 0x73, 1);
        let areaWidth = this._rawHex2uint(_rawHex, 0x74, 4);
        let hexMiiData = this._rawHex2hex(_rawHex, 0x78, 60); /* usually nothing */
        let objectCount = this._rawHex2uint(_rawHex, 0xEC, 4);
        /* course object */
        let course = new Course(version, checksum, year, month, day, hour, minute,
                            name, mode, theme, themeName, timeLimit, scroll, scrollName,
                            flags, areaWidth, hexMiiData, objectCount);
        this.course = course;
        this._interpreterObject(_rawHex, 0xF0, console.log); // until 2600 objects
        this._interpreterObject(_rawHex, 0xF0 + 0x20, console.log);
        this._interpreterObject(_rawHex, 0xF0 + 64, console.log);
        _callback(true);
    }

    /**
     * @method module:_SmmCourseViewer::_interpreterObject
     * Interpreter object data from the binary file
     * @arg {Array[String]} _rawHex Hexadecimal array
     * @arg {Integer} _pos
     * @arg {Function} _callback
     * @access private
     * @return {null}
     */
    _interpreterObject(_rawHex, _pos, _callback) {
        let x = this._rawHex2uint(_rawHex, _pos + 0x00, 4);
        let z = this._rawHex2uint(_rawHex, _pos + 0x04, 4);
        let y = this._rawHex2sint(_rawHex, _pos + 0x08, 2);
        let width = this._rawHex2sint(_rawHex, _pos + 0x0A, 1);
        let height = this._rawHex2sint(_rawHex, _pos + 0x0B, 1);
        let flags = this._rawHex2uint(_rawHex, _pos + 0x0C, 4);
        let childFlags = this._rawHex2uint(_rawHex, _pos + 0x10, 4);
        let extendedData = this._rawHex2uint(_rawHex, _pos + 0x14, 4);
        let type = this._rawHex2sint(_rawHex, _pos + 0x18, 1);
        let childType = this._rawHex2sint(_rawHex, _pos + 0x19, 1);
        let linkId = this._rawHex2sint(_rawHex, _pos + 0x1A, 2);
        let effect = this._rawHex2sint(_rawHex, _pos + 0x1C, 2);
        let transform = this._rawHex2sint(_rawHex, _pos + 0x1E, 1);
        let childTransform = this._rawHex2sint(_rawHex, _pos + 0x1F, 1);

        console.log('--object');
        console.log([x, z, y]);
        console.log([width, height]);
        console.log([flags, childFlags]);
        console.log(extendedData);
        console.log([type, childType]);
        console.log(linkId);
        console.log(effect);
        console.log([transform, childTransform]);
    }
}