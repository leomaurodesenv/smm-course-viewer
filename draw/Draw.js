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
        this._goalTape = new Image();
        this._goalTape.src = "./layout/draw/format/27-0.png";

        this._images = [
            this._blocks.getTheme(),
            this._monsters.getTheme(),
            this._goalTape
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
                    if($this._blocks.hasDraw(type)) {
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
        $this._images.forEach(function (img) {
            if (img.complete && img.naturalWidth > 0) {
                onload();
            } else {
                img.onload = onload;
                img.onerror = onerror;
            }
        });
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

        /* Castle bridges should only appear in Castle themes. */
        if (courseObject.type === 49 && $this._gameTheme !== "castle") {
            return;
        }

        /* Draw the Castle axe goal for all game styles. */
        if (courseObject.type === 27 &&
            $this._gameTheme === "castle") {

            // The axe occupies columns 13-14 and rows 8-10.
            const axeWidth = 2;
            const axeHeight = 3;

            // Align the axe with the left edge of the goal object.
            const drawX = x * _base;

            // Position the bottom of the axe at the goal object's base.
            const bottomY = $this._yFix - (y + 1) * _base;
            const drawY = bottomY - axeHeight * _base;

            // Draw the 4x1 Castle goal base beneath the axe.
            // The chain occupies the left 2 tiles; the base occupies the right 2.
            // Position the base directly below the axe.
            // Shift the chain and base two tiles left of the axe.
            const baseX = drawX - 2 * _base;
            const baseY = drawY + axeHeight * _base;

            // Draw the chain (columns 1-2, row 14).
            $this._context.drawImage(
                _titleset,
                1 * _ts, 14 * _ts,
                2 * _ts, 1 * _ts,
                baseX, baseY,
                2 * _base, _base
            );

            // Draw the base (columns 1-2, row 15).
            $this._context.drawImage(
                _titleset,
                1 * _ts, 15 * _ts,
                2 * _ts, 1 * _ts,
                baseX + 2 * _base, baseY,
                2 * _base, _base
            );

            $this._context.drawImage(
                _titleset,
                13 * _ts,
                8 * _ts,
                axeWidth * _ts,
                axeHeight * _ts,
                drawX,
                drawY,
                axeWidth * _base,
                axeHeight * _base
            );

            return;
        }

        /* Draw the Super Mario World goal structure. */
        if (courseObject.type === 27 &&
            $this._gameMode === "MW" &&
            $this._gameTheme !== "castle") {

            const goalHeight = courseObject.height - 2;

            // The goal consists of two posts separated by one tile.
            const leftX = x * _base;
            const rightX = leftX + 2 * _base;
            const rightOffsetY = 0;

            // Position the bottom of the posts at the goal's base.
            const bottomY = $this._yFix - (y + 1) * _base;

            // Calculate the top position of the goal structure.
            const topY = bottomY - (goalHeight - 1) * _base;

            // Draw the repeating vertical post sections.
            for (let row = 0; row < goalHeight - 1; row++) {
                const drawY = bottomY - row * _base;

                // Leave the uppermost left section open for the goal tape.
                if (row !== goalHeight - 2) {
                    $this._context.drawImage(
                        _titleset,
                        6 * _ts, 3 * _ts, _ts, _ts,
                        leftX, drawY, _base, _base
                    );
                }

                // Draw the right post normally.
                $this._context.drawImage(
                    _titleset,
                    7 * _ts, 3 * _ts, _ts, _ts,
                    rightX, drawY + rightOffsetY, _base, _base
                );
            }

            // Draw only the bottom half of the extra straight section.
            $this._context.drawImage(
                _titleset,
                7 * _ts, 3 * _ts + _ts / 2,
                _ts, _ts / 2,
                rightX, topY + _base / 2,
                _base, _base / 2
            );

            // Draw the curved top at its corrected position.
            $this._context.drawImage(
                _titleset,
                7 * _ts, 2 * _ts, _ts, _ts,
                rightX, topY - _base / 2,
                _base, _base
            );

            // Draw the complete 2x2 goal tape sprite.
            // This includes the left curved top and horizontal tape.
            if ($this._goalTape &&
                $this._goalTape.complete &&
                $this._goalTape.naturalWidth > 0) {

                $this._context.drawImage(
                    $this._goalTape,
                    leftX,
                    topY,
                    2 * _base,
                    2 * _base
                );
            }

            return;
        }

        /* Draw the SMB1 flagpole in all non-Castle themes. */
        if (courseObject.type === 27 &&
            $this._gameMode === "M1" &&
            $this._gameTheme !== "castle") {

            // Total height includes the top ball, shaft, and solid base.
            const poleHeight = courseObject.height;

            // Align the pole with the goal object's left edge.
            const poleX = x * _base;

            // Position the solid base above the ground.
            const baseY = $this._yFix - (y + 1) * _base;

            // Draw the solid base.
            $this._context.drawImage(
                _titleset,
                6 * _ts, 3 * _ts,
                _ts, _ts,
                poleX, baseY,
                _base, _base
            );

            // Draw the vertical shaft between the base and top ball.
            for (let row = 1; row < poleHeight - 1; row++) {
                const drawY = baseY - row * _base;

                $this._context.drawImage(
                    _titleset,
                    7 * _ts, 2 * _ts,
                    _ts, _ts,
                    poleX, drawY,
                    _base, _base
                );
            }

            // Draw the green ball at the top.
            const topY = baseY - (poleHeight - 1) * _base;

            $this._context.drawImage(
                _titleset,
                6 * _ts, 2 * _ts,
                _ts, _ts,
                poleX, topY,
                _base, _base
            );

            // Draw the flag one tile below the ball.
            // Flip horizontally and shift left one additional tile.
            $this._context.save();

            $this._context.translate(
                poleX + _base / 2,
                topY + _base
            );

            $this._context.scale(-1, 1);

            $this._context.drawImage(
                _titleset,
                7 * _ts, 3 * _ts,
                _ts, _ts,
                0, 0,
                _base, _base
            );

            $this._context.restore();

            return;
        }

        /* Draw the SMB3 goal in all non-Castle themes. */
        if (courseObject.type === 27 &&
            $this._gameMode === "M3" &&
            $this._gameTheme !== "castle") {

            // The SMB3 goal is a 2x2 tile square.
            const goalWidth = 2 * _base;
            const goalHeight = 2 * _base;

            // Align the goal horizontally with the goal object.
            const goalX = x * _base;

            // Position the goal above the ground.
            // The goal object is 11 tiles tall, but the SMB3
            // goal graphic only occupies the upper 2 tiles.
            const bottomY = $this._yFix - (y + 1) * _base;
            const goalY = bottomY - 4.5 * _base;

            // Draw the complete 2x2 goal frame.
            $this._context.drawImage(
                _titleset,
                6 * _ts, 2 * _ts,
                2 * _ts, 2 * _ts,
                goalX, goalY,
                goalWidth, goalHeight
            );

            // Draw the mushroom inside the goal frame.
            // Position it in the center of the 2x2 square.
            const mushroomX = goalX + _base / 2;
            const mushroomY = goalY + _base / 2;

            $this._context.drawImage(
                _titleset,
                15 * _ts, 6 * _ts,
                _ts, _ts,
                mushroomX, mushroomY,
                _base, _base
            );

            return;
        }

                /* Draw skewers as one complete sprite so rotation works correctly. */
        if (courseObject.type === 12 && courseObject.subType === 1) {
            let spriteWidth = 4 * _base,
                spriteHeight = 4 * _base,
                xSprite = (x - 2) * _base,
                ySprite = $this._yFix - (y + 4) * _base,
                angle = (courseObject.direction + 2) * Math.PI / 2;

            $this._context.save();
            $this._context.translate(
                xSprite + spriteWidth / 2,
                ySprite + spriteHeight / 2
            );
            $this._context.rotate(angle);
            $this._context.scale(1, -1);
            $this._context.drawImage(
                _titleset,
                0, 16 * _ts, 4 * _ts, 4 * _ts,
                -spriteWidth / 2, -spriteHeight / 2,
                spriteWidth, spriteHeight
            );
            $this._context.restore();
            return;
        }

        /* Draw burners with their flame rotated around the base tile. */
        if (courseObject.type === 54) {
            let angle = courseObject.direction * Math.PI / 2;
            let tiles = def.extend(courseObject);

            // SMB1 and SMB3 do not have dedicated inactive burner artwork.
            // Use transparent tiles for the inactive flame.
            if (
                ($this._gameMode === "M1" || $this._gameMode === "M3") &&
                courseObject.subType
            ) {
                tiles = tiles.map(function (tile, index) {
                    if (index === 0) {
                        return tile; // Preserve the burner base.
                    }

                    return {
                        ...tile,
                        xT: 15,
                        yT: 19 - (index - 1)
                    };
                });
            }

            let baseX = x * _base;
            let baseY = $this._yFix - (y + 1) * _base;

            $this._context.save();
            $this._context.translate(
                baseX + _base / 2,
                baseY + _base / 2
            );
            $this._context.rotate(angle);

            tiles.forEach(function (tile) {
                let tileX = tile.x * _base;
                let tileY = -tile.y * _base;

                $this._context.drawImage(
                    _titleset,
                    tile.xT * _ts, tile.yT * _ts, _ts, _ts,
                    tileX - _base / 2,
                    tileY - _base / 2,
                    _base, _base
                );
            });

            $this._context.restore();
            return;
        }

        /* Draw one-way gates as one complete sprite with four orientations. */
        if (courseObject.type === 67) {
            let spriteWidth = 2 * _base,
                spriteHeight = 2 * _base,
                xSprite = (x - 1) * _base,
                ySprite = $this._yFix - (y + 2) * _base,
                angle = courseObject.direction * Math.PI / 2;

            $this._context.save();
            $this._context.translate(
                xSprite + spriteWidth / 2,
                ySprite + spriteHeight / 2
            );
            $this._context.rotate(angle);
            $this._context.drawImage(
                _titleset,
                5 * _ts, 8 * _ts, 2 * _ts, 2 * _ts,
                -spriteWidth / 2, -spriteHeight / 2,
                spriteWidth, spriteHeight
            );
            $this._context.restore();
            return;
        }

        /* Draw air signs as one complete sprite so rotation works correctly. */
        if (courseObject.type === 66 && courseObject.subType === 0) {
            let spriteWidth = 2 * _base,
                spriteHeight = 2 * _base,
                xSprite = (x - 1) * _base,
                ySprite = $this._yFix - (y + 2) * _base,
                angle = courseObject.direction * Math.PI / 4;

            $this._context.save();
            $this._context.translate(
                xSprite + spriteWidth / 2,
                ySprite + spriteHeight / 2
            );
            $this._context.rotate(angle);
            $this._context.drawImage(
                _titleset,
                13 * _ts, 6 * _ts, 2 * _ts, 2 * _ts,
                -spriteWidth / 2, -spriteHeight / 2,
                spriteWidth, spriteHeight
            );
            $this._context.restore();
            return;
        }

        /* Draw checkpoint flags as one complete sprite so rotation works correctly. */
        if (courseObject.type === 66 && courseObject.subType === 1) {
            let spriteWidth = 2 * _base,
                spriteHeight = 2 * _base,
                xSprite = (x - 1) * _base,
                ySprite = $this._yFix - (y + 2) * _base,
                angle = courseObject.direction * Math.PI / 4;

            $this._context.save();
            $this._context.translate(
                xSprite + spriteWidth / 2,
                ySprite + spriteHeight / 2
            );
            $this._context.rotate(angle);
            $this._context.drawImage(
                _titleset,
                8 * _ts, 18 * _ts, 2 * _ts, 2 * _ts,
                -spriteWidth / 2, -spriteHeight / 2,
                spriteWidth, spriteHeight
            );
            $this._context.restore();
            return;
        }

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
