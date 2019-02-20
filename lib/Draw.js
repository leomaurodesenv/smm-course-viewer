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
        this._blocks = new BlockDraw(this._gameMode, this._gameTheme);

        this._monstersSize = limitTheme['monsters'][this._gameMode];
        this._monsters = new Image(this._themeSize*16, this._themeSize*16); /* 256 blocks */
        this._monsters.src = './layout/draw/monsters/'+this._gameMode+'.png';
        
        this._images = [this._blocks.getTheme()];

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
            console.error('Draw: Error: squares don\'t load.');
        };
        bg.src = './layout/draw/support/bg-square.png';
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
                    if($this._blocks.hasDraw(type)) {
                        $this._drawObjectFromTheme($this._blocks, courseObject);
                    }
                    /*
                    if(blockTheme[type]) { /* search in themes *
                        $this._drawObjectFromTheme($this._titleset, $this._titlesetSize, blockTheme, courseObject);
                    }
                    /* else if(monstersTheme[type]) { /* search in monsters *
                        $this._drawObjectFromTheme($this._monsters, $this._monstersSize, monstersTheme, courseObject);
                    }*/
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
        let x = _x*this._base,
            y = this._yFix - _y*this._base;
        this._context.fillText(text, x+3, y-3);
    }

    //_drawObjectFromTheme(_ts, _theme, courseObject) {
    _drawObjectFromTheme(_theme, courseObject) {
        const $this = this;
        let def = _theme.getDef(courseObject.type),
            _titleset = _theme.getTheme(),
            _ts = _theme.getThemeSize(),
            _base = $this._base;
        let x = courseObject.x,
            y = courseObject.y;
        /* multiples cells */
        if(def.extend) {
            let ext = def.extend(courseObject);
            ext.forEach(function(drawExt) {
                let xExt = drawExt.x,
                    yExt = drawExt.y;
                let objectPaint = {
                    'titleset': _titleset, 'xT': drawExt.xT, 'yT':drawExt.yT, 'xTs': _ts, 'yTs': _ts,
                    'x': x, 'y': y, 'xExt': xExt, 'yExt': yExt, 'xBase': _base, 'yBase': _base, 
                    'size': courseObject.size, 'width': courseObject.width };
                $this._paintObject(objectPaint);
            });
        }
        /* only one cell */
        else {
            let xT = def.xT, yT = def.yT;
            if(def.func) {
                let nPos = cut.func(courseObject);
                xT = nPos.xT; yT = nPos.yT;
            }
            let objectPaint = {
                'titleset': _titleset, 'xT': xT, 'yT':yT, 'xTs': _ts, 'yTs': _ts,
                'x': x, 'y': y, 'xExt': 0, 'yExt': 0, 'xBase': _base, 'yBase': _base, 
                'size': courseObject.size, 'width': courseObject.width };
            $this._paintObject(objectPaint);
        }
    }

    _paintObject(object) {
        let _titleset = object.titleset, 
            _xT = object.xT, _yT = object.yT, 
            xTs = object.xTs, yTs = object.yTs, 
            _x = object.x, _y = object.y, 
            _xExt = object.xExt, _yExt = object.yExt, 
            _xBase = object.xBase, _yBase = object.yBase, 
            _size = object.size, _width = object.width;

        let xT = (_xT*xTs);
        let yT = (_yT*yTs);
        let x = (_size == 1) ?
                (_x + _xExt) * this._base :
                (_x + (_xExt * _size) - (2 - Math.ceil(_width/2))) * this._base;
        let y = (_size == 1) ?
                (this._yFix - (_y + _yExt) * this._base) - this._base :
                (this._yFix - (_y + (_yExt * _size) + 1) * this._base) - this._base;

        let xBase = _xBase * _size;
        let yBase = _yBase * _size;
        this._context.drawImage(_titleset, xT, yT, xTs, yTs, x, y, xBase, yBase);
    }

}

