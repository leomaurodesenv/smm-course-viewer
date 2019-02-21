 /**
 * @module MonsterDraw
 * This class draw the monsters from draw/monster/.
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-course-viewer GitHub
 * @license https://opensource.org/licenses/GPL-3.0 GNU Public License (GPLv3)
 * @copyright 2019 Leonardo Mauro
 * @package smm-course-viewer
 * @access public
 */
class MonsterDraw {

    /**
     * @method module:MonsterDraw
     * Constructor of class
     * @arg {String} _gameMode      Game mode
     * @arg {String} _gameTheme     Game theme
     * @instance
     * @access public
     * @return {this}
     */
    constructor(_gameMode) {
        /* theme definitions */
        this._themeLimit = {
            'length':{'x':16, 'y':16}, // blocks counting
            'size':{'M1':16, 'M3':16, 'MW':16, 'WU':128} }; // pixels
        this._themeSize = this._themeLimit['size'][_gameMode];
        this._theme = new Image(this._themeSize * this._themeLimit.length.x, 
                                this._themeSize * this._themeLimit.length.y);
        this._theme.src = './layout/draw/monster/'+_gameMode+'.png';
    }

    /**
     * @method module:MonsterDraw::getTheme
     * Return the theme image
     * @access public
     * @return {html}
     */
    getTheme() {
        return this._theme;
    }

    /**
     * @method module:MonsterDraw::getThemeSize
     * Return the theme size
     * @access public
     * @return {Integer}
     */
    getThemeSize () {
        return this._themeSize;
    }

    /**
     * @method module:MonsterDraw::getDef
     * Return the block definitions
     * @access public
     * @return {Dictionay}
     */
    getDef(_type) {
        return MonsterDraw._defitions[_type];
    }

    /**
     * @method module:MonsterDraw::getDef
     * Check if this type has a draw
     * @access public
     * @return {Dictionay}
     */
    hasDraw(_type) {
        return (this.getDef(_type)) ? true :false;
    }
}

/**
 * @method module:MonsterDraw::_defitions
 * Monster Draw Definitions
 * @access private
 */
MonsterDraw._defitions = {
    0:{'extend':function(courseObject) {
        var extend = courseObject.extend;
        extend.push({'x':0, 'y':0, 'xT':1, 'yT':1});
        extend.push({'x':0, 'y':1, 'xT':1, 'yT':0});
        return extend;
    }},
    1:{'extend':function(courseObject) {
        var extend = courseObject.extend;
        let subType = courseObject.subType;
        /* red */
        if(subType) { 
            extend.push({'x':0, 'y':0, 'xT':2, 'yT':3});
            extend.push({'x':0, 'y':1, 'xT':2, 'yT':2});
        }
        /* green */
        else {
            extend.push({'x':0, 'y':0, 'xT':2, 'yT':1});
            extend.push({'x':0, 'y':1, 'xT':2, 'yT':0});
        }
        return extend;
    }},
    2:{'extend':function(courseObject) {
        var extend = courseObject.extend;
        let subType = courseObject.subType;
        /* fire */
        if(subType) {
            extend.push({'x':0, 'y':0, 'xT':3, 'yT':3});
            extend.push({'x':0, 'y':1, 'xT':3, 'yT':2});
        }
        /* pakkun */
        else {
            extend.push({'x':0, 'y':0, 'xT':3, 'yT':1});
            extend.push({'x':0, 'y':1, 'xT':3, 'yT':0});
        }
        return extend;
    }},
    3:{'extend':function(courseObject) {
        var extend = courseObject.extend;
        let width = courseObject.width;
        /* big HammerBro */
        if(width-1) {
            extend.push({'x':0, 'y':0, 'xT':5, 'yT':3});
            extend.push({'x':-1, 'y':0, 'xT':4, 'yT':3});
            extend.push({'x':0, 'y':1, 'xT':5, 'yT':2});
            extend.push({'x':-1, 'y':1, 'xT':4, 'yT':2});
        }
        /* HammerBro */
        else {
            extend.push({'x':0, 'y':0, 'xT':4, 'yT':1});
            extend.push({'x':0, 'y':1, 'xT':4, 'yT':0});
        }
        return extend;
    }},
    10:{'xT':5, 'yT':0, 'func':function(courseObject) {
        let subType = courseObject.subType;
        /* horizontal */
        if(subType) return {'xT':5, 'yT':1};
        /* vertical */
        else return {'xT':5, 'yT':0};
    }},
    11:{'extend':function(courseObject) {
        let subType = courseObject.subType;
        var extend = [];
        if(subType){
            extend.push({'x':0, 'y':0, 'xT':9, 'yT':1});
            extend.push({'x':-1, 'y':0, 'xT':8, 'yT':1});
            extend.push({'x':-2, 'y':0, 'xT':7, 'yT':1});
            extend.push({'x':-3, 'y':0, 'xT':6, 'yT':1});
        }
        else {
            extend.push({'x':0, 'y':0, 'xT':9, 'yT':0});
            extend.push({'x':-1, 'y':0, 'xT':8, 'yT':0});
            extend.push({'x':-2, 'y':0, 'xT':7, 'yT':0});
            extend.push({'x':-3, 'y':0, 'xT':6, 'yT':0});
        }
        return extend;
    }},
    12:{'extend':function(courseObject) {
        var extend = courseObject.extend;
        extend.push({'x':0, 'y':0, 'xT':11, 'yT':1});
        extend.push({'x':-1, 'y':0, 'xT':10, 'yT':1});
        extend.push({'x':-1, 'y':1, 'xT':10, 'yT':0});
        extend.push({'x':0, 'y':1, 'xT':11, 'yT':0});
        return extend;
    }},
    13: {'extend': function(courseObject) {
        let subType = courseObject.subType,
            height = courseObject.height;
        var extend = [],
            tt = (subType) ? 
            {0: {'xT': 11, 'yT': 2}, 1: {'xT': 11, 'yT': 3}, 2: {'xT': 11, 'yT': 4}} :
            {0: {'xT': 12, 'yT': 0}, 1: {'xT': 12, 'yT': 1}, 2: {'xT': 12, 'yT': 2}};
        for(let h=0; h<height; h++) {
            let pos = (h==(height-2)) ? 1 : (h==(height-1)) ? 0 : 2;
            extend.push({'x': 0, 'y': h, 'xT': tt[pos]['xT'], 'yT': tt[pos]['yT']});
        }
        return extend;
    }},
    15:{'extend':function(courseObject) {
        var extend = courseObject.extend;
        extend.push({'x':0, 'y':0, 'xT':13, 'yT':0});
        return extend;
    }},
    18:{'xT':14, 'yT':0},
    19:{'xT':14, 'yT':1},
    20:{'xT':15, 'yT':6},

    55:{'extend':function(courseObject) {
        var extend = [];
        extend.push({'x':0, 'y':0, 'xT':11, 'yT':6});
        extend.push({'x':0, 'y':1, 'xT':11, 'yT':5});
        return extend;
    }},
};