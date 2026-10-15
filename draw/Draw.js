 /**
 * @module Draw
 * This class draw the course into an HTML Canvas element.
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
     * @method module:Draw
     * Constructor of class
     * @arg {String}  _element      HTML element
     * @arg {Integer} _course       Course data
     * @arg {Integer} _objects      Course objects
     * @arg {Integer} _sizeBase     Objects size
     * @instance
     * @access public
     * @return {this}
     */
    constructor(_element, _course, _objects, _sizeBase=20) {
        /* define element plot */
        this._base = parseFloat(_sizeBase); /* object size 20x20 */
        this._element = _element;
        this._canvas = null;
        this._context = null;
        this._canvasId = "courseDraw";
        /* course definitions */
        this._widthBlock = _course.widthBlock;
        this._heightBlock = _course.heightBlock;
        this._gameMode = _course.mode;
        this._gameTheme = _course.themeName;
        /* theme definitions */
        /*global BlockDraw */
        /*eslint no-undef: "error"*/
        this._blocks = new BlockDraw(this._gameMode, this._gameTheme);
        /*global MonsterDraw */
        /*eslint no-undef: "error"*/
        this._monsters = new MonsterDraw(this._gameMode, this._gameTheme);
        // Original Super Mario Maker track artwork.
        this._railSprite = new Image();
        this._railSprite.src = "./layout/draw/format/59.png";

        this._images = [
            this._blocks.getTheme(),
            this._monsters.getTheme(),
            this._railSprite
        ];
        /* draw configurations */
        let compare = function(a,b) {
            if (a.z < b.z) { return -1; }
            if (a.z > b.z) { return 1; }
            return 0;
        };
        this._objects = _objects.sort(compare); /* order by z-index */
        this._yFix = this._heightBlock*this._base; /* invert y to draw */
        
        /* call functions */
        this._init();
        this._drawBackground(this._widthBlock, this._heightBlock);
        this._drawObjects(this._objects);
    }

    /**
     * @method module:Draw::_init
     * Init the (HTML) canvas element
     * @access private
     * @return {null}
     */
    _init() {
        /* struct the draw table */
        let html = document.createElement("div");
        html.classList.add("courseDrawMain");
        html.classList.add("rounded");
        let canvas = document.createElement("canvas");
        canvas.id = this._canvasId;
        canvas.width = this._widthBlock*this._base;
        canvas.height = this._heightBlock*this._base;
        canvas.append("Your browser does not support the canvas element.");
        /* append elements */
        html.appendChild(canvas);
        document.getElementById(this._element).innerHTML = "";
        document.getElementById(this._element).append(html);
        /* save canvas element */
        this._canvas = canvas;
        this._context = this._canvas.getContext("2d");
        this._context.font = "10px sans-serif";
    }
    
    /**
     * @method module:Draw::_drawBackground
     * Draw the background
     * @arg {Integer} _x    Width block counting
     * @arg {Integer} _Y    Height block counting
     * @access private
     * @return {null}
     */
    _drawBackground(_X, _Y) {
        const $this = this;
        var bg = new Image($this._base, $this._base);
        bg.onload = function() {
            for(var y = _Y - 1; y >= 0; y--) {
                for(var x = 0; x < _X; x++) {
                    $this._context.drawImage(bg, x*$this._base, y*$this._base, $this._base, $this._base);
                }
            }
        };
        bg.onerror = function() {
            console.error("Draw: Error: squares don\"t load.");
        };
        bg.src = "./layout/draw/support/bg-square.png";
    }

    /**
     * @method module:Draw::_drawObjects
     * Draw the objects
     * @arg {Array[Object]} _objects    Array[CourseObject]
     * @access private
     * @return {null}
     */
    _drawObjects(_objects) {
        const $this = this;
        var imageCount = $this._images.length,
            loadedCount = 0;
        /* onerror event */
        var onerror = function(err) {
            let img = err.target;
            console.error("Draw: Error: theme don\"t exists.\n Path: "+img.src);
        },
        /* allloaded images */
        allloaded = function() {
            if(loadedCount === imageCount) {
                _objects.forEach(function(courseObject) {
                    let type = courseObject.type;
                    if (type === 59) {
                        $this._drawRail(courseObject);
                    }
                    else if($this._blocks.hasDraw(type)) {
                        $this._drawObjectFromTheme($this._blocks, courseObject);
                    }
                    else if($this._monsters.hasDraw(type)) {
                        $this._drawObjectFromTheme($this._monsters, courseObject);
                    }
                    else {
                        console.log("fault: "+type);
                        $this._drawText(courseObject.x, courseObject.y, type);
                    }
                });
            }
        },
        /* onload event */
        onload = function() {
            loadedCount++; allloaded();
        };
        /* loading all images */
        $this._images.forEach(function(img) {
            img.onload = onload; 
            img.onerror = onerror;
        });
    }

    /**
     * Draw a horizontal rail sprite section between two canvas points.
     * Uses the original track artwork from format/59.png.
     */
    _drawRailSpriteSegment(x1, y1, x2, y2) {
        const ctx = this._context;
        const sprite = this._railSprite;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.hypot(dx, dy);
        const angle = Math.atan2(dy, dx);

        if (!length || !sprite.complete || !sprite.naturalWidth) {
            return;
        }

        const scale = this._base / 16;

        ctx.save();
        ctx.translate(x1, y1);
        ctx.rotate(angle);
        ctx.imageSmoothingEnabled = false;

        // Repeat the rail portion of the original sprite.
        // Source columns 3-14 contain a repeatable rail section.
        const sourceX = 3;
        const sourceY = 6;
        const sourceWidth = 12;
        const sourceHeight = 4;

        const segmentLength = sourceWidth * scale;
        const railHeight = sourceHeight * scale;

        for (let offset = 0; offset < length; offset += segmentLength) {
            const drawWidth = Math.min(segmentLength, length - offset);

            ctx.drawImage(
                sprite,
                sourceX,
                sourceY,
                sourceWidth * (drawWidth / segmentLength),
                sourceHeight,
                offset,
                -railHeight / 2,
                drawWidth,
                railHeight
            );
        }

        ctx.restore();
    }

    /**
     * Draw a curved track using short sections of the original rail sprite.
     */
    _drawCurvedRail(cx, cy, radius, startAngle, endAngle) {
        const segmentCount = 32;
        const angleStep = (endAngle - startAngle) / segmentCount;

        for (let i = 0; i < segmentCount; i++) {
            const a1 = startAngle + i * angleStep;
            const a2 = startAngle + (i + 1) * angleStep;

            const x1 = cx + Math.cos(a1) * radius;
            const y1 = cy + Math.sin(a1) * radius;

            const x2 = cx + Math.cos(a2) * radius;
            const y2 = cy + Math.sin(a2) * radius;

            this._drawRailSpriteSegment(x1, y1, x2, y2);
        }
    }

    /**
     * Draw the original closed track endpoint.
     * The square remains upright regardless of rail orientation.
     */
    _drawRailEndCap(x, y) {
        const ctx = this._context;
        const sprite = this._railSprite;

        const scale = this._base / 16;

        // Original square endpoint artwork.
        const sourceX = 20;
        const sourceY = 4;
        const sourceWidth = 9;
        const sourceHeight = 9;

        const width = sourceWidth * scale;
        const height = sourceHeight * scale;

        ctx.save();

        // Keep the sprite aligned with the level's horizontal
        // and vertical axes, including its bottom-right shadow.
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(
            sprite,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            x - width / 2,
            y - height / 2,
            width,
            height
        );

        ctx.restore();
    }

    /**
    * Draw track geometry for object type 59.
    * Temporary diagnostic renderer for straight tracks.
    */
    _drawRail(courseObject) {
        const ctx = this._context;
        const base = this._base;
        const index = (courseObject.flags >>> 22) & 7;

        // Decode the two endpoint values from extendedData.
        const extended = courseObject.extendedData >>> 0;

        const endpointA = (extended >>> 16) & 0xFFFF;
        const endpointB = extended & 0xFFFF;

        // Endpoint codes 0x70-0x77 are closed.
        // Endpoint codes 0x80-0x87 are open.
        const endpointAClosed = endpointA >= 0x70 && endpointA <= 0x77;
        const endpointBClosed = endpointB >= 0x70 && endpointB <= 0x77;

        // Shift tracks one tile right and one tile up.
        const x = (courseObject.x + 1) * base;
        const y = this._yFix - (courseObject.y + 1) * base;

        // Endpoint offsets relative to the stored position.
        const endpoints = {
            0: [[-base, 0], [base, 0]],             // Horizontal
            1: [[0, -base], [0, base]],             // Vertical
            2: [[-base, -base], [base, base]],      // Descending diagonal
            3: [[-base, base], [base, -base]]       // Ascending diagonal
        };

        ctx.save();

        // Draw the track's dark outer rail.
        ctx.strokeStyle = "#101820";
        ctx.lineWidth = 8;
        ctx.lineCap = "butt";

        ctx.beginPath();

        if (index in endpoints) {
            const points = endpoints[index];

            const x1 = x + points[0][0];
            const y1 = y + points[0][1];

            const x2 = x + points[1][0];
            const y2 = y + points[1][1];

            // Draw the existing rail artwork.
            this._drawRailSpriteSegment(x1, y1, x2, y2);

            // Draw upright endpoint caps for all straight tracks.
            // Vertical tracks store their endpoint order in reverse.
            const reverseEndpoints = index === 1;

            if (endpointAClosed) {
                this._drawRailEndCap(
                    reverseEndpoints ? x2 : x1,
                    reverseEndpoints ? y2 : y1
                );
            }

            if (endpointBClosed) {
                this._drawRailEndCap(
                    reverseEndpoints ? x1 : x2,
                    reverseEndpoints ? y1 : y2
                );
            }
        } else {
            // Curved tracks use the verified centers and radius.
            const r = 2 * base;

            let cx, cy, startAngle, endAngle;

            switch (index) {
                case 4:
                    // Left-hand curve: upper-left to lower-right.
                    cx = x + base;
                    cy = y - base;
                    startAngle = Math.PI / 2;
                    endAngle = Math.PI;
                    break;

                case 5:
                    // Right-hand curve: upper-right to lower-left.
                    cx = x - base;
                    cy = y + base;
                    startAngle = -Math.PI / 2;
                    endAngle = 0;
                    break;

                case 6:
                    // Preserve the verified third curve.
                    cx = x + base;
                    cy = y + base;
                    startAngle = Math.PI;
                    endAngle = Math.PI * 1.5;
                    break;

                case 7:
                    // Fourth curve: lower-left to upper-right.
                    cx = x - base;
                    cy = y - base;
                    startAngle = 0;
                    endAngle = Math.PI / 2;
                    break;
            }

            // Draw the curved rail using the original track sprite.
            this._drawCurvedRail(cx, cy, r, startAngle, endAngle);

            // Calculate the two endpoints of the quarter-circle.
            const x1 = cx + Math.cos(startAngle) * r;
            const y1 = cy + Math.sin(startAngle) * r;

            const x2 = cx + Math.cos(endAngle) * r;
            const y2 = cy + Math.sin(endAngle) * r;

            // Each orientation has a verified start/end ordering.
            // Map CDT endpoint A and B independently to those positions.
            const endpointMapping = {
                4: { a: 0, b: 1 },
                5: { a: 1, b: 0 },
                6: { a: 1, b: 0 },
                7: { a: 0, b: 1 }
            };

            const mapping = endpointMapping[index];

            const positions = [
                { x: x1, y: y1 },
                { x: x2, y: y2 }
            ];

            const positionA = positions[mapping.a];
            const positionB = positions[mapping.b];

            // The physical A/B endpoint assignment is reversed
            // relative to the current curved-track mapping.
            if (endpointBClosed && positionA) {
                this._drawRailEndCap(positionA.x, positionA.y);
            }

            if (endpointAClosed && positionB) {
                this._drawRailEndCap(positionB.x, positionB.y);
            }
        }

        ctx.restore();
    }

    /**
     * @method module:Draw::_drawText
     * Draw a text
     * @arg {Integer} _x        X-axis
     * @arg {Integer} _y        Y-axis
     * @arg {Integer} text      Text
     * @access private
     * @return {null}
     */
    _drawText(_x, _y, text) {
        let x = _x*this._base,
            y = this._yFix - _y*this._base;
        this._context.fillText(text, x+3, y-3);
    }

    /**
     * @method module:Draw::_drawObjectFromTheme
     * Draw a object from a theme
     * @arg {Object} _theme         BlockDraw, or MonsterDraw
     * @arg {Object} courseObject   CourseObject
     * @access private
     * @return {null}
     */
    _drawObjectFromTheme(_theme, courseObject) {
        const $this = this;
        let def = _theme.getDef(courseObject.type),
            _titleset = _theme.getTheme(),
            _ts = _theme.getThemeSize(),
            _base = $this._base;
        let x = courseObject.x, y = courseObject.y;
        /* multiples cells */
        if(def.extend) {
            let ext = def.extend(courseObject);
            ext.forEach(function(drawExt) {
                let opacity = (drawExt.opacity) ? drawExt.opacity : null,
                    rotation = (drawExt.rotation) ? drawExt.rotation : null;
                var objectPaint = {
                    "titleset":_titleset, "xT":drawExt.xT, "yT":drawExt.yT, "xTs":_ts, "yTs":_ts,
                    "x":x, "y":y, "xExt":drawExt.x, "yExt":drawExt.y, "xBase":_base, "yBase":_base, 
                    "size":courseObject.size, "width":courseObject.width, 
                    "opacity":opacity, "rotation":rotation};
                $this._paintObject(objectPaint);
            });
        }
        /* only one cell */
        else {
            let xT = def.xT, yT = def.yT;
            if(def.func) {
                let nPos = def.func(courseObject);
                xT = nPos.xT; yT = nPos.yT;
            }
            var objectPaint = {
                "titleset":_titleset, "xT":xT, "yT":yT, "xTs":_ts, "yTs":_ts,
                "x":x, "y":y, "xExt":0, "yExt":0, "xBase":_base, "yBase":_base, 
                "size":courseObject.size, "width":courseObject.width};
            $this._paintObject(objectPaint);
        }
    }

    /**
     * @method module:Draw::_drawObjectFromTheme
     * Draw a object from a theme
     * @arg {Object} _objectPaint
     * @access private
     * @return {null}
     */
    _paintObject(_objectPaint) {
        let _titleset = _objectPaint.titleset, 
            _xT = _objectPaint.xT, _yT = _objectPaint.yT, 
            xTs = _objectPaint.xTs, yTs = _objectPaint.yTs, 
            _x = _objectPaint.x, _y = _objectPaint.y, 
            _xExt = _objectPaint.xExt, _yExt = _objectPaint.yExt, 
            _xBase = _objectPaint.xBase, _yBase = _objectPaint.yBase, 
            _size = _objectPaint.size, _width = _objectPaint.width,
            _opacity = _objectPaint.opacity,
            _rotation = _objectPaint.rotation;
        /* processing the data */
        let xT = (_xT*xTs), yT = (_yT*yTs);
        let x = (_size === 1) ?
                (_x + _xExt) * this._base :
                (_x + (_xExt * _size) - (2 - Math.ceil(_width/2))) * this._base;
        let y = (_size === 1) ?
                (this._yFix - (_y + _yExt) * this._base) - this._base :
                (this._yFix - (_y + (_yExt * _size) + 1) * this._base) - this._base;
        let xBase = _xBase * _size,
            yBase = _yBase * _size;
        /* process opacity */
        if(_opacity) {
            this._context.save();
            this._context.globalAlpha = _opacity;
            this._context.drawImage(_titleset, xT, yT, xTs, yTs, x, y, xBase, yBase);
            this._context.restore();
        }
        else if(_rotation) {
            let degree = (_rotation) * Math.PI / 180,
                xCenter = xBase / 2.0, yCenter = yBase / 2.0;
            let xRotation = x + xCenter,
                yRotation = y + yCenter;
            this._context.save();
            this._context.translate(xRotation, yRotation);
            this._context.rotate(degree);
            this._context.drawImage(_titleset, xT, yT, xTs, yTs, -xCenter, -yCenter, xBase, yBase);            
            this._context.restore();
        } /* wrong math ----- work only for one block */
        else {
            this._context.drawImage(_titleset, xT, yT, xTs, yTs, x, y, xBase, yBase);
        }
    }
}
