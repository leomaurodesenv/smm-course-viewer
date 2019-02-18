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
        /* define element plot */
        this._base = 20; /* object size 20x20 */
        this._element = _element;
        this._canvas = null;
        this._context = null;
        this._canvasId = 'courseDraw';
        /* course definitions */
        this._widthBlock = _course.widthBlock;
        this._heightBlock = _course.heightBlock;
        this._gameMode = _course.mode;
        this._gameTheme = _course.themeName;
        /* theme definitions */
        this._titlesetSize = limitTheme['titleset'][this._gameMode];
        this._titleset = new Image(this._themeSize*16, this._themeSize*16); /* 256 blocks */
        this._titleset.src = './layout/draw/titleset/'+this._gameMode+'-'+this._gameTheme+'.png';
        this._monstersSize = limitTheme['monsters'][this._gameMode];
        this._monsters = new Image(this._themeSize*16, this._themeSize*16); /* 256 blocks */
        this._monsters.src = './layout/draw/monsters/'+this._gameMode+'.png';
        this._images = [this._titleset, this._monsters];

        let compare = function(a,b) {
            if (a.z < b.z) return -1;
            if (a.z > b.z) return 1;
            return 0;
        }
        this._objects = _objects.sort(compare); /* order by z-index */
        this._yFix = this._heightBlock*this._base; /* invert y to draw */
        
        /* call functions */
        this._init();
        this._drawBlocks(this._widthBlock, this._heightBlock);
        this._drawObjects(this._objects);
    }

    _init() {
        /* struct the draw table */
        let html = document.createElement('div');
        html.classList.add('courseDrawMain');
        html.classList.add('rounded');
        let canvas = document.createElement('canvas');
        canvas.id = this._canvasId;
        canvas.width = this._widthBlock*this._base;
        canvas.height = this._heightBlock*this._base;
        canvas.append('Your browser does not support the canvas element.');
        /* append elements */
        html.appendChild(canvas);
        document.getElementById(this._element).innerHTML = '';
        document.getElementById(this._element).append(html);
        /* save canvas element */
        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._context.font = '10px sans-serif';
    }
    
    _drawBlocks(_X, _Y) {
        /* https://www.w3schools.com/tags/canvas_drawimage.asp */
        const $this = this;
        var img = new Image($this._base, $this._base);
        img.onload = function() {
            for(var y = _Y - 1; y >= 0; y--) {
                for(var x = 0; x < _X; x++) {
                    $this._context.drawImage(img, x*$this._base, y*$this._base, $this._base, $this._base);
                }
            }
        };
        img.onerror = function() {
            console.error('Draw: Error: squares don\'t load.');
        };
        img.src = './layout/draw/support/bg-square.png';
    }

    _drawObjects(objects) {
        const $this = this;
        var imageCount = $this._images.length;
        var loadedCount = 0;

        var onload = function() {
            loadedCount++; allloaded();
        },
        onerror = function(err) {
            let img = err.target;
            console.error('Draw: Error: theme don\'t exists.\n Path: '+img.src);
        },
        allloaded = function() {
            if(loadedCount == imageCount) {
                objects.forEach(function(courseObject) {
                    let type = courseObject.type;
                    if(blockTheme[type]) { /* search in themes */
                        $this._drawObjectFromTheme($this._titleset, $this._titlesetSize, blockTheme, courseObject);
                    }
                    else if(monsterTheme[type]) { /* search in monsters */
                        $this._drawObjectFromTheme($this._monsters, $this._monstersSize, monsterTheme, courseObject);
                    }
                    else {
                        //console.log('fault: '+type);
                        $this._drawText(courseObject.x, courseObject.y, type);
                    }
                });
            }
        };
        /* loading all images */
        $this._images.forEach(function(img) {
            img.onload = onload; 
            img.onerror = onerror;
        });
    }

    _drawText(_x, _y, text) {
        let x = _x*this._base;
        let y = this._yFix - _y*this._base;
        this._context.fillText(text, x+3, y-3);
    }

    _drawObjectFromTheme(_titleset, _ts, _theme, courseObject) {
        const $this = this;
        let cut = _theme[courseObject.type];
        let base = $this._base;

        if(cut.extend) { /* multiples cells */
            let ext = cut.extend(courseObject),
                size = object_size(courseObject);
            ext.forEach(function(drawExt) {
                let x = courseObject.x,
                    y = courseObject.y,
                    xExt = drawExt.x,
                    yExt = drawExt.y;

                if(drawExt.text) $this._drawText(drawExt.x, drawExt.y, drawExt.text);
                else $this._paintObject(_titleset, drawExt.xC, drawExt.yC, _ts, _ts, x, y, xExt, yExt, base, base, size);
            });
        }
        else { /* one cell */
            let xC = cut.x, yC = cut.y;
            let x = courseObject.x;
            let y = courseObject.y;
            if(cut.func) {
                let nPos = cut.func(courseObject, xC, yC);
                xC = nPos.x; yC = nPos.y;
            }
            $this._paintObject(_titleset, xC, yC, _ts, _ts, x, y, 0, 0, base, base);
        }
    }

    _paintObject(_titleset, _xC, _yC, xTs, yTs, _x, _y, _xExt, _yExt, _xBase, _yBase, _size=1) {
        let xC = (_xC*xTs);
        let yC = (_yC*yTs);
        let x = (_size == 1) ?
                (_x + _xExt) * this._base :
                (_x + (_xExt * _size) - 1) * this._base;
        let y = (_size == 1) ?
                (this._yFix - (_y + _yExt) * this._base) - this._base :
                (this._yFix - (_y + (_yExt * _size) + 1) * this._base) - this._base;

        let xBase = _xBase * _size;
        let yBase = _yBase * _size;
        this._context.drawImage(_titleset, xC, yC, xTs, yTs, x, y, xBase, yBase);
    }

}