const objectNames = {
    /* -- Monsters -- */
    0: 'Kuribo', /* Goomba */
    1: 'Nokonoko', /* Koopa Troopa */
    2: 'Pakkun', /* Piranha Plant */
    3: 'HammerBro',
    10: 'JumpStep',
   
    12: 'Dossun', /* Thwomp */
    13: 'KillerHoudai', /* Bullet Bill Cannon */

    55: 'Door', 
    /*
    11: 'Lift', /* Moving Platform *

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
        if(!tt[i]) tt[i] = {'xT': 0, 'yT': 0};
    }
    return tt;
};

var extend3x4objects = function(x, y, width, height, ttInit) {
    var extend = []
    var tt = autoComplete3x4(ttInit);
    for(var h=0; h<height; h++) {
        for(var w=0; w<width; w++) {
            /* top */
            if(h==(height-1) && w==0) extend.push({'x': w+x, 'y': h+y, 'xT': tt[9]['xT'], 'yT': tt[9]['yT']});
            else if(h==(height-1) && w==(width-1)) extend.push({'x': w+x, 'y': h+y, 'xT': tt[11]['xT'], 'yT': tt[11]['yT']});
            else if(h==(height-1)) extend.push({'x': w+x, 'y': h+y, 'xT': tt[10]['xT'], 'yT': tt[10]['yT']});
            /* bottom */
            else if(h==0 && w==0) extend.push({'x': w+x, 'y': h+y, 'xT': tt[0]['xT'], 'yT': tt[0]['yT']});
            else if(h==0 && w==(width-1)) extend.push({'x': w+x, 'y': h+y, 'xT': tt[2]['xT'], 'yT': tt[2]['yT']});
            else if(h==0) extend.push({'x': w+x, 'y': h+y, 'xT': tt[1]['xT'], 'yT': tt[1]['yT']});
            /* middle-bottom */
            else if(h%2==1 && w==0) extend.push({'x': w+x, 'y': h+y, 'xT': tt[3]['xT'], 'yT': tt[3]['yT']});
            else if(h%2==1 && w==(width-1)) extend.push({'x': w+x, 'y': h+y, 'xT': tt[5]['xT'], 'yT': tt[5]['yT']});
            else if(h%2==1) extend.push({'x': w+x, 'y': h+y, 'xT': tt[4]['xT'], 'yT': tt[4]['yT']});
            /* middle-top */
            else if(h%2==0 && w==0) extend.push({'x': w+x, 'y': h+y, 'xT': tt[6]['xT'], 'yT': tt[6]['yT']});
            else if(h%2==0 && w==(width-1)) extend.push({'x': w+x, 'y': h+y, 'xT': tt[8]['xT'], 'yT': tt[8]['yT']});
            else if(h%2==0) extend.push({'x': w+x, 'y': h+y, 'xT': tt[7]['xT'], 'yT': tt[7]['yT']});
        }
    }
    return extend;
};

var object_size = function(courseObject) {
    var interpret = monsters_interpret(courseObject);
    /* if is not monster, and not HammerBro */
    if (!monstersTheme[courseObject.type] || courseObject.type == 3) return 1;
    /* else */
    return interpret.size;
};

var monsters_interpret = function(courseObject) {
    var extend = [];
    let flags = courseObject.flags;
    let type = ((flags & 0x7) & 4) >> 2,
        wing = ((flags & 0x7) & 2) >> 1,
        size = ((flags & 0x4000) >> 14) + 1;
    // type = 0 (normal), 1 (wings)
    // size = 0 (normal), 1 (big)
    

    /*if(wing){ -------- math wings is brok for monsters size 2
        let x = (courseObject.width - 1), xAdd = 0.7 * size,
            y = (courseObject.height/(5.0));
        extend.push({'x': xAdd/(size), 'y': y, 'xT': 1, 'yT': 2});
        extend.push({'x': -(x+xAdd)/(size), 'y': y, 'xT': 0, 'yT': 2});

        if(size-1){
            console.log([courseObject.type, courseObject.width, courseObject.height, size]);
            console.log([-(x+xAdd), xAdd]);
        }
    }*/
    return {'extend': extend, 'type':type, 'wing':wing, 'size': size};
};

