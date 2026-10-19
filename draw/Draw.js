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
    _drawGoalScenery(goalObject) {
        const mode = this._gameMode;
        const theme = this._gameTheme;
        const tileset = this._monsters.getTheme();
        const ts = this._monsters.getThemeSize();
        const base = this._base;

        // Castle theme: all four game styles.
        if (theme === "castle") {

            // Do not draw the castle if no goal object exists.
            if (!goalObject) {
                return;
            }

            // Castle artwork occupies a 5x5 tile region.
            // Align its right edge with the course boundary.
            const castleX = (this._widthBlock - 5) * base;

            // Follow the goal area's vertical position.
            // At goalObject.y = 2, preserve the original placement.
            const castleY = this._yFix - (goalObject.y + 5) * base;

            // Draw the complete 5x5 castle.
            this._context.drawImage(
                tileset,
                6 * ts, 11 * ts,
                5 * ts, 5 * ts,
                castleX, castleY,
                5 * base, 5 * base
            );

            // Overlay the 3x3 door on the castle's lower-left.
            const doorX = castleX;
            const doorY = castleY + 2 * base;

            this._context.drawImage(
                tileset,
                3 * ts, 13 * ts,
                3 * ts, 3 * ts,
                doorX, doorY,
                3 * base, 3 * base
            );

            return;
        }

        // SMB3 non-Castle goal-area scenery.
        if (mode === "M3") {
            if (!goalObject) {
                return;
            }

            this._context.save();

            // Shared hill sprite dimensions.
            // Source: columns 12-15, rows 12-15.
            const hillWidth = 4;
            const hillHeight = 4.5;

            // Follow the goal area's vertical position.
            const goalY = goalObject.y;
            const drawY = this._yFix - (goalY + 3.5) * base;

            // ------------------------------------------
            // Black background behind SMB3 goal scenery.
            // ------------------------------------------

            // Start at the vertical sawtooth boundary.
            // Fill the entire area to the right.
            const backgroundX = (this._widthBlock - 19) * base;
            const backgroundWidth = 19 * base;
            const backgroundHeight = this._heightBlock * base;

            // Repeat the black sprite tile without stretching it.
            for (let y = 0; y < backgroundHeight; y += base) {
                for (let x = backgroundX; x < backgroundX + backgroundWidth; x += base) {
                    this._context.drawImage(
                        tileset,
                        0, 0,
                        ts, ts,
                        x, y,
                        base, base
                    );
                }
            }

            // Calculate both left-side hill positions before drawing.
            const leftHillX = (this._widthBlock - 16) * base;
            const leftHillY = drawY - 3 * base;

            const lowerHillX = leftHillX + 1 * base;
            const lowerHillY = leftHillY + 2 * base;

            // ------------------------------------------
            // Right-side hills (horizontally flipped).
            // ------------------------------------------

            // Position the flipped hills to the right of the goal.
            const rightHillX = (this._widthBlock - 3 - hillWidth) * base;

            this._context.save();
            this._context.translate(
                rightHillX + hillWidth * base,
                drawY
            );
            this._context.scale(-1, 1);

            this._context.drawImage(
                tileset,
                12 * ts, 12 * ts,
                hillWidth * ts, hillHeight * ts,
                0, 0,
                hillWidth * base, hillHeight * base
            );

            this._context.restore();

            // ------------------------------------------
            // Additional left-side hills (lower-right).
            // ------------------------------------------

            // Draw the right three columns unchanged.
            this._context.drawImage(
                tileset,
                13 * ts, 12 * ts,
                3 * ts, hillHeight * ts,
                lowerHillX + base, lowerHillY,
                3 * base, hillHeight * base
            );

            // Keep only the upper 1.5 tiles.
            this._context.drawImage(
                tileset,
                12 * ts, 12 * ts,
                ts, 1.5 * ts,
                lowerHillX, lowerHillY,
                base, 1.5 * base
            );

            // Fill the lower 2.5 tiles with black.
            // Source: column 0, row 0 of the SMB3 monster sheet.
            this._context.drawImage(
                tileset,
                0, 0,
                ts, ts,
                lowerHillX, lowerHillY + 1.5 * base,
                base, 2.5 * base
            );

            // Next two tiles move one tile left.
            this._context.drawImage(
                tileset,
                12 * ts, 14 * ts,
                ts, 2 * ts,
                lowerHillX - base, lowerHillY + 2 * base,
                base, 2 * base
            );

            // The bottom half-tile of the leftmost
            // column is intentionally omitted.

            // Extend the rightmost hill's vertical line down by half a tile.
            this._context.drawImage(
                tileset,
                15 * ts, 15 * ts,
                ts, 0.5 * ts,
                lowerHillX + 3 * base,
                lowerHillY + (hillHeight - 0.5) * base,
                base, 0.5 * base
            );

            // ------------------------------------------
            // Left-side hills (original orientation).
            // ------------------------------------------

            // Move the left hills 1 tile left and 3 tiles up.

            this._context.drawImage(
                tileset,
                12 * ts, 12 * ts,
                hillWidth * ts, hillHeight * ts,
                leftHillX, leftHillY,
                hillWidth * base, hillHeight * base
            );

            // ------------------------------------------
            // Lower-left hill (isolated smaller hill).
            // ------------------------------------------

            // The smaller hill is in columns 13-14,
            // rows 14-15 of the SMB3 monster sheet.
            // ------------------------------------------
            // Lower-left hill (cropped to remove upper line).
            // ------------------------------------------

            const smallHillWidth = 2;
            const smallHillHeight = 1.5;

            const smallHillX = leftHillX - 1 * base;
            const smallHillY = leftHillY + 5 * base;

            // Remove the top half-tile containing the unwanted line.
            const smallHillCropTop = 0.5;

            this._context.drawImage(
                tileset,
                13 * ts,
                (14 + smallHillCropTop) * ts,
                smallHillWidth * ts,
                (smallHillHeight - smallHillCropTop) * ts,
                smallHillX,
                smallHillY + smallHillCropTop * base,
                smallHillWidth * base,
                (smallHillHeight - smallHillCropTop) * base
            );

            // ------------------------------------------
            // SMB3 hill vertical extensions.
            // ------------------------------------------

            const ctx = this._context;

            // Match the original white hill outlines.
            ctx.fillStyle = "#FFFFFF";

            // Scale one source pixel to the rendered tile size.
            const pixel = base / ts;

            // ------------------------------------------
            // Connect the upper hill to the lower-left hill.
            // ------------------------------------------

            // Align with the left edge of the original upper hill.
            const connectionX = leftHillX;

            // Draw over the slightly misaligned line from the lower sprite.
            const connectionTopY = leftHillY + 2 * base;
            const connectionBottomY = smallHillY + 0.5 * base;

            ctx.fillRect(
                connectionX,
                connectionTopY,
                pixel,
                connectionBottomY - connectionTopY
            );

            // ------------------------------------------
            // SMB3 hill dotted vertical extensions.
            // ------------------------------------------

            // Draw a dotted trail that gradually fades
            // from white into the black background.

            // Extend the far-right hill's solid line by half a tile.
            ctx.fillStyle = "#FFFFFF";

            ctx.fillRect(
                lowerHillX + 3 * base - pixel,
                lowerHillY + (hillHeight - 0.5) * base,
                pixel,
                0.5 * base
            );

            const drawHillDots = (x, startY, length) => {
                const dotSize = pixel;
                const spacing = 2 * pixel;

                ctx.save();
                ctx.fillStyle = "#FFFFFF";

                for (let offset = 0; offset < length; offset += spacing) {

                    // Gradually fade the dots toward the bottom.
                    const progress = offset / length;
                    const opacity = 1 - progress * 0.85;

                    ctx.globalAlpha = opacity;

                    ctx.fillRect(
                        Math.round(x),
                        Math.round(startY + offset),
                        dotSize,
                        dotSize
                    );
                }

                ctx.restore();
            };

            // ------------------------------------------
            // Dotted trails directly beneath the hills.
            // ------------------------------------------

            // Left side of the lower-left hill.
            // Shift 1 source pixel to the right.
            drawHillDots(
                smallHillX + pixel,
                smallHillY + smallHillHeight * base,
                2 * base
            );

            // Right side of the lower-left hill.
            // Shift 1 source pixel to the left.
            drawHillDots(
                smallHillX + smallHillWidth * base - 2 * pixel,
                smallHillY + smallHillHeight * base,
                2 * base
            );

            // Right side of the lower-right hill.
            // Start the dotted trail half a tile lower.
            drawHillDots(
                lowerHillX + 3 * base - pixel,
                lowerHillY + hillHeight * base,
                2 * base
            );

            // ------------------------------------------
            // Full-height vertical sawtooth boundary.
            // ------------------------------------------

            // Source: columns 11-15, row 11.
            const sawWidth = 5;
            const sawHeight = 1;

            // Position 20 tiles from the right edge.
            const sawX = (this._widthBlock - 19.5) * base;

            const stripHeight = sawWidth * base;
            const totalHeight = this._heightBlock * base;

            this._context.save();

            // Clip the repeated sawtooth to the canvas height.
            this._context.beginPath();
            this._context.rect(
                sawX, 0,
                base,
                totalHeight
            );
            this._context.clip();

            // Repeat the rotated sprite vertically.
            for (let sawY = 0; sawY < totalHeight; sawY += stripHeight) {

                this._context.save();

                // Rotate 90 degrees counterclockwise.
                this._context.translate(sawX, sawY + stripHeight);
                this._context.rotate(-Math.PI / 2);

                this._context.drawImage(
                    tileset,
                    11 * ts, 11 * ts,
                    sawWidth * ts, sawHeight * ts,
                    0, 0,
                    sawWidth * base, sawHeight * base
                );

                this._context.restore();
            }

            this._context.restore();

            // Restore the caller's drawing state.
            this._context.restore();

            return;
        }

            // Non-Castle scenery: SMB1 and NSMBU only.
        if (mode === "M1" || mode === "WU") {

            // Do not draw scenery if no goal object exists.
            if (!goalObject) {
                return;
            }

            // Keep the castle aligned with the right course boundary.
            const drawX = (this._widthBlock - 5) * base;

            // Follow the goal area's vertical position.
            // At goalObject.y = 2, preserve the original placement.
            const drawY = this._yFix - (goalObject.y + 5) * base;

            this._context.drawImage(
                tileset,
                11 * ts, 11 * ts,
                5 * ts, 5 * ts,
                drawX, drawY,
                5 * base, 5 * base
            );
        }
    }

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
                const goalObject = _objects.find(function(courseObject) {
                    return courseObject.type === 27;
                });
                $this._drawGoalScenery(goalObject);
                _objects.forEach(function(courseObject) {
                    let type = courseObject.type;

                    // Castle bridges should only render in Castle themes.
                    if (type === 49 && $this._gameTheme !== "castle") {
                        return;
                    }

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
            let handled = false;

            function finish(success, err) {
                if (handled) return;
                handled = true;

                if (!success) {
                    onerror(err || { target: img });
                }

                onload();
            }

            img.onload = function () {
                finish(true);
            };

            img.onerror = function (err) {
                finish(false, err);
            };

            // Handle images that finished before handlers were attached.
            if (img.complete) {
                finish(img.naturalWidth > 0, { target: img });
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

        /* Draw the SMB1 and NSMBU flagpoles in all non-Castle themes. */
        if (courseObject.type === 27 &&
            ($this._gameMode === "M1" || $this._gameMode === "WU") &&
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
