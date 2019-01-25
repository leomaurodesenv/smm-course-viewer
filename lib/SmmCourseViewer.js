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
     * @method module:_SmmCourseViewer::_hex2int
     * Hexadecimal string to integer
     * @arg {String} _hexString
     * @access private
     * @returns {Integer}
     */
    _hex2int(_hexString) {
        return parseInt(_hexString, 16);
    }

    /**
     * @method module:_SmmCourseViewer::_rawHex2hex
     * Hexadecimal array to string
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
        return this._hex2int(hexString);
    }

    /**
     * @method module:_SmmCourseViewer::_rawHex2string
     * Hexadecimal array to integer
     * @arg {Array[String]} _rawHex
     * @arg {Integer} _i
     * @arg {Integer} _size
     * @access private
     * @returns {String}
     */
    _rawHex2string(_rawHex, _i, _size=1) {
        let hexString = this._rawHex2hex(_rawHex, _i, _size).toString();
        let str = '';
        for (var n = 0; n < hexString.length; n += 2) {
            str += String.fromCharCode(parseInt(hexString.substr(n, 2), 16));
        }
        return str;
    }

    /**
     * @method module:_SmmCourseViewer::_interpreterBinaryFile
     * Ibterpreter the binary file
     * @arg {ArrayBuffer} _buffer
     * @access private
     * @returns {null}
     */
    _interpreterBinaryFile(_rawHex) {
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
        
        let unknown1 = this._rawHex2int(_rawHex, 0x16, 1);
        let unknown2 = this._rawHex2int(_rawHex, 0x17, 1);
        let unknown3 = this._rawHex2int(_rawHex, 0x18, 8); // why u64?
        let unknown4 = this._rawHex2int(_rawHex, 0x20, 1);
        let name = this._rawHex2string(_rawHex, 0x28, 66); // u16[0x21] = 2*33 = 66
        let mode = this._rawHex2string(_rawHex, 0x6A, 2);

        console.log(year+'/'+month+'/'+day);
        console.log(hour+':'+minute);
        console.log(unknown1);
        console.log(unknown2);
        console.log(unknown3);
        console.log(unknown4);
        console.log('name: '+this._rawHex2string(_rawHex, 0x28, 66)); // https://www.w3resource.com/javascript-exercises/javascript-string-exercise-28.php
        console.log('name: '+this._rawHex2hex(_rawHex, 0x28, 66));
        console.log('mode: '+mode);
    }

}

class Course {
 
    constructor(i, f) {
        this.i = i;
        this.f = f;
    }
}   