const monstersTheme = {
    0: {'x': 1, 'y': 1, 'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject);
        var extend = interpret.extend;
        extend.push({'x': 0, 'y': 0, 'xT': 1, 'yT': 1});
        extend.push({'x': 0, 'y': 1, 'xT': 1, 'yT': 0});
        return extend;
    }},
    1: {'x': 2, 'y': 1, 'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject);
        var extend = interpret.extend;
        let type = interpret.type;

        if(type) { /* red */
            extend.push({'x': 0, 'y': 0, 'xT': 2, 'yT': 3});
            extend.push({'x': 0, 'y': 1, 'xT': 2, 'yT': 2});
        }
        else { /* green */
            extend.push({'x': 0, 'y': 0, 'xT': 2, 'yT': 1});
            extend.push({'x': 0, 'y': 1, 'xT': 2, 'yT': 0});
        }
        return extend;
    }},
    2: {'x': 2, 'y': 1, 'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject);
        var extend = interpret.extend;
        let type = interpret.type;
        if(type) { /* fire */
            extend.push({'x': 0, 'y': 0, 'xT': 3, 'yT': 3});
            extend.push({'x': 0, 'y': 1, 'xT': 3, 'yT': 2});
        }
        else { /* pakkun */
            extend.push({'x': 0, 'y': 0, 'xT': 3, 'yT': 1});
            extend.push({'x': 0, 'y': 1, 'xT': 3, 'yT': 0});
        }
        
        return extend;
    }},
    3: {'x': 4, 'y': 1, 'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject);
        var extend = interpret.extend;
        let size = interpret.size;
        if(size-1) { /* big HammerBro */
            extend.push({'x': 0, 'y': 0, 'xT': 5, 'yT': 3});
            extend.push({'x': -1, 'y': 0, 'xT': 4, 'yT': 3});
            extend.push({'x': 0, 'y': 1, 'xT': 5, 'yT': 2});
            extend.push({'x': -1, 'y': 1, 'xT': 4, 'yT': 2});
        }
        else {
            extend.push({'x': 0, 'y': 0, 'xT': 4, 'yT': 1});
            extend.push({'x': 0, 'y': 1, 'xT': 4, 'yT': 0});
        }
        return extend;
    }},
    10: {'x': 5, 'y': 0, 'func': function(courseObject) {
        let interpret = monsters_interpret(courseObject),
            type = interpret.type;
        if(type) return {'x': 5, 'y': 1}; /* horizontal */
        else return {'x': 5, 'y': 0}; /* vertical */
    }},
    /*11: {'x': 9, 'y': 1, 'extend': function(courseObject) { --------------- add lift blue
        let interpret = monsters_interpret(courseObject);
        console.log(interpret);
        var extend = [];
        extend.push({'x': 0, 'y': 0, 'xT': 9, 'yT': 1});
        extend.push({'x': -1, 'y': 0, 'xT': 8, 'yT': 1});
        extend.push({'x': -2, 'y': 0, 'xT': 7, 'yT': 1});
        extend.push({'x': -3, 'y': 0, 'xT': 6, 'yT': 1});
        return extend;
    }},*/
    12: {'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject);
        var extend = interpret.extend;
        extend.push({'x': 0, 'y': 0, 'xT': 11, 'yT': 1});
        extend.push({'x': -1, 'y': 0, 'xT': 10, 'yT': 1});
        extend.push({'x': -1, 'y': 1, 'xT': 10, 'yT': 0});
        extend.push({'x': 0, 'y': 1, 'xT': 11, 'yT': 0});
        return extend;
    }},
    13: {'extend': function(courseObject) {
        let interpret = monsters_interpret(courseObject);
        var extend = [];
        var tt = (interpret.type) ? 
            {0: {'xT': 11, 'yT': 2}, 1: {'xT': 11, 'yT': 3}, 2: {'xT': 11, 'yT': 4}} :
            {0: {'xT': 12, 'yT': 0}, 1: {'xT': 12, 'yT': 1}, 2: {'xT': 12, 'yT': 2}};
        for(let h=0; h<courseObject.height; h++) {
            let pos = (h==(courseObject.height-2)) ? 1 :
                      (h==(courseObject.height-1)) ? 0 : 2;
            extend.push({'x': 0, 'y': h, 'xT': tt[pos]['xT'], 'yT': tt[pos]['yT']});
        }
        return extend;
    }},

    55: {'x': 11, 'y': 6, 'extend': function(courseObject) {
        var extend = [];
        extend.push({'x': 0, 'y': 0, 'xT': 11, 'yT': 6});
        extend.push({'x': 0, 'y': 1, 'xT': 11, 'yT': 5});
        return extend;
    }},
};