const objectNames = {
    /* -- Structures -- */
    4: 'RengaBlock', /* Brick Block */
    5: 'HatenaBlock', /* '?' Block */
    6: 'HardBlock', /* Wooden Block */
    7: 'Ground', /* Terrain */
    8: 'Coin',
    9: 'Dokan', /* Pipe */
    14: 'GroundMushroom', /* Terrain: Mushroom */
    16: 'GroundBox', /* Terrain: Box */
    17: 'Bridge', 
    21: 'ChikuwaBlock', /* Donut Lift */
    22: 'KumoBlock', /* Cloud Block */
    23: 'OnpuBlock', /* Note Block */
    26: 'GroundGoal', 
    29: 'ClearBlock', /* Clear '?' Block */
    37: 'GroundStart', 
    53: 'BeltConveyor', 
    63: 'IceBlock', 
    /* -- Monsters -- */
    0: 'Kuribo', /* Goomba */
    1: 'Nokonoko', /* Koopa Troopa */
    2: 'Pakkun', /* Piranha Plant */
    3: 'HammerBro',
    10: 'JumpStep',
   
    12: 'Dossun', /* Thwomp */
    55: 'Door', 
    /*
    11: 'Lift', /* Moving Platform *

   
   Ok 13: 'KillerHoudai', /* Bullet Bill Cannon *

   OK 15: 'Bombhei', /* Bob-Omb *

   OK 18: 'PSwitch',   
   OK 19: 'PowBlock',
   OK 20: 'SuperKinoko', /* Super Mushroom *

   OK 24: 'FireBar',
   OK 25: 'Togezo', /* Spiny *

   OK 27: 'GoalPole', ----------
   OK 28: 'Met', /* Buzzy Beetle *

   OK 30: 'Jugem', /* Lakitu *
   OK 31: 'JugemCloud', /* Lakitu's Cloud *
   OK 32: 'Tsuta', /* Vine Head *
   OK 33: '1upKinoko',
   OK 34: 'FireFlower',
   OK 35: 'SuperStar',
   OK 36: 'YouganLift',

   OK 38: 'StartSignBoard', 
   OK 39: 'Kameck', 
   OK 40: 'Togemet', /* Spike Top *
   OK 41: 'Teresa', /* Boo *
   OK 42: 'KoopaClown',
   Titleset 43: 'Toge', /* Spiny Thing Block *
   OK 44: 'KinokoFunny',
   OK 45: 'KutsuKuribo', /* Shoed Goomba/Yoshi Egg *
   OK 46: 'Karon', /* Dry Bones *
   OK 47: 'SenkanHoudai', /* Cannon *
   OK 48: 'Gesso', /* Blooper *
   Titleset 49: 'CastleBridge', 
   OK 50: 'CharaKinoko',
   ?? 51: 'DekaKinoko',
   OK 52: 'Hanachan', /* Wiggler * 

   OK 54: 'Burner', /* Flamethrower *
   OK 56: 'Pukupuku', /* Cheep Cheep *
   OK 57: 'BlackPakkun', /* Muncher *
   OK 58: 'Poo', /* Rocky Wrench *
   Titleset 59: 'Rail', 
   OK 60: 'Bubble', /* Podoboo *
   OK 61: 'Wanwan', /* Chain Chomp *
   OK 62: 'Koopa', /* Bowser *

   Titleset 64: 'Tsuta', /* VineBlock * 
   OK 65: 'CharaMario',
   OK 66: 'AirSignBoard',
   OK 67: 'HalfHitWall', /* One-way Gate *
   OK 68: 'Saw', /* Grinder *
   ?? 69: 'Player', ---------- */ 
};

