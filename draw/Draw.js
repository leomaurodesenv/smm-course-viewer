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

        // Original Super Mario Maker track artwork.
        this._railSprite = new Image();
        this._railSprite.src = "./layout/draw/format/59.png";

        this._images = [
            this._blocks.getTheme(),
            this._monsters.getTheme(),
            this._goalTape,
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
 * Redraw the course after additional artwork finishes loading.
 */
    _redrawCourse() {
        this._context.clearRect(
            0,
            0,
            this._canvas.width,
            this._canvas.height
        );

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
     * Draw the Castle theme lava along the bottom of the course.
     */
    _drawLava() {
        if (this._gameTheme !== "castle") {
            return;
        }

        const tileset = this._monsters.getTheme();
        const tileSize = this._monsters.getThemeSize();
        const base = this._base;

        // Lava surface sprite, zero-based coordinates.
        const lavaX = 15;
        const lavaY = 9;

        // Bottom row of the course.
        const canvasY = (this._heightBlock - 1) * base;

        // Repeat the lava tile across the course width.
        for (let x = 0; x < this._widthBlock; x++) {
            this._context.drawImage(
                tileset,
                lavaX * tileSize,
                lavaY * tileSize,
                tileSize,
                tileSize,
                x * base,
                canvasY,
                base,
                base
            );
        }
    }

    /**
     * @method module:Draw::_drawObjects
     * Draw the objects
     * @arg {Array[Object]} _objects    Array[CourseObject]
     * @access private
     * @return {null}
     */

    /**
     * Draw fixed scenery around the goal area.
     * Castle themes share the same scenery layout across all game styles.
     * SMB1 and NSMBU also share a non-Castle goal structure.
     *
     * @param {Object} goalObject - The course goal object (type 27).
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

            // Shared hill sprite dimensions.
            // Source: columns 12-15, rows 12-15.
            const hillWidth = 4;
            const hillHeight = 4.5;

            // Follow the goal area's vertical position.
            const goalY = goalObject ? goalObject.y : 2;
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
        allloaded = function () {
            if (loadedCount === imageCount) {

                // Draw Castle lava after the tilesets have loaded,
                // but before drawing the course objects.
                $this._drawLava();

                // Find the goal object that controls the goal area's position.
                const goalObject = _objects.find(function (courseObject) {
                    return courseObject.type === 27;
                });

                // Draw goal-area scenery relative to the goal object.
                $this._drawGoalScenery(goalObject);

                // Pass 1: Draw air signs behind starting arrows.
                _objects.forEach(function (courseObject) {
                    if (courseObject.type === 66) {
                        $this._drawObjectFromTheme($this._monsters, courseObject);
                    }
                });

                // Pass 2: Draw starting arrows behind semisolids,
                // but in front of air signs.
                _objects.forEach(function (courseObject) {
                    if (courseObject.type === 38) {
                        $this._drawObjectFromTheme($this._monsters, courseObject);
                    }
                });

                // Pass 3: Draw all remaining objects in their original order.
                _objects.forEach(function (courseObject) {
                    let type = courseObject.type;

                    // These objects were already drawn.
                    if (type === 66 || type === 38) return;

                    if (type === 59) {
                        $this._drawRail(courseObject);
                    }
                    else if ($this._blocks.hasDraw(type)) {
                        $this._drawObjectFromTheme($this._blocks, courseObject);
                    }
                    else if ($this._monsters.hasDraw(type)) {
                        $this._drawObjectFromTheme($this._monsters, courseObject);
                    }
                    else {
                        console.log("fault: " + type);
                        $this._drawText(courseObject.x, courseObject.y, type);
                    }
             
                });

                // Draw Castle lava in front of all course objects.
                $this._drawLava();
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
 * Temporarily display curved-track endpoint positions.
 * A = first calculated endpoint
 * B = second calculated endpoint
 */
    _drawRailEndpointMarker(x, y, label) {
        const ctx = this._context;

        ctx.save();

        ctx.fillStyle = label === "A" ? "#FF0000" : "#0080FF";
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "bold 12px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.lineWidth = 3;
        ctx.strokeStyle = "#FFFFFF";
        ctx.strokeText(label, x, y - 13);

        ctx.fillStyle = "#000000";
        ctx.fillText(label, x, y - 13);

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
        // These are initial values to verify against the test course.
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
            if (endpointAClosed) {
                this._drawRailEndCap(x1, y1);
            }

            if (endpointBClosed) {
                this._drawRailEndCap(x2, y2);
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

        ctx.stroke();

        // Add a narrower gray interior over the dark rail.
        ctx.strokeStyle = "#B8B8B8";
        ctx.lineWidth = 5;
        ctx.stroke();

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


        /* Draw fire bars with variable length and 64 rotation positions. */
        if (courseObject.type === 24) {

            // Eight possible lengths: 4, 6, 8, 10, 12, 14, 16, 18.
            const lengthIndex = (courseObject.flags >>> 22) & 7;
            const fireballCount = 4 + lengthIndex * 2;

            // Decode rotation using the full 32-bit value.
            // 0° points upward, increasing clockwise.
            const rotationFraction = courseObject.extendedData / 4294967296;
            const angle = ((90 - rotationFraction * 360 + 360) % 360)
                * Math.PI / 180;

            // Center of the stationary base tile.
            const baseX = x * _base;
            const baseY = $this._yFix - (y + 1) * _base;
            const centerX = baseX + _base / 2;
            const centerY = baseY + _base / 2;

            const ctx = $this._context;

            // Draw the stationary base from column 13, row 2.
            ctx.drawImage(
                _titleset,
                13 * _ts, 2 * _ts,
                _ts, _ts,
                baseX, baseY,
                _base, _base
            );

            // Fireball sprite: column 14, row 2.
            // Full-tile sprite size with half-tile center spacing.
            const fireballSize = _base;
            const spacing = _base * 8 / 16;

            // The first fireball is centered directly over the base.
            // Subsequent fireballs extend outward along the angle.
            for (let i = 0; i < fireballCount; i++) {

                const distance = i * spacing;

                const fireX = centerX + Math.sin(angle) * distance;
                const fireY = centerY - Math.cos(angle) * distance;

                // Rotate each fireball 90 degrees clockwise.
                ctx.save();
                ctx.translate(fireX, fireY);
                ctx.rotate(angle);

                ctx.drawImage(
                    _titleset,
                    14 * _ts, 2 * _ts,
                    _ts, _ts,
                    -fireballSize / 2,
                    -fireballSize / 2,
                    fireballSize,
                    fireballSize
                );

                ctx.restore();
            }

            return;
        }

           /* Rotate Spinies, Buzzy Beetles, and Spike Tops
           to match their attached surfaces. */
        if (
            courseObject.type === 25 ||
            courseObject.type === 28 ||
            courseObject.type === 40
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

            // Map surface orientation to sprite rotation and flipping.
            let angle = 0;
            let flipX = false;

            switch (orientation) {
                case 0:
                    // First vertical wall: rotate 90° counterclockwise and flip horizontally.
                    angle = -Math.PI / 2;
                    flipX = true;
                    break;

                case 1:
                    // Second vertical wall: rotate 180° from current orientation.
                    angle = Math.PI / 2;
                    break;

                case 2:
                    // Ceiling: upside down and horizontally flipped.
                    angle = Math.PI;
                    flipX = true;
                    break;

                case 3:
                default:
                    // Floor: normal orientation.
                    angle = 0;
                    break;
            }

            // Center of the enemy's tile.
            const centerX = (x + 0.5) * _base;
            const centerY = $this._yFix - (y + 0.5) * _base;

            $this._context.save();
            $this._context.translate(centerX, centerY);
            $this._context.rotate(angle);
            $this._context.scale(flipX ? -1 : 1, 1);

            $this._context.drawImage(
                _titleset,
                spriteX * _ts, spriteY * _ts,
                _ts, _ts,
                -_base / 2, -_base / 2,
                _base, _base
            );

            $this._context.restore();
            return;
        }

        /* Draw cannons using the original sprite with correct aiming rotation. */
        if (courseObject.type === 47) {

            // Bits 25-26 identify the attached surface.
            // Bits 22-24 identify the rotation index.
            const surfaceIndex = (courseObject.flags >>> 25) & 3;
            const rotationIndex = (courseObject.flags >>> 22) & 7;

            // Absolute aiming angles, clockwise from upward.
            // 0° = Up, 90° = Right, 180° = Down, 270° = Left.
            //
            // Surface indices:
            // 0 = Left wall
            // 1 = Right wall
            // 2 = Ceiling
            // 3 = Ground

            const cannonAngles = {
                0: [225, 270, 315, 0, 180],   // Left wall
                1: [45, 90, 135, 180, 0],     // Right wall
                2: [135, 180, 225, 270, 90], // Ceiling
                3: [315, 0, 45, 90, 270]     // Ground
            };

            const angleDegrees = cannonAngles[surfaceIndex][rotationIndex];
            const angle = angleDegrees * Math.PI / 180;

            // Original cannon sprite coordinates.
            // Black cannon: row 5
            // Red cannon: row 6
            const spriteX = 5;
            const spriteY = courseObject.subType ? 6 : 5;

            // Center of the cannon's course tile.
            const centerX = (x + 0.5) * _base;
            const centerY = $this._yFix - (y + 0.5) * _base;

            // Rotate and draw the complete original cannon sprite.
            $this._context.save();

            $this._context.translate(centerX, centerY);
            $this._context.rotate(angle);

            $this._context.drawImage(
                _titleset,
                spriteX * _ts,
                spriteY * _ts,
                _ts,
                _ts,
                -_base / 2,
                -_base / 2,
                _base,
                _base
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
