/**
 * @module MonsterObject
 * This class represents the monster objects.
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-course-viewer GitHub
 * @license https://opensource.org/licenses/GPL-3.0 GNU Public License (GPLv3)
 * @copyright 2019 Leonardo Mauro
 * @package smm-course-viewer
 * @access public
 */
class MonsterObject extends CourseObject {

    /**
     * @method module:MonsterObject
     * Constructor of class
     * @extends CourseObject
     * @arg {Object} _objectData
     * @instance
     * @access public
     * @return {this}
     */
    constructor(_objectData) {
        /* general attr */
        super(_objectData);
        this.name = MonsterObject.names[this.type];
        /* extended attr */
        let ext = this._extAttributes(_objectData);
        this.extend = ext.extend;
        this.subType = ext.subType;
        this.wing = ext.wing;
        this.size = ext.size;
        this.y = this.y + ext.addY;
    }

    /**
     * @method module:MonsterObject::isBlock
     * Check if is a block
     * @arg {Integer} _type     Game type
     * @static
     * @access public
     * @return {Boolean}
     */
    static is(_type) {
        return (MonsterObject.names[_type]) ? true : false;
    }

    _extAttributes(_objectData) {
        let flags = _objectData.flags, type = _objectData.type,
            subType = ((flags & 0x7) & 4) >> 2,
            wing = ((flags & 0x7) & 2) >> 1,
            size = (type!=3) ? ((flags & 0x4000) >> 14) + 1 : 1,
            extend = [],
            addY = (_objectData.type == 30) ? 1 : 0;
        // type = 0 (normal), 1 (wings)
        // size = 0 (normal), 1 (big)
        /*if(wing){ -------------------------------- math wings is broke for monsters size 2
            let x = (courseObject.width - 1), xAdd = 0.7 * size,
                y = (courseObject.height/(5.0));
            extend.push({'x': xAdd/(size), 'y': y, 'xT': 1, 'yT': 2});
            extend.push({'x': -(x+xAdd)/(size), 'y': y, 'xT': 0, 'yT': 2});

            if(size-1){
                console.log([courseObject.type, courseObject.width, courseObject.height, size]);
                console.log([-(x+xAdd), xAdd]);
            }
        }*/
        return {'extend':extend, 'subType':subType, 'wing':wing, 'size':size, 'addY':addY};
    }
}

/**
 * @method module:MonsterObject::names
 * Objects Name
 * @access public
 */
MonsterObject.names = {
    0: 'Kuribo', /* Goomba */
    1: 'Nokonoko', /* Koopa Troopa */
    2: 'Pakkun', /* Piranha Plant */
    3: 'HammerBro',
    10: 'JumpStep',
    11: 'Lift', /* Moving Platform */
    12: 'Dossun', /* Thwomp */
    13: 'KillerHoudai', /* Bullet Bill Cannon */
    15: 'Bombhei', /* Bob-Omb */
    18: 'PSwitch',
    19: 'PowBlock',
    20: 'SuperKinoko', /* Mushroom */
    24: 'FireBar',
    25: 'Togezo', /* Spiny */
    28: 'Met', /* Buzzy Beetle */
    30: 'Jugem', /* Lakitu */
    31: 'JugemCloud', /* Lakitu's Cloud */
    32: 'Tsuta', /* Vine Head */
    33: 'UpKinoko', /* 1 UP */
    34: 'FireFlower',
    35: 'SuperStar',
    36: 'YouganLift',
    38: 'StartSignBoard',
    39: 'Kameck',
    40: 'Togemet', /* Spike Top */

    55: 'Door', 

    60: 'Bubble', /* Podoboo */
};

/**
 * @method module:MonsterObject::codes
 * Objects Code
 * @access public
 */
MonsterObject.codes = {
    Kuribo: 0,
    Nokonoko: 1,
    Pakkun: 2,
    HammerBro: 3,
    JumpStep: 10,
    Lift: 11,
    Dossun: 12,
    KillerHoudai: 13,
    Bombhei: 15,
    PSwitch: 18,
    PowBlock: 19,
    SuperKinoko: 20,
    FireBar: 24,
    Togezo: 25,
    Met: 28,
    Jugem: 30,
    JugemCloud: 31,
    Tsuta: 32,
    UpKinoko: 33,
    FireFlower: 34,
    SuperStar: 35,
    YouganLift: 36,
    StartSignBoard: 38,
    Kameck: 39,
    Togemet: 40,

    Door: 55,

    Bubble: 60,
};