const limitTheme = {
    'xCount': 16, 'yCount': 16,
    'titleset': {'M1': 16, 'M3': 16, 'MW': 16, 'WU': 64},
    'monsters': {'M1': 16, 'M3': 16, 'MW': 16, 'WU': 128}
};

var autoComplete3x4 = function(tt, limit = 12) {
    for(var i=0; i<limit; i++) {
        if(!tt[i]) tt[i] = {'xC': 0, 'yC': 0};
    }
    return tt;
};

var extend3x4objects = function(x, y, width, height, ttInit) {
    var extend = []
    var tt = autoComplete3x4(ttInit);
    for(var h=0; h<height; h++) {
        for(var w=0; w<width; w++) {
            /* top */
            if(h==(height-1) && w==0) extend.push({'x': w+x, 'y': h+y, 'xC': tt[9]['xC'], 'yC': tt[9]['yC']});
            else if(h==(height-1) && w==(width-1)) extend.push({'x': w+x, 'y': h+y, 'xC': tt[11]['xC'], 'yC': tt[11]['yC']});
            else if(h==(height-1)) extend.push({'x': w+x, 'y': h+y, 'xC': tt[10]['xC'], 'yC': tt[10]['yC']});
            /* bottom */
            else if(h==0 && w==0) extend.push({'x': w+x, 'y': h+y, 'xC': tt[0]['xC'], 'yC': tt[0]['yC']});
            else if(h==0 && w==(width-1)) extend.push({'x': w+x, 'y': h+y, 'xC': tt[2]['xC'], 'yC': tt[2]['yC']});
            else if(h==0) extend.push({'x': w+x, 'y': h+y, 'xC': tt[1]['xC'], 'yC': tt[1]['yC']});
            /* middle-bottom */
            else if(h%2==1 && w==0) extend.push({'x': w+x, 'y': h+y, 'xC': tt[3]['xC'], 'yC': tt[3]['yC']});
            else if(h%2==1 && w==(width-1)) extend.push({'x': w+x, 'y': h+y, 'xC': tt[5]['xC'], 'yC': tt[5]['yC']});
            else if(h%2==1) extend.push({'x': w+x, 'y': h+y, 'xC': tt[4]['xC'], 'yC': tt[4]['yC']});
            /* middle-top */
            else if(h%2==0 && w==0) extend.push({'x': w+x, 'y': h+y, 'xC': tt[6]['xC'], 'yC': tt[6]['yC']});
            else if(h%2==0 && w==(width-1)) extend.push({'x': w+x, 'y': h+y, 'xC': tt[8]['xC'], 'yC': tt[8]['yC']});
            else if(h%2==0) extend.push({'x': w+x, 'y': h+y, 'xC': tt[7]['xC'], 'yC': tt[7]['yC']});
        }
    }
    return extend;
};

