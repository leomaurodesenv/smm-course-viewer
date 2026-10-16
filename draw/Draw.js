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
        this._images = [this._blocks.getTheme(), this._monsters.getTheme()];
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
                // Identify pipes that have attached objects.
                const pipeLinkIds = new Set(
                    _objects
                        .filter(obj => obj.type === 9 && obj.linkId !== -1)
                        .map(obj => obj.linkId)
                );

                const isPipeAttached = function(courseObject) {
                    return (
                        courseObject.type !== 9 &&
                        courseObject.linkId !== -1 &&
                        pipeLinkIds.has(courseObject.linkId)
                    );
                };

                const drawObject = function(courseObject) {
                    const type = courseObject.type;

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
                };

                // Pass 1: Draw pipe-attached objects behind their pipes.
                _objects.forEach(function(courseObject) {
                    if(isPipeAttached(courseObject)) {
                        drawObject(courseObject);
                    }
                });

                // Pass 2: Draw remaining objects, including pipes.
                _objects.forEach(function(courseObject) {
                    if(!isPipeAttached(courseObject)) {
                        drawObject(courseObject);
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

        // Detect monsters attached to pipes.
        let pipeRotation = 0;
        let pipeDirection = null;

        if (
            _theme === this._monsters &&
            courseObject.type !== 9 &&
            courseObject.linkId !== -1
        ) {
            const pipe = this._objects.find(obj =>
                obj.type === 9 && obj.linkId === courseObject.linkId
            );

            if (pipe) {
                const direction = (pipe.flags & 0x60) / 0x20;
                pipeDirection = direction;

                const rotations = {
                    0: 90,   // Right
                    1: -90,  // Left
                    2: 0,    // Up
                    3: 180   // Down
                };

                pipeRotation = rotations[direction] || 0;
                // Fine-tune pipe attachment positions.
                // CDT Y coordinates increase upward.
                // Fine-tune pipe-attached object positions.
                // Type 1 = Koopa Troopa; type 18 = P Switch.
                // Positive Y moves upward in CDT coordinates.
                const pipeOffsets = {
                    1: { // Koopa Troopa
                        0: { x: 1.0, y: -1.0 },   // Right
                        1: { x: -1.0, y: -1.0 },  // Left
                        2: { x: 0, y: 0 },        // Up
                        3: { x: 0, y: -2.0 }      // Down
                    },
                    18: { // P Switch
                        0: { x: 0.75, y: -0.5 },  // Right
                        1: { x: -0.75, y: -0.5 }, // Left
                        2: { x: 0, y: 0.25 },     // Up
                        3: { x: 0, y: -1.25 }     // Down
                    }
                };

                const offset = (
                    courseObject.type === 1 && courseObject.size === 2
                )
                    ? undefined
                    : pipeOffsets[courseObject.type]?.[direction];

                if (offset) {
                    x += offset.x;
                    y += offset.y;
                }

                // General offsets for enlarged pipe-attached enemies.
                if (
                    courseObject.size === 2 &&
                    courseObject.type !== 1 &&
                    courseObject.type !== 18 &&
                    courseObject.type !== 15 &&
                    courseObject.type !== 41 &&
                    courseObject.type !== 58 &&
                    courseObject.type !== 46 &&
                    courseObject.type !== 3 &&
                    courseObject.type !== 61 &&
                    courseObject.type !== 0 &&
                    courseObject.type !== 2 &&
                    courseObject.type !== 42 &&
                    courseObject.type !== 60 &&
                    courseObject.type !== 56 &&
                    courseObject.type !== 57 &&
                    courseObject.type !== 52 &&
                    courseObject.type !== 48 &&
                    courseObject.type !== 25 &&
                    courseObject.type !== 28 &&
                    courseObject.type !== 40 &&
                    courseObject.type !== 39
                ) {
                    const largeEnemyOffsets = {
                        0: { x: 0.5, y: -1.5 }, // Right
                        1: { x: 0, y: -1.0 },   // Left
                        2: { x: 0.5, y: 0 },    // Up
                        3: { x: 0, y: -1.5 }    // Down
                    };

                    const largeOffset = largeEnemyOffsets[direction];

                    if (largeOffset) {
                        x += largeOffset.x;
                        y += largeOffset.y;
                    }
                }

                // Individually calibrated offsets for enlarged enemies and fixed-size special objects.
                // Direction indicates the pipe's orientation: 0 = right, 1 = left, 2 = up, 3 = down.
                // Hammer Bro uses width rather than size to identify its enlarged form.
                if (
                    courseObject.size === 2 ||
                    (courseObject.type === 3 && courseObject.width > 1) ||
                    courseObject.type === 42
                ) {

                    // Shared enlarged-enemy offsets.
                    // Big Koopa Troopa, Piranha Plant, Dry Bones, and Rocky Wrench.
                    const tallEnemyOffsets = {
                        0: { x: -0.5, y: -2 },  // Right
                        1: { x: -0.5, y: -1 }, // Left
                        2: { x: 0, y: -1.5 },  // Up
                        3: { x: -1, y: -1.5 }  // Down
                    };

                    // Shared offsets: Boo, Monty Mole, Podoboo (Lava Bubble).
                    const centeredEnemyOffsets = {
                        0: { x: -0.5, y: -1.5 },  // Right
                        1: { x: -0.5, y: -0.5 },   // Left
                        2: { x: 0, y: -1 },  // Up
                        3: { x: -1, y: -1 }  // Down
                    };

                    // Shared offsets: Cheep Cheep, Muncher.
                    const compactEnemyOffsets = {
                        0: { x: -0.5, y: -1.5 },   // Right
                        1: { x: -0.5, y: -0.5 },  // Left
                        2: { x: 0, y: -1 },   // Up
                        3: { x: -1, y: -1 }  // Down
                    };

                    // Shared offsets: Spiny, Buzzy Beetle, Spike Top.
                    const shellEnemyOffsets = {
                        0: { x: -0.5, y: -0.5 },   // Right
                        1: { x: -0.5, y: -0.5 },  // Left
                        2: { x: -0.5, y: -0.5 },   // Up
                        3: { x: -0.5, y: -0.5 }  // Down
                    };

                    // Enlarged pipe-enemy offsets by type and direction.
                    const enlargedEnemyOffsets = {
                        0: { // Goomba
                            0: { x: 0, y: -2 },  // Right
                            1: { x: -1, y: -1 },  // Left
                            2: { x: 0, y: -1 },  // Up
                            3: { x: -1, y: -2 } // Down
                        },

                        1: tallEnemyOffsets, // Big Koopa Troopa

                        2: tallEnemyOffsets, // Piranha Plant

                        3: { // Hammer Bro
                            0: { x: 0.5, y: -1.5 },  // Right
                            1: { x: -0.5, y: -1.5 },  // Left
                            2: { x: 0, y: -1 },  // Up
                            3: { x: 0, y: -2 } // Down
                        },

                        15: { // Bob-omb
                            0: { x: -0.5, y: -1.5 },  // Right
                            1: { x: -0.5, y: -0.5 },  // Left
                            2: { x: 0, y: -1 },  // Up
                            3: { x: -1, y: -1 } // Down
                        },

                        25: shellEnemyOffsets, // Spiny

                        28: shellEnemyOffsets, // Buzzy Beetle

                        39: { // Magikoopa
                            0: { x: -0.5, y: -2 },  // Right
                            1: { x: -0.5, y: -1 },  // Left
                            2: { x: 0, y: -1.5 },  // Up
                            3: { x: -1, y: -1.5 } // Down
                        },

                        40: shellEnemyOffsets, // Spike Top

                        41: centeredEnemyOffsets, // Boo

                        42: { // Koopa Clown Car
                            0: { x: 1, y: -1.5 },  // Right
                            1: { x: -1, y: -1.5 },  // Left
                            2: { x: 0, y: -0.5 },  // Up
                            3: { x: 0, y: -2.5 } // Down
                        },

                        46: tallEnemyOffsets, // Dry Bones

                        48: { // Blooper
                            0: { x: -1, y: -2 },  // Right
                            1: { x: 0, y: -1 },  // Left
                            2: { x: 0, y: -2 },  // Up
                            3: { x: -1, y: -1 } // Down
                        },

                        52: { // Wiggler / Angry Wiggler
                            0: { x: 0, y: -2 },  // Right
                            1: { x: -1, y: -1 },  // Left
                            2: { x: 0, y: -1 },  // Up
                            3: { x: -1, y: -2 } // Down
                        },

                        56: compactEnemyOffsets, // Cheep Cheep

                        57: compactEnemyOffsets, // Muncher

                        58: { // Rocky Wrench / Monty Mole
                            0: tallEnemyOffsets,     // Rocky Wrench
                            1: centeredEnemyOffsets  // Monty Mole
                        },

                        60: centeredEnemyOffsets, // Podoboo

                        61: { // Chain Chomp
                            0: { x: 0, y: -1.5 },  // Right
                            1: { x: -1, y: -0.5 },  // Left
                            2: { x: 0, y: -0.5 },  // Up
                            3: { x: -1, y: -1.5 } // Down
                        }
                    };

                    const enemyOffsets = enlargedEnemyOffsets[courseObject.type];

                    const enlargedOffset = courseObject.type === 58
                        ? enemyOffsets?.[courseObject.subType]?.[direction]
                        : enemyOffsets?.[direction];

                    if (enlargedOffset) {
                        x += enlargedOffset.x;
                        y += enlargedOffset.y;
                    }
                    // NSMBU-specific adjustments for enlarged pipe-attached enemies.
                    // Koopa Troopa, Piranha Plant, Bob-omb, Spiny, Buzzy Beetle,
                    // Spike Top, Dry Bones, Cheep Cheep, Muncher, and Rocky Wrench.
                    const nsmbOffsetEnemies = [
                        1,  // Koopa Troopa
                        2,  // Piranha Plant
                        15, // Bob-omb
                        25, // Spiny
                        28, // Buzzy Beetle
                        40, // Spike Top
                        46, // Dry Bones
                        56, // Cheep Cheep
                        57  // Muncher
                    ];

                    const needsNSMBOffset =
                        $this._gameMode === "WU" &&
                        (
                            nsmbOffsetEnemies.includes(courseObject.type) ||
                            (courseObject.type === 58 && courseObject.subType === 0) // Rocky Wrench
                        );

                    if (needsNSMBOffset) {
                        const nsmbDirectionOffsets = {
                            0: { x: 0.5, y: 0 },    // Right
                            1: { x: -0.5, y: 0 },   // Left
                            2: { x: 0, y: 0.5 },    // Up
                            3: { x: 0, y: -0.5 }   // Down
                        };

                        const offset = nsmbDirectionOffsets[direction];

                        if (offset) {
                            x += offset.x;
                            y += offset.y;
                        }
                    }

                    // NSMBU: Move enlarged Wiggler / Angry Wiggler up by 0.5 tiles
                    // for all four pipe directions.
                    if ($this._gameMode === "WU" && courseObject.type === 52) {
                        y += 0.5;
                    }
                }

            } // End if (pipe)
        } // End pipe-attachment check

        if (
            pipeDirection !== null &&
            (
                courseObject.type === 25 ||
                courseObject.type === 28 ||
                courseObject.type === 40
            )
        ) {
            // Surface orientation stored in bits 25-26.
            const orientation = (courseObject.flags >>> 25) & 3;

            // Sprite coordinates in the monster tileset.
            let spriteX;
            const spriteY = 4;

            if (courseObject.type === 25) {
                spriteX = 2; // Spiny
            } else if (courseObject.type === 28) {
                spriteX = 4; // Buzzy Beetle
            } else {
                // Spike Top: red or blue.
                spriteX = courseObject.subType ? 6 : 5;
            }

            // Use pipe rotation for pipe-attached enemies.
            // Otherwise, preserve their existing surface-orientation behavior.
            const attachedToPipe = courseObject.linkId !== -1 &&
                $this._objects.some(obj =>
                    obj.type === 9 &&
                    obj.linkId === courseObject.linkId
                );

            // Map surface orientation to sprite rotation and flipping.
            let angle = 0;
            let flipX = false;

            if (attachedToPipe) {
                // Pipe directions:
                // 0 = Right, 1 = Left, 2 = Up, 3 = Down.
                // pipeRotation was calculated earlier in this function.
                angle = pipeRotation * Math.PI / 180;
                flipX = false;

            } else {
                // Preserve existing surface-orientation behavior.
                switch (orientation) {
                    case 0:
                        // First vertical wall.
                        angle = -Math.PI / 2;
                        flipX = true;
                        break;

                    case 1:
                        // Second vertical wall.
                        angle = Math.PI / 2;
                        break;

                    case 2:
                        // Ceiling.
                        angle = Math.PI;
                        flipX = true;
                        break;

                    case 3:
                    default:
                        // Floor.
                        angle = 0;
                        break;
                }
            }

            // Scale enlarged enemies to 2x their normal size.
            const spriteSize = _base * courseObject.size;

            // Preserve the original anchor point for normal-sized enemies.
            let centerX = (x + 0.5) * _base;
            let centerY = $this._yFix - (y + 0.5) * _base;

            // Surface-specific positioning for enlarged enemies.
            // Pipe-attached enemies retain their independent offsets.
            if (!attachedToPipe && courseObject.size === 2) {
                switch (orientation) {
                    case 0:
                        // First vertical wall: move sprite left.
                        centerX -= _base / 2;
                        break;

                    case 1:
                        // Second vertical wall: move sprite left.
                        centerX -= _base / 2;
                        break;

                    case 2:
                        // Ceiling: move sprite upward.
                        centerY -= _base / 2;
                        break;

                    case 3:
                    default:
                        // Floor: raise enlarged enemies to prevent ground overlap.
                        centerY -= _base / 2;
                        break;
                }
            }

            $this._context.save();
            $this._context.translate(centerX, centerY);
            $this._context.rotate(angle);
            $this._context.scale(flipX ? -1 : 1, 1);

            $this._context.drawImage(
                _titleset,
                spriteX * _ts, spriteY * _ts,
                _ts, _ts,
                -spriteSize / 2, -spriteSize / 2,
                spriteSize, spriteSize
            );

            $this._context.restore();
            return;

        }

        /* multiples cells */
        if(def.extend) {
            let ext = def.extend(courseObject);

            // Pipe-attached Chain Chomps should not display their stake.
            if (courseObject.type === 61 && pipeDirection !== null) {
                ext = ext.filter(tile =>
                    !(tile.xT === 12 && tile.yT === 6)
                );
            }

            // Rotate the complete pipe-attached sprite.
            if (pipeDirection !== null && pipeRotation && ext.length > 0) {
                const minX = Math.min(...ext.map(tile => tile.x));
                const maxX = Math.max(...ext.map(tile => tile.x));
                const minY = Math.min(...ext.map(tile => tile.y));
                const maxY = Math.max(...ext.map(tile => tile.y));

                const centerX = (x + (minX + maxX + 1) / 2) * _base;
                const centerY = this._yFix -
                    (y + (minY + maxY + 2) / 2) * _base;

                this._context.save();
                this._context.translate(centerX, centerY);
                this._context.rotate(pipeRotation * Math.PI / 180);
                this._context.translate(-centerX, -centerY);
            }

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

            if (pipeDirection !== null && pipeRotation && ext.length > 0) {
                this._context.restore();
            }
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
                "size":courseObject.size, "width":courseObject.width,
                "rotation":pipeRotation};
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
