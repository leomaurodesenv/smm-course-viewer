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
        this._base = 20;
        this._element = _element;
        this._canvas = null;
        this._context = null;
        this._canvasId = 'courseDraw';

        this._widthBlock = _course.widthBlock;
        this._heightBlock = _course.heightBlock;
        this._gameMode = _course.mode;
        this._gameTheme = _course.themeName;

        this._themeSize = limitTheme['modeBase'][this._gameMode];
        this._titleset = new Image(this._themeSize*16, this._themeSize*16); /* 256 objects */
        this._titleset.src = './layout/draw/titleset/'+this._gameMode+'-'+this._gameTheme+'.png';

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
        /* salve canvas element */
        this._canvas = canvas;
        this._context = this._canvas.getContext('2d');
        this._context.font = '10px sans-serif';
    }
    
    _drawBlocks(_X, _Y) {
        /* https://www.w3schools.com/tags/canvas_drawimage.asp */
        const $this = this;
        var img = new Image($this._base, $this._base);
        img.onload = function(){
            for(var y = _Y - 1; y >= 0; y--) {
                for(var x = 0; x < _X; x++) {
                    $this._context.drawImage(img, x*$this._base, y*$this._base, $this._base, $this._base);
                }
            }
        };
        img.src = './layout/draw/support/bg-square.png';
    }

    _drawObjects(objects) {
        const $this = this;
        $this._titleset.onload = function(){
            objects.forEach(function(courseObject) {
                let x = courseObject.x*$this._base;
                let z = courseObject.z;
                let y = $this._yFix - courseObject.y*$this._base;
                if(objectTheme[courseObject.type]) { /* search in themes */
                    $this._drawObjectFromTheme(courseObject)
                }
                else $this._context.fillText(courseObject.type, x+3, y-3);
            });
        };
    }

    _drawObjectFromTheme(courseObject) {
        const $this = this;
        
        let cut = objectTheme[courseObject.type];
        let xC = cut['x'], yC = cut['y'];
        if(cut['func']) {
            let nPos = cut['func'](courseObject, xC, yC);
            xC = nPos['x'];
            yC = nPos['y'];
        }
        xC *= $this._themeSize;
        yC *= $this._themeSize;

        let x = (courseObject.x*$this._base);
        let y = ($this._yFix - courseObject.y*$this._base) - $this._base;

        $this._context.drawImage($this._titleset, xC, yC, $this._themeSize, $this._themeSize, x, y, $this._base, $this._base);
    }

}

const objectNames = {
    7: 'EditGround', /* Terrain */
    /*
    0: 'EditKuribo', /* Goomba *
    1: 'EditNokonoko', /* Koopa Troopa *
    2: 'EditPakkun', /* Piranha Plant *
    3: 'EditHammerBro',
    4: 'EditRengaBlock', /* Brick Block * ----------
    5: 'EditHatenaBlock', /* '?' Block * ----------
    6: 'EditHardBlock', /* Wooden Block * ----------
    8: 'EditCoin', ----------
    9: 'EditDokan', /* Pipe * ----------
    10: 'EditJumpStep', /* Springboard * ----------
    11: 'EditLift', /* Moving Platform * ----------
    12: 'EditDossun', /* Thwomp *
    13: 'EditKillerHoudai', /* Bullet Bill Cannon *
    14: 'EditGroundMushroom', /* Terrain: Mushroom * ----------
    15: 'EditBombhei', /* Bob-Omb *
    16: 'EditGroundBox', /* Terrain: Box * ----------
    17: 'EditBridge', ----------
    18: 'EditPSwitch',
    19: 'EditPowBlock',
    20: 'EditSuperKinoko',
    21: 'EditChikuwaBlock', /* Donut Lift *
    22: 'EditKumoBlock', /* Cloud Block *
    23: 'EditOnpuBlock', /* Note Block *
    24: 'EditFireBar',
    25: 'EditTogezo', /* Spiny *
    26: 'EditGroundGoal', ----------
    27: 'EditGoalPole', ----------
    28: 'EditMet', /* Buzzy Beetle *
    29: 'EditClearBlock',
    30: 'EditJugem', /* Lakitu *
    31: 'EditJugemCloud', /* Lakitu's Cloud *
    32: 'EditTsutaBlock', /* Vine Block? *
    33: 'Edit1upKinoko',
    34: 'EditFireFlower',
    35: 'EditSuperStar',
    36: 'EditYouganLift',
    37: 'EditGroundStart', ----------
    38: 'EditStartSignBoard', ----------
    39: 'EditKameck', 
    40: 'EditTogemet', /* Spike Top *
    41: 'EditTeresa', /* Boo *
    42: 'EditKoopaClown',
    43: 'EditToge', /* Spiny Thing *
    44: 'EditKinokoFunny',
    45: 'EditKutsuKuribo', /* Shoed Goomba/Yoshi Egg *
    46: 'EditKaron', /* Dry Bones *
    47: 'EditSenkanHoudai', /* Cannon *
    48: 'EditGesso', /* Blooper *
    49: 'EditCastleBridge', ----------
    50: 'EditCharaKinoko',
    51: 'EditDekaKinoko',
    52: 'EditHanachan', /* Wiggler * ----------
    53: 'EditBeltConveyor',
    54: 'EditBurner', /* Flamethrower *
    55: 'EditDoor', ----------
    56: 'EditPukupuku', /* Cheep Cheep *
    57: 'EditBlackPakkun', /* Muncher *
    58: 'EditPoo', /* Rocky Wrench *
    59: 'EditRail', ----------
    60: 'EditBubble', /* Podoboo *
    61: 'EditWanwan', /* Chain Chomp *
    62: 'EditKoopa', /* Bowser *
    63: 'EditIceBlock' ----------
    64: 'EditTsuta', /* Vine * ----------
    65: 'EditCharaMario',
    66: 'EditAirSignBoard',
    67: 'EditHalfHitWall', /* One-way Gate *
    68: 'EditSaw', /* Grinder *
    69: 'EditPlayer', ---------- */ 
};

const limitTheme = {
    'xCount': 16, 'yCount': 16,
    'modeBase': {
        'M1': 16, 
        'M3': 16, 
        'MW': 16, 
        'WU': 32
    }
}

const objectTheme = {
    7: {'x': 8, 'y': 11, 'func': function(courseObject, xC, yC) {//1,12
        let xMax = limitTheme['xCount']-1;
        for(var i = 0; i < courseObject.extendedData; i++) {
            if(xC == xMax) {
                xC = 0; yC++;
            }
            else xC++;
        }
        return {'x':xC, 'y':yC};
    }}, /* define function to get direction of Terrain */

};