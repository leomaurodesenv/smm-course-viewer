 /**
 * @module Draw
 * This class draw the course in html viewer.
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-course-viewer GitHub
 * @license https://opensource.org/licenses/GPL-3.0 GNU Public License (GPLv3)
 * @copyright 2019 Leonardo Mauro
 * @package smm-course-viewer
 * @access public
 */
class Draw {

    /**
     * @method module:Course
     * Constructor of class
     * @arg {String} _element       HTML element
     * @arg {Integer} _course       Course data
     * @arg {Integer} _objects      Course objects
     * @instance
     * @access public
     * @return {this}
     */
    constructor(_element, _course, _objects) {
        const $this = this;
        $this._base = 32;
        $this._element = _element;
        $this._widthBlock = _course.widthBlock;
        $this._heightBlock = _course.heightBlock;
        $this._objects = _objects;
        
        $this._init();
        $this._drawObjects();
    }

    _init(_callback) {
        let html = '<div class="courseDrawMain rounded">' +
                '<div class="courseDraw" id="courseDraw" style="width:'+this._widthBlock*this._base+'px;">'+
                this._objectBlocks(this._widthBlock, this._heightBlock)+'</div></div>';
        document.getElementById(this._element).innerHTML = html;
        //_callback();
    }
    
    _objectBlocks(_X, _Y) {
        var html = '';
        for(var y = _Y - 1; y >= 0; y--) {
            for(var x = 0; x < _X; x++) {
                let id = 'x'+x+'-y'+y;
                html += '<div id="'+id+'" title="'+id+'" class="objectDraw" alt="objectDraw"></div>';
            }
        }
        return html;
    }

    _drawObjects() {
        this._objects.forEach(function(courseObject) {
            let x = courseObject.x;
            let z = courseObject.z;
            let y = courseObject.y;
            document.getElementById('x'+x+'-y'+y).style.backgroundImage = courseObject.getObject();
        });
    }
    //<div class="objectDraw"><span>32</span></div>

}