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
        this._base = 32;
        this._element = _element;
        this._canvas = null;
        this._context = null;
        this._canvasId = 'courseDraw';
        this._widthBlock = _course.widthBlock;
        this._heightBlock = _course.heightBlock;
        this._yFix = this._heightBlock*this._base;

        let compare = function(a,b) {
            if (a.last_nom < b.last_nom)
                return -1;
            if (a.last_nom > b.last_nom)
            return 1;
          return 0;
        }
        this._objects = _objects;
        
        this._init();
        this._drawBlocks(this._widthBlock, this._heightBlock);
        this._drawObjects(this._objects);
    }

    _init() {
        let html = '<div class="courseDrawMain rounded">' +
                '<canvas id="'+this._canvasId+'" class="courseDraw" width="'+this._widthBlock*this._base+'px" height="864px">'+
                'Your browser does not support the canvas element.</canvas></div>';
        document.getElementById(this._element).innerHTML = html;
        this._canvas = document.getElementById(this._canvasId);
        this._context = this._canvas.getContext('2d');
    }
    
    _drawBlocks(_X, _Y) {
        /* https://www.w3schools.com/tags/canvas_drawimage.asp */
        const $this = this;
        var img = new Image(32, 32);
        img.onload = function(){
            for(var y = _Y - 1; y >= 0; y--) {
                for(var x = 0; x < _X; x++) {
                    $this._context.drawImage(img, x*$this._base, y*$this._base);
                }
            }
        };
        img.src = './layout/draw/support/bg-square.png';
    }

    _drawObjects(objects) {
        const $this = this;
        objects.forEach(function(courseObject) {
            let x = courseObject.x*$this._base;
            let z = courseObject.z;
            let y = $this._yFix - courseObject.y*$this._base;
            $this._context.font = '10px sans-serif';
            $this._context.fillText(courseObject.type, x+9, y-12);
        });
    }
    

}