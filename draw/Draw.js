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

        // Draw wings independently from the object's body sprite.
        if ((courseObject.flags & 0x02) !== 0) {
            $this._drawWings(courseObject, x, y);
        }
    }

    /**
     * Draw wings for supported winged objects.
     * Wing offsets are measured in course grid tiles.
     */
    _drawWings(courseObject, x, y) {
        const oneWingTypes = new Set([
            1, 3, 15, 25, 28, 39, 40,
            45, 46, 52, 56, 58, 61, 62
        ]);

        const twoWingTypes = new Set([
            0, 2, 4, 5, 6, 8, 10, 11,
            12, 18, 19, 20, 21, 22, 23,
            29, 30, 33, 34, 35, 44, 48,
            57, 60, 63
        ]);

        const wingCount =
            ((this._gameMode === "MW" || this._gameMode === "WU") &&
             courseObject.type === 45)
                ? 2
                : (this._gameMode === "WU" && courseObject.type === 0)
                    ? 1
                    : oneWingTypes.has(courseObject.type)
                        ? 1
                        : twoWingTypes.has(courseObject.type) ? 2 : 0;

        if (!wingCount) {
            return;
        }

        // Shared configurations. All measurements are in grid tiles.
        // Wing scale and position can be adjusted independently.
        const wingSettings = {
            normal: {
                one: {
                    scale: 1,
                    rightX: 1.3,
                    y: 0.7
                },
                two: {
                    scale: 1,
                    leftX: -0.9,
                    rightX: 0.9,
                    y: 0
                }
            },
            enlarged: {
                one: {
                    scale: 2,
                    rightX: 0.6,
                    y: 0.7
                },
                two: {
                    scale: 2,
                    leftX: -3.5,
                    rightX: 1.5,
                    y: 1.4
                }
            }
        };

        // Hammer Bro has special size handling in MonsterObject.js.
        const enlarged = courseObject.size > 1 ||
            (courseObject.type === 3 && courseObject.width > 1);

        // Calibrated offsets for normal-sized enemies
        const normalOneWingOverrides = [
            {
                types: [25, 28, 40], // Spiny, Buzzy Beetle, Spike Top
                offsets: { scale: 1, rightX: 0.5, y: 0.2 }
            },
            {
                types: [45], // Shoe Goomba only
                subType: 0,
                offsets: { scale: 1, rightX: 0.7, y: 0.1 }
            },
            {
                types: [1], // Koopa Troopa
                offsets: { scale: 1, rightX: 0.5, y: 0.8 }
            },
            {
                types: [15, 39, 58, 61], // Bob-omb, Magikoopa, Rocky Wrench / Monty Mole, Chain Chomp
                offsets: { scale: 1, rightX: 0.7, y: 0.5 }
            },
            {
                types: [45], // Stiletto Goomba only
                subType: 1,
                offsets: { scale: 1, rightX: 0.7, y: 0.5 }
            },
            {
                types: [52, 56], // Wiggler, Cheep Cheep
                offsets: { scale: 1, rightX: 0.7, y: 0.3 }
            },
            {
                types: [46], // Dry Bones
                offsets: { scale: 1, rightX: 0.6, y: 0.8 }
            },
            {
                types: [3], // Hammer Bro
                offsets: { scale: 1, rightX: 0.8, y: 0.55 }
            },
            {
                types: [62], // Bowser only
                subType: 0,
                offsets: { scale: 1, rightX: 0.1, y: 1.1 }
            },
            {
                types: [62], // Bowser Jr.
                subType: 1,
                offsets: { scale: 1, rightX: 1.3, y: 0.7 }
            }
        ];

        const normalTwoWingOverrides = [
            {
                // Springs, blocks, power-ups, Podoboo,
                // POW, P Switch, and Coin
                types: [
                    4, 5, 6, 8, 10, 18, 19, 20,
                    21, 22, 23, 29, 33, 34, 35,
                    44, 60
                ],
                offsets: { scale: 1, leftX: -1, rightX: 1, y: 0.2 }
            },
            {
                types: [2], // Piranha Plant
                offsets: { scale: 1, leftX: -0.9, rightX: 0.9, y: 0.1 }
            },
            {
                types: [12], // Thwomp
                offsets: { scale: 1, leftX: -1.7, rightX: 0.7, y: 0.7 }
            },
            {
                types: [30], // Lakitu
                offsets: { scale: 1, leftX: -0.8, rightX: 0.8, y: -0.3 }
            },
            {
                types: [0], // Goomba
                offsets: { scale: 1, leftX: -0.9, rightX: 0.9, y: 0.3 }
            },
            {
                types: [11], // Platforms / Lifts
                offsets: { scale: 1, leftX: -3, rightX: 2, y: 0.3 }
            },
            {
                types: [57], // Muncher
                offsets: { scale: 1, leftX: -0.9, rightX: 0.9, y: 0 }
            },
            {
                types: [48], // Blooper
                offsets: { scale: 1, leftX: -0.9, rightX: 0.9, y: 0.7 }
            }
        ];
        const sharedSettings = wingSettings[enlarged ? "enlarged" : "normal"][
            wingCount === 1 ? "one" : "two"
        ];

        const enlargedOneWingOverrides = [
            // Calibrated enlarged one-wing objects here
            {
                types: [25, 28, 40], // Spiny, Buzzy Beetle, Spike Top
                offsets: { scale: 2, rightX: 0, y: 0.1 }
            },
            {
                types: [15, 56], // Bob-omb, Cheep Cheep
                offsets: { scale: 2, rightX: 0.1, y: 0.5 }
            },
            {
                types: [52], // Regular Wiggler
                subType: 0,
                offsets: { scale: 2, rightX: 0.6, y: 0.7 }
            },
            {
                types: [52], // Angry Wiggler
                subType: 1,
                offsets: { scale: 2, rightX: 0.4, y: 0.3 }
            },
            {
                types: [61], // Chain Chomp
                offsets: { scale: 2, rightX: 0.6, y: 0.7 }
            },
            {
                types: [39], // Magikoopa
                offsets: { scale: 2, rightX: 0.6, y: 1 }
            },
            {
                types: [58], // Monty Mole / Rocky Wrench
                offsets: { scale: 2, rightX: 0.7, y: 0.6 }
            },
            {
                types: [45], // Shoe Goomba only
                subType: 0,
                offsets: { scale: 2, rightX: 0.5, y: 0.3 }
            },
            {
                types: [45], // Stiletto only
                subType: 1,
                offsets: { scale: 2, rightX: 0.2, y: 0.8 }
            },
            {
                types: [1], // Koopa Troopa
                offsets: { scale: 2, rightX: 0, y: 1.5 }
            },
            {
                types: [46], // Dry Bones
                offsets: { scale: 2, rightX: 0.2, y: 1.5 }
            },
            {
                types: [62], // Bowser Jr. only
                subType: 1,
                offsets: { scale: 2, rightX: 1.4, y: 1.3 }
            },
            {
                types: [62], // Bowser only
                subType: 0,
                offsets: { scale: 2, rightX: 0.2, y: 2.2 }
            },
            {
                types: [3], // Hammer Bro
                offsets: { scale: 1, rightX: 0.5, y: 0.7 }
            }
        ];

            // Calibrated enlarged two-wing objects here
        const enlargedTwoWingOverrides = [
            {
                types: [0], // Goomba
                offsets: { scale: 2, leftX: -2.9, rightX: 0.9, y: 0.5 }
            },
            {
                types: [48], // Blooper
                offsets: { scale: 2, leftX: -2.6, rightX: 0.6, y: 1.3 }
            },
            {
                types: [60], // Podoboo
                offsets: { scale: 2, leftX: -2.6, rightX: 0.6, y: 0.4 }
            },
            {
                types: [57], // Muncher
                offsets: { scale: 2, leftX: -2.8, rightX: 0.8, y: 0 }
            },
            {
                types: [2], // Piranha Plant
                offsets: { scale: 2, leftX: -2.9, rightX: 0.9, y: 0.2 }
            },
            {
                types: [12], // Thwomp
                offsets: { scale: 2, leftX: -3.5, rightX: 1.5, y: 1.4 }
            }
        ];
       
            // SMW-specific normal-sized wing offsets.
            const smwNormalOneWingOverrides = [
                {
                    types: [62], // Bowser
                    subType: 0,
                    offsets: { scale: 1, rightX: 0.2, y: 1.6 }
                },
                {
                    types: [62], // Bowser Jr.
                    subType: 1,
                    offsets: { scale: 1, rightX: 1.5, y: 0.7 }
                }
            ];

            const smwNormalTwoWingOverrides = [
                {
                    types: [45], // Yoshi Egg
                    offsets: { scale: 1, leftX: -0.9, rightX: 0.9, y: 0.2 }
                },
                {
                    types: [48], // Blooper
                    offsets: { scale: 1, leftX: -0.8, rightX: 0.8, y: 1 }
                }
            ];

            // NSMBU-specific normal-sized wing offsets.
            const nsmbNormalOneWingOverrides = [
                {
                    types: [62], // Bowser
                    subType: 0,
                    offsets: { scale: 1.5, rightX: 0.1, y: 1.3 }
                },
                {
                    types: [52], // Wiggler / Angry Wiggler
                    offsets: { scale: 1, rightX: 0.6, y: 0.2 }
                },
                {
                    types: [61, 15], // Chain Chomp, Bob-omb
                    offsets: { scale: 1, rightX: 0.6, y: 0.1 }
                },
                {
                    types: [46], // Dry Bones
                    offsets: { scale: 1, rightX: 0.8, y: 0.4 }
                },
                {
                    types: [58], // Monty Mole / Rocky Wrench
                    offsets: { scale: 1, rightX: 0.6, y: 0.2 }
                },
                {
                    types: [0], // Goomba (one wing in NSMBU)
                    offsets: { scale: 1, rightX: 0.6, y: 0.2 }
                },
                {
                    types: [1], // Koopa Troopa
                    offsets: { scale: 1, rightX: 0.7, y: 0.4 }
                },
                {
                    types: [25, 28, 40], // Spiny, Buzzy Beetle, Spike Top
                    offsets: { scale: 1, rightX: 0.4, y: 0 }
                }
            ];

            const nsmbNormalTwoWingOverrides = [
                {
                    // Power-ups, POW, P Switch, and related items
                    types: [4, 5, 6, 10, 18, 19, 20, 21, 22, 23, 29, 33, 34, 35, 44, 60],
                    offsets: { scale: 1, leftX: -0.9, rightX: 0.9, y: -0.1 }
                },
                {
                    types: [8], // Coin
                    offsets: { scale: 1, leftX: -0.9, rightX: 0.9, y: 0.1 }
                },
                {
                    types: [2], // Piranha Plant
                    offsets: { scale: 1, leftX: -0.9, rightX: 0.9, y: 0.1 }
                },
                {
                    types: [48], // Blooper Nanny
                    subType: 1,
                    offsets: { scale: 1, leftX: -0.8, rightX: 0.6, y: 0.7 }
                },
                {
                    types: [48], // Regular Blooper
                    subType: 0,
                    offsets: { scale: 1, leftX: -0.7, rightX: 0.7, y: 0.7 }
                }
            ];

        // SMB1-specific enlarged wing offsets.
        // All other SMB1 objects inherit their SMB3 offsets.
        const smb1EnlargedOneWingOverrides = [
            {
                types: [62], // Bowser
                subType: 0,
                offsets: { scale: 2, rightX: 0.2, y: 2.5 }
            },
            {
                types: [3], // Hammer Bro
                offsets: { scale: 1, rightX: 0.5, y: 1 }
            },
            {
                types: [39], // Magikoopa
                offsets: { scale: 2, rightX: 0.7, y: 1.3 }
            },
            {
                types: [56], // Cheep Cheep
                offsets: { scale: 2, rightX: 0, y: 0.9 }
            }
        ];

        const smb1EnlargedTwoWingOverrides = [
            {
                types: [12], // Thwomp
                offsets: { scale: 2, leftX: -3.5, rightX: 1.5, y: 1.8 }
            }
        ];

        // SMW-specific enlarged wing offsets.
        // All other SMW objects inherit their SMB3 offsets.
        const smwEnlargedOneWingOverrides = [
            {
                types: [62], // Bowser
                subType: 0,
                offsets: { scale: 2, rightX: 0.2, y: 3 }
            },
            {
                types: [62], // Bowser Jr.
                subType: 1,
                offsets: { scale: 2, rightX: 1.7, y: 1.5 }
            },
            {
                types: [52], // Angry Wiggler
                subType: 1,
                offsets: { scale: 2, rightX: 0.6, y: 0.7 }
            },
            {
                types: [46], // Dry Bones
                offsets: { scale: 2, rightX: 0.5, y: 1.4 }
            }
        ];

        const smwEnlargedTwoWingOverrides = [
            {
                types: [60], // Podoboo
                offsets: { scale: 2, leftX: -3.0, rightX: 1, y: 0.5 }
            },
            {
                types: [48], // Blooper
                offsets: { scale: 2, leftX: -2.6, rightX: 0.6, y: 2 }
            },
            {
                types: [45], // Yoshi Egg (SMW)
                offsets: { scale: 2, leftX: -2.8, rightX: 0.8, y: 0.5 }
            }
        ];

        // NSMBU-specific enlarged wing offsets.
        // Other NSMBU objects inherit their SMB3 offsets.
        const nsmbEnlargedOneWingOverrides = [
            {
                types: [62], // Bowser
                subType: 0,
                offsets: { scale: 3, rightX: 0.2, y: 2.8 }
            },
            {
                types: [62], // Bowser Jr.
                subType: 1,
                offsets: { scale: 2, rightX: 1.6, y: 1.3 }
            },
            {
                types: [61], // Chain Chomp
                offsets: { scale: 2.5, rightX: 0.5, y: 0.2 }
            },
            {
                types: [15], // Bob-omb
                offsets: { scale: 2.2, rightX: 0, y: -0.1 }
            },
            {
                types: [46], // Dry Bones
                offsets: { scale: 2.2, rightX: 0.4, y: 0.7 }
            },
            {
                types: [58], // Monty Mole / Rocky Wrench
                offsets: { scale: 2, rightX: 0.4, y: 0.3 }
            },
            {
                types: [0], // Goomba (one wing in NSMBU)
                offsets: { scale: 2.2, rightX: 0.2, y: 0.2 }
            },
            {
                types: [56], // Cheep Cheep
                offsets: { scale: 2.5, rightX: -0.2, y: -0.2 }
            },
            {
                types: [52], // Regular Wiggler
                subType: 0,
                offsets: { scale: 1.5, rightX: 0.3, y: 0.3 }
            },
            {
                types: [52], // Angry Wiggler
                subType: 1,
                offsets: { scale: 1.5, rightX: 0.3, y: 0.3 }
            }
        ];

        const nsmbEnlargedTwoWingOverrides = [
            {
                types: [12], // Thwomp
                offsets: { scale: 2, leftX: -3.2, rightX: 1.2, y: 1 }
            },
            {
                types: [45], // Yoshi Egg
                offsets: { scale: 2, leftX: -2.4, rightX: 0.4, y: -0.1 }
            },
            {
                types: [2], // Piranha Plant
                offsets: { scale: 2, leftX: -2.6, rightX: 0.6, y: -0.3 }
            },
            {
                types: [57], // Muncher
                offsets: { scale: 2, leftX: -2.5, rightX: 0.5, y: -0.5 }
            },
            {
                types: [48], // Blooper Nanny (NSMBU)
                subType: 1,
                offsets: { scale: 2, leftX: -2.5, rightX: 0.2, y: 1.5 }
            },
            {
                types: [48], // Regular Blooper (NSMBU)
                subType: 0,
                offsets: { scale: 2, leftX: -2.3, rightX: 0.3, y: 1.5 }
            }
        ];

        // Default calibrated offsets (SMB3 baseline).
        const overrideGroups = enlarged
            ? (wingCount === 1
                ? enlargedOneWingOverrides
                : enlargedTwoWingOverrides)
            : (wingCount === 1
                ? normalOneWingOverrides
                : normalTwoWingOverrides);

        // Game-style-specific overrides take priority.
        const modeOverrideGroups =
            this._gameMode === "M1"
                ? (enlarged
                    ? (wingCount === 1
                        ? smb1EnlargedOneWingOverrides
                        : smb1EnlargedTwoWingOverrides)
                    : [])
                : this._gameMode === "MW"
                    ? (enlarged
                        ? (wingCount === 1
                            ? smwEnlargedOneWingOverrides
                            : smwEnlargedTwoWingOverrides)
                        : (wingCount === 1
                            ? smwNormalOneWingOverrides
                            : smwNormalTwoWingOverrides))
                    : this._gameMode === "WU"
                        ? (enlarged
                            ? (wingCount === 1
                                ? nsmbEnlargedOneWingOverrides
                                : nsmbEnlargedTwoWingOverrides)
                            : (wingCount === 1
                                ? nsmbNormalOneWingOverrides
                                : nsmbNormalTwoWingOverrides))
                        : [];

        const matchesObject = group =>
            group.types.includes(courseObject.type) &&
            (group.subType === undefined ||
             group.subType === courseObject.subType);

        const override =
            modeOverrideGroups.find(matchesObject) ||
            overrideGroups.find(matchesObject);

        const settings = override ? override.offsets : sharedSettings;
        const wingSheet = this._monsters.getTheme();
        const tileSize = this._monsters.getThemeSize();
        const wingSize = this._base * settings.scale;

        const wings = wingCount === 1
            ? [{ x: settings.rightX, xT: 1 }]
            : [
                { x: settings.leftX, xT: 0 },
                { x: settings.rightX, xT: 1 }
            ];

        wings.forEach(wing => {
            const drawX = (x + wing.x) * this._base;
            const drawY = this._yFix -
                (y + settings.y + settings.scale) * this._base;

            this._context.drawImage(
                wingSheet,
                wing.xT * tileSize,
                2 * tileSize,
                tileSize,
                tileSize,
                drawX,
                drawY,
                wingSize,
                wingSize
            );
        });
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