var object_size = function(courseObject) {
    var interpret = monsters_interpret(courseObject.flags);
    if (!monsterTheme[courseObject.type] || courseObject.type == 3) return 1;
    /* if is not monster, and not HammerBro */
    return (interpret.size > 0) ? 2 : 1;
};

var monsters_interpret = function(flags) {
    var extend = []
    let type = ((flags & 0x7) & 4) >> 2;
    let wing = ((flags & 0x7) & 2) >> 1;
    let size = (flags & 0x4000) >> 14;
    // type = 0 (normal), 1 (wings)
    // size = 0 (normal), 1 (big)

    if(wing){
        extend.push({'x': 0.7, 'y': 0.4, 'xC': 1, 'yC': 2});
        extend.push({'x': -0.7, 'y': 0.4, 'xC': 0, 'yC': 2});
    }
    return {'extend': extend, 'type':type, 'wing':wing, 'size': size};
};

const blockTheme = {
    4: {'x': 1, 'y': 0},
    5: {'x': 2, 'y': 0},
    6: {'x': 6, 'y': 0},
    7: {'x': 8, 'y': 11, 'extend': function(courseObject) {
        let xC = 8; let yC = 11;
        let xMax = limitTheme['xCount']-1;
        for(var i = 0; i < courseObject.extendedData; i++) {
            if(xC == xMax) {xC = 0; yC++;}
            else xC++;
        }
        extend = [{'x': 0, 'y': 0, 'xC': xC, 'yC': yC}];
        if(courseObject.childType == 1) { /* {1} - ghost: lamp */
            extend.push({'x': 0, 'y': 2, 'xC': 1, 'yC': 1});
            extend.push({'x': 0, 'y': 1, 'xC': 2, 'yC': 1});
        }
        else if(courseObject.childType == 2) { /* {2} - ghost: clock */
            extend.push({'x': 0, 'y': 3, 'xC': 3, 'yC': 1});
            extend.push({'x': 0, 'y': 2, 'xC': 4, 'yC': 1});
            extend.push({'x': 0, 'y': 1, 'xC': 5, 'yC': 1});
        }
        else if(courseObject.childType == 3) { /* {3} - ghost: handrail */
            extend.push({'x': 0, 'y': 1, 'xC': 13, 'yC': 8});
            extend.push({'x': 1, 'y': 1, 'xC': 14, 'yC': 8});
            extend.push({'x': 2, 'y': 1, 'xC': 15, 'yC': 8});
        }
        else if(courseObject.childType == 4) { /* {!0} - ghost: flower */
            extend.push({'x': 0, 'y': 1, 'xC': 0, 'yC': 1});
        }
        return extend;

    }}, /* define function to get direction of Terrain */
    8: {'x': 7, 'y': 0, 'func': function(courseObject) {
        let flags = courseObject.flags;
        if(flags & 4 == 4) return {'x':0, 'y':16}; /* red coin */
        else return {'x':7, 'y':0};
    }}, /* normal coin or red coin */
    9: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;
        let height = courseObject.height;
        let direction = (courseObject.flags & 0x60) / 0x20;
        /* {0} right, {1} left, {2} top, {3} bottom */

        if(direction==0) { /* to right */
            var tt = {
                0: {'xC': 12, 'yC': 1}, 1: {'xC': 12, 'yC': 1}, 2: {'xC': 13, 'yC': 1},
                9: {'xC': 12, 'yC': 0}, 10: {'xC': 12, 'yC': 0}, 11: {'xC': 13, 'yC': 0},
            };
            return extend3x4objects(0, -1, height, 2, tt);
        }
        else if(direction==1) { /* to left */
            var tt = {
                0: {'xC': 11, 'yC': 1}, 1: {'xC': 12, 'yC': 1}, 2: {'xC': 12, 'yC': 1},
                9: {'xC': 11, 'yC': 0}, 10: {'xC': 12, 'yC': 0}, 11: {'xC': 12, 'yC': 0},
            };
            return extend3x4objects(-(height-1), 0, height, 2, tt);
        }
        else if(direction==2) { /* to top */
            var tt = {
                0: {'xC': 14, 'yC': 1}, 2: {'xC': 15, 'yC': 1},
                3: {'xC': 14, 'yC': 1}, 5: {'xC': 15, 'yC': 1},
                6: {'xC': 14, 'yC': 1}, 8: {'xC': 15, 'yC': 1},
                9: {'xC': 14, 'yC': 0}, 11: {'xC': 15, 'yC': 0},
            };
            return extend3x4objects(0, 0, 2, height, tt);
        }
        else { /* to bottom */
            var tt = {
                0: {'xC': 14, 'yC': 2}, 2: {'xC': 15, 'yC': 2},
                3: {'xC': 14, 'yC': 1}, 5: {'xC': 15, 'yC': 1},
                6: {'xC': 14, 'yC': 1}, 8: {'xC': 15, 'yC': 1},
                9: {'xC': 14, 'yC': 1}, 11: {'xC': 15, 'yC': 1},
            };
            return extend3x4objects(-1, -(height-1), 2, height, tt);
        }
        return [];

    }},
    14: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;
        let height = courseObject.height;
        let color = (courseObject.flags >> 18) & 3;
        /* {0} red , {1} yellow , {2} green */

        /* mushroom head */
        var tt = {
            9: {'xC': 3, 'yC': 2}, 10: {'xC': 4, 'yC': 2}, 11: {'xC': 5, 'yC': 2},
        };
        if(color == 1) {/* color {1} */
            tt[9]= {'xC': 3, 'yC': 3};
            tt[10] = {'xC': 4, 'yC': 3};
            tt[11] = {'xC': 5, 'yC': 3};
        }
        else if(color == 2) {/* color {2} */
            tt[9]= {'xC': 3, 'yC': 4};
            tt[10] = {'xC': 4, 'yC': 4};
            tt[11] = {'xC': 5, 'yC': 4};
        }
        var extend = extend3x4objects(0, (height-1), width, 1, tt);

        /* mushroom body */
        if(width%2 == 0) {
            for(var h=0; h<(height-1); h++) {
                let w = ((width)/2 -1);
                if(h == y) {
                    extend.push({'x': w, 'y': h, 'xC': 6, 'yC': 2});
                    extend.push({'x': w+1, 'y': h, 'xC': 7, 'yC': 2});
                }
                else {
                    extend.push({'x': w, 'y': h, 'xC': 6, 'yC': 1});
                    extend.push({'x': w+1, 'y': h, 'xC': 7, 'yC': 1});
                }
            }
        }
        else {
            for(var h=0; h<(height-1); h++) {
                let w = (width-1)/2;
                if(h == y) extend.push({'x': w, 'y': h, 'xC': 6, 'yC': 4});
                else extend.push({'x': w, 'y': h, 'xC': 6, 'yC': 3});
            }
        }

        return extend;

    }},
    16: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;
        let height = courseObject.height;
        let type = ((courseObject.flags >> 18) & 0x3);
        /* {0}: block 1, {1}: block 2, {2}: block 3 */

        var tts = {
            0: {
                0: {'xC': 7, 'yC': 6}, 1: {'xC': 8, 'yC': 6}, 2: {'xC': 9, 'yC': 6},
                3: {'xC': 7, 'yC': 5}, 4: {'xC': 8, 'yC': 5}, 5: {'xC': 9, 'yC': 5},
                6: {'xC': 7, 'yC': 4}, 7: {'xC': 8, 'yC': 4}, 8: {'xC': 9, 'yC': 4},
                9: {'xC': 7, 'yC': 3}, 10: {'xC': 8, 'yC': 3}, 11: {'xC': 9, 'yC': 3},
            },
            1: {
                0: {'xC': 10, 'yC': 6}, 1: {'xC': 11, 'yC': 6}, 2: {'xC': 12, 'yC': 6},
                3: {'xC': 10, 'yC': 5}, 4: {'xC': 11, 'yC': 5}, 5: {'xC': 12, 'yC': 5},
                6: {'xC': 10, 'yC': 4}, 7: {'xC': 11, 'yC': 4}, 8: {'xC': 12, 'yC': 4},
                9: {'xC': 10, 'yC': 3}, 10: {'xC': 11, 'yC': 3}, 11: {'xC': 12, 'yC': 3},
            },
            2: {
                0: {'xC': 13, 'yC': 6}, 1: {'xC': 14, 'yC': 6}, 2: {'xC': 15, 'yC': 6},
                3: {'xC': 13, 'yC': 5}, 4: {'xC': 14, 'yC': 5}, 5: {'xC': 15, 'yC': 5},
                6: {'xC': 13, 'yC': 4}, 7: {'xC': 14, 'yC': 4}, 8: {'xC': 15, 'yC': 4},
                9: {'xC': 13, 'yC': 3}, 10: {'xC': 14, 'yC': 3}, 11: {'xC': 15, 'yC': 3},
            },
        };
        return extend3x4objects(0, 0, width, height, tts[type]);

    }},
    17: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;

        var tt = {
            0: {'xC': 0, 'yC': 3}, 1: {'xC': 1, 'yC': 3}, 2: {'xC': 2, 'yC': 3},
            9: {'xC': 0, 'yC': 2}, 10: {'xC': 1, 'yC': 2}, 11: {'xC': 2, 'yC': 2},
        };
        return extend3x4objects(0, 0, width, 2, tt);

    }},
    21: {'x': 0, 'y': 4},
    22: {'x': 6, 'y': 6},
    23: {'x': 0, 'y': 0, 'func': function(courseObject) {
        /* type: {0} jump, {1} high jump */
        let type = (courseObject.flags >> 2) & 1;
        if(type == 1) return {'x':6, 'y':5}; 
        else return {'x':4, 'y':0};

    }},
    26: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width - 3;
        let height = courseObject.height;
        var tt = {
            0: {'xC': 11, 'yC': 8}, 1: {'xC': 12, 'yC': 8}, 2: {'xC': 12, 'yC': 8},
            3: {'xC': 11, 'yC': 8}, 4: {'xC': 12, 'yC': 8}, 5: {'xC': 12, 'yC': 8},
            6: {'xC': 11, 'yC': 8}, 7: {'xC': 12, 'yC': 8}, 8: {'xC': 12, 'yC': 8},
            9: {'xC': 11, 'yC': 7}, 10: {'xC': 12, 'yC': 7}, 11: {'xC': 12, 'yC': 7},
        };
        return extend3x4objects(0, 0, width, height, tt);
    }},
    29: {'x': 3, 'y': 0},
    37: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width - 3;
        let height = courseObject.height;
        var tt = {
            0: {'xC': 9, 'yC': 8}, 1: {'xC': 9, 'yC': 8}, 2: {'xC': 10, 'yC': 8},
            3: {'xC': 9, 'yC': 8}, 4: {'xC': 9, 'yC': 8}, 5: {'xC': 10, 'yC': 8},
            6: {'xC': 9, 'yC': 8}, 7: {'xC': 9, 'yC': 8}, 8: {'xC': 10, 'yC': 8},
            9: {'xC': 9, 'yC': 7}, 10: {'xC': 9, 'yC': 7}, 11: {'xC': 10, 'yC': 7},
        };
        return extend3x4objects(0, 0, width, height, tt);
    }},
    53: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;
        var tt = {
            0: {'xC': 8, 'yC': 0}, 1: {'xC': 9, 'yC': 0}, 2: {'xC': 10, 'yC': 0},
            9: {'xC': 8, 'yC': 0}, 10: {'xC': 9, 'yC': 0}, 11: {'xC': 10, 'yC': 0},
        };
        return extend3x4objects(0, 0, width, 1, tt);
    }},
    63: {'x': 8, 'y': 7},
};

const monsterTheme = {
    0: {'x': 1, 'y': 1, 'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject.flags);
        var extend = interpret.extend;
        extend.push({'x': 0, 'y': 0, 'xC': 1, 'yC': 1});
        extend.push({'x': 0, 'y': 1, 'xC': 1, 'yC': 0});
        return extend;
    }},
    1: {'x': 2, 'y': 1, 'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject.flags);
        var extend = interpret.extend;
        let type = interpret.type;

        if(type) { /* red */
            extend.push({'x': 0, 'y': 0, 'xC': 2, 'yC': 3});
            extend.push({'x': 0, 'y': 1, 'xC': 2, 'yC': 2});
        }
        else { /* green */
            extend.push({'x': 0, 'y': 0, 'xC': 2, 'yC': 1});
            extend.push({'x': 0, 'y': 1, 'xC': 2, 'yC': 0});
        }
        return extend;
    }},
    2: {'x': 2, 'y': 1, 'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject.flags);
        var extend = interpret.extend;
        let type = interpret.type;
        if(type) { /* fire */
            extend.push({'x': 0, 'y': 0, 'xC': 3, 'yC': 3});
            extend.push({'x': 0, 'y': 1, 'xC': 3, 'yC': 2});
        }
        else { /* pakkun */
            extend.push({'x': 0, 'y': 0, 'xC': 3, 'yC': 1});
            extend.push({'x': 0, 'y': 1, 'xC': 3, 'yC': 0});
        }
        
        return extend;
    }},
    3: {'x': 4, 'y': 1, 'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject.flags);
        var extend = interpret.extend;
        let size = interpret.size;
        if(size) { /* big HammerBro */
            extend.push({'x': 0, 'y': 0, 'xC': 5, 'yC': 3});
            extend.push({'x': -1, 'y': 0, 'xC': 4, 'yC': 3});
            extend.push({'x': 0, 'y': 1, 'xC': 5, 'yC': 2});
            extend.push({'x': -1, 'y': 1, 'xC': 4, 'yC': 2});
        }
        else {
            extend.push({'x': 0, 'y': 0, 'xC': 4, 'yC': 1});
            extend.push({'x': 0, 'y': 1, 'xC': 4, 'yC': 0});
        }
        return extend;
    }},
    10: {'x': 5, 'y': 0, 'func': function(courseObject) {
        let interpret = monsters_interpret(courseObject.flags),
            type = interpret.type;
        if(type) return {'x': 5, 'y': 1}; /* horizontal */
        else return {'x': 5, 'y': 0}; /* vertical */
    }},
    /*11: {'x': 9, 'y': 1, 'extend': function(courseObject) { --------------- add lift blue
        let interpret = monsters_interpret(courseObject.flags);
        console.log(interpret);
        var extend = [];
        extend.push({'x': 0, 'y': 0, 'xC': 9, 'yC': 1});
        extend.push({'x': -1, 'y': 0, 'xC': 8, 'yC': 1});
        extend.push({'x': -2, 'y': 0, 'xC': 7, 'yC': 1});
        extend.push({'x': -3, 'y': 0, 'xC': 6, 'yC': 1});
        return extend;
    }},*/
    12: {'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject.flags);
        var extend = interpret.extend;
        extend.push({'x': 0, 'y': 0, 'xC': 11, 'yC': 1});
        extend.push({'x': -1, 'y': 0, 'xC': 10, 'yC': 1});
        extend.push({'x': -1, 'y': 1, 'xC': 10, 'yC': 0});
        extend.push({'x': 0, 'y': 1, 'xC': 11, 'yC': 0});
        return extend;
    }},

    55: {'x': 11, 'y': 6, 'extend': function(courseObject) {
        var extend = [];
        extend.push({'x': 0, 'y': 0, 'xC': 11, 'yC': 6});
        extend.push({'x': 0, 'y': 1, 'xC': 11, 'yC': 5});
        return extend;
    }},
};