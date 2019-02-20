 /**
 * @module BlockDraw
 * This class draw the blocks by titleset.
 * 
 * @author Leonardo Mauro <leo.mauro.desenv@gmail.com> (http://leonardomauro.com/)
 * @link https://github.com/leomaurodesenv/smm-course-viewer GitHub
 * @license https://opensource.org/licenses/GPL-3.0 GNU Public License (GPLv3)
 * @copyright 2019 Leonardo Mauro
 * @package smm-course-viewer
 * @access public
 */
class BlockDraw {

    /**
     * @method module:BlockDraw
     * Constructor of class
     * @arg {String} _gameMode      Game mode
     * @arg {String} _gameTheme     Game theme
     * @instance
     * @access public
     * @return {this}
     */
    constructor(_gameMode, _gameTheme) {
        /* theme definitions */
        this._themeLimit = {
            'length': {'x': 16, 'y': 16}, // blocks counting
            'size': {'M1': 16, 'M3': 16, 'MW': 16, 'WU': 64} }; // pixels
        this._themeSize = this._themeLimit['size'][_gameMode];
        this._theme = new Image(this._themeSize * this._themeLimit.length.x, 
                                this._themeSize * this._themeLimit.length.y);
        this._theme.src = './layout/draw/titleset/'+_gameMode+'-'+_gameTheme+'.png';
    }

    /**
     * @method module:BlockDraw::getTheme
     * Return the theme image
     * @access public
     * @return {html}
     */
    getTheme() {
        return this._theme;
    };

    /**
     * @method module:BlockDraw::getThemeSize
     * Return the theme size
     * @access public
     * @return {Integer}
     */
    getThemeSize () {
        return this._themeSize;
    }

    /**
     * @method module:BlockDraw::getDef
     * Return the block definitions
     * @access public
     * @return {Dictionay}
     */
    getDef(_type) {
        return BlockDraw._defitions[_type];
    }

    /**
     * @method module:BlockDraw::getDef
     * Check if this type has a draw
     * @access public
     * @return {Dictionay}
     */
    hasDraw(_type) {
        return (this.getDef(_type)) ? true : false;
    }
}

/**
 * Block Draw Definitions
 * @access private
 */
BlockDraw._defitions = {
    4: {'xT': 1, 'yT': 0},
    5: {'xT': 2, 'yT': 0},
    6: {'xT': 6, 'yT': 0},
    7: {'xT': 8, 'yT': 11, 'extend': function(courseObject) {
        let xT = 8; let yT = 11;
        let xMax = 15;
        for(var i = 0; i < courseObject.extendedData; i++) {
            if(xT == xMax) {xT = 0; yT++;}
            else xT++;
        }
        extend = [{'x': 0, 'y': 0, 'xT': xT, 'yT': yT}];
        /* {1} - ghost: lamp */
        if(courseObject.childType == 1) {
            extend.push({'x': 0, 'y': 2, 'xT': 1, 'yT': 1});
            extend.push({'x': 0, 'y': 1, 'xT': 2, 'yT': 1});
        }
        /* {2} - ghost: clock */
        else if(courseObject.childType == 2) {
            extend.push({'x': 0, 'y': 3, 'xT': 3, 'yT': 1});
            extend.push({'x': 0, 'y': 2, 'xT': 4, 'yT': 1});
            extend.push({'x': 0, 'y': 1, 'xT': 5, 'yT': 1});
        }
        /* {3} - ghost: handrail */
        else if(courseObject.childType == 3) { 
            extend.push({'x': 0, 'y': 1, 'xT': 13, 'yT': 8});
            extend.push({'x': 1, 'y': 1, 'xT': 14, 'yT': 8});
            extend.push({'x': 2, 'y': 1, 'xT': 15, 'yT': 8});
        }
        /* {!0} - ghost: flower */
        else if(courseObject.childType == 4) { 
            extend.push({'x': 0, 'y': 1, 'xT': 0, 'yT': 1});
        }
        return extend;
    }},
}

/*
const blockTheme = {
    
    
    
    7: {'x': 8, 'y': 11, 'extend': function(courseObject) {
        let xT = 8; let yT = 11;
        let xMax = limitTheme['xTount']-1;
        for(var i = 0; i < courseObject.extendedData; i++) {
            if(xT == xMax) {xT = 0; yT++;}
            else xT++;
        }
        extend = [{'x': 0, 'y': 0, 'xT': xT, 'yT': yT}];
        if(courseObject.childType == 1) { /* {1} - ghost: lamp *
            extend.push({'x': 0, 'y': 2, 'xT': 1, 'yT': 1});
            extend.push({'x': 0, 'y': 1, 'xT': 2, 'yT': 1});
        }
        else if(courseObject.childType == 2) { /* {2} - ghost: clock *
            extend.push({'x': 0, 'y': 3, 'xT': 3, 'yT': 1});
            extend.push({'x': 0, 'y': 2, 'xT': 4, 'yT': 1});
            extend.push({'x': 0, 'y': 1, 'xT': 5, 'yT': 1});
        }
        else if(courseObject.childType == 3) { /* {3} - ghost: handrail *
            extend.push({'x': 0, 'y': 1, 'xT': 13, 'yT': 8});
            extend.push({'x': 1, 'y': 1, 'xT': 14, 'yT': 8});
            extend.push({'x': 2, 'y': 1, 'xT': 15, 'yT': 8});
        }
        else if(courseObject.childType == 4) { /* {!0} - ghost: flower *
            extend.push({'x': 0, 'y': 1, 'xT': 0, 'yT': 1});
        }
        return extend;

    }}, /* define function to get direction of Terrain *
    8: {'x': 7, 'y': 0, 'func': function(courseObject) {
        let flags = courseObject.flags;
        if(flags & 4 == 4) return {'x':0, 'y':16}; /* red coin *
        else return {'x':7, 'y':0};
    }}, /* normal coin or red coin *
    9: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;
        let height = courseObject.height;
        let direction = (courseObject.flags & 0x60) / 0x20;
        /* {0} right, {1} left, {2} top, {3} bottom *

        if(direction==0) { /* to right *
            var tt = {
                0: {'xT': 12, 'yT': 1}, 1: {'xT': 12, 'yT': 1}, 2: {'xT': 13, 'yT': 1},
                9: {'xT': 12, 'yT': 0}, 10: {'xT': 12, 'yT': 0}, 11: {'xT': 13, 'yT': 0},
            };
            return extend3x4objects(0, -1, height, 2, tt);
        }
        else if(direction==1) { /* to left *
            var tt = {
                0: {'xT': 11, 'yT': 1}, 1: {'xT': 12, 'yT': 1}, 2: {'xT': 12, 'yT': 1},
                9: {'xT': 11, 'yT': 0}, 10: {'xT': 12, 'yT': 0}, 11: {'xT': 12, 'yT': 0},
            };
            return extend3x4objects(-(height-1), 0, height, 2, tt);
        }
        else if(direction==2) { /* to top *
            var tt = {
                0: {'xT': 14, 'yT': 1}, 2: {'xT': 15, 'yT': 1},
                3: {'xT': 14, 'yT': 1}, 5: {'xT': 15, 'yT': 1},
                6: {'xT': 14, 'yT': 1}, 8: {'xT': 15, 'yT': 1},
                9: {'xT': 14, 'yT': 0}, 11: {'xT': 15, 'yT': 0},
            };
            return extend3x4objects(0, 0, 2, height, tt);
        }
        else { /* to bottom *
            var tt = {
                0: {'xT': 14, 'yT': 2}, 2: {'xT': 15, 'yT': 2},
                3: {'xT': 14, 'yT': 1}, 5: {'xT': 15, 'yT': 1},
                6: {'xT': 14, 'yT': 1}, 8: {'xT': 15, 'yT': 1},
                9: {'xT': 14, 'yT': 1}, 11: {'xT': 15, 'yT': 1},
            };
            return extend3x4objects(-1, -(height-1), 2, height, tt);
        }
        return [];

    }},
    14: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;
        let height = courseObject.height;
        let color = (courseObject.flags >> 18) & 3;
        /* {0} red , {1} yellow , {2} green *

        /* mushroom head *
        var tt = {
            9: {'xT': 3, 'yT': 2}, 10: {'xT': 4, 'yT': 2}, 11: {'xT': 5, 'yT': 2},
        };
        if(color == 1) {/* color {1} *
            tt[9]= {'xT': 3, 'yT': 3};
            tt[10] = {'xT': 4, 'yT': 3};
            tt[11] = {'xT': 5, 'yT': 3};
        }
        else if(color == 2) {/* color {2} *
            tt[9]= {'xT': 3, 'yT': 4};
            tt[10] = {'xT': 4, 'yT': 4};
            tt[11] = {'xT': 5, 'yT': 4};
        }
        var extend = extend3x4objects(0, (height-1), width, 1, tt);

        /* mushroom body *
        if(width%2 == 0) {
            for(var h=0; h<(height-1); h++) {
                let w = ((width)/2 -1);
                if(h == 0) {
                    extend.push({'x': w, 'y': h, 'xT': 6, 'yT': 2});
                    extend.push({'x': w+1, 'y': h, 'xT': 7, 'yT': 2});
                }
                else {
                    extend.push({'x': w, 'y': h, 'xT': 6, 'yT': 1});
                    extend.push({'x': w+1, 'y': h, 'xT': 7, 'yT': 1});
                }
            }
        }
        else {
            for(var h=0; h<(height-1); h++) {
                let w = (width-1)/2;
                if(h == 0) extend.push({'x': w, 'y': h, 'xT': 6, 'yT': 4});
                else extend.push({'x': w, 'y': h, 'xT': 6, 'yT': 3});
            }
        }

        return extend;

    }},
    16: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;
        let height = courseObject.height;
        let type = ((courseObject.flags >> 18) & 0x3);
        /* {0}: block 1, {1}: block 2, {2}: block 3 *

        var tts = {
            0: {
                0: {'xT': 7, 'yT': 6}, 1: {'xT': 8, 'yT': 6}, 2: {'xT': 9, 'yT': 6},
                3: {'xT': 7, 'yT': 5}, 4: {'xT': 8, 'yT': 5}, 5: {'xT': 9, 'yT': 5},
                6: {'xT': 7, 'yT': 4}, 7: {'xT': 8, 'yT': 4}, 8: {'xT': 9, 'yT': 4},
                9: {'xT': 7, 'yT': 3}, 10: {'xT': 8, 'yT': 3}, 11: {'xT': 9, 'yT': 3},
            },
            1: {
                0: {'xT': 10, 'yT': 6}, 1: {'xT': 11, 'yT': 6}, 2: {'xT': 12, 'yT': 6},
                3: {'xT': 10, 'yT': 5}, 4: {'xT': 11, 'yT': 5}, 5: {'xT': 12, 'yT': 5},
                6: {'xT': 10, 'yT': 4}, 7: {'xT': 11, 'yT': 4}, 8: {'xT': 12, 'yT': 4},
                9: {'xT': 10, 'yT': 3}, 10: {'xT': 11, 'yT': 3}, 11: {'xT': 12, 'yT': 3},
            },
            2: {
                0: {'xT': 13, 'yT': 6}, 1: {'xT': 14, 'yT': 6}, 2: {'xT': 15, 'yT': 6},
                3: {'xT': 13, 'yT': 5}, 4: {'xT': 14, 'yT': 5}, 5: {'xT': 15, 'yT': 5},
                6: {'xT': 13, 'yT': 4}, 7: {'xT': 14, 'yT': 4}, 8: {'xT': 15, 'yT': 4},
                9: {'xT': 13, 'yT': 3}, 10: {'xT': 14, 'yT': 3}, 11: {'xT': 15, 'yT': 3},
            },
        };
        return extend3x4objects(0, 0, width, height, tts[type]);

    }},
    17: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;

        var tt = {
            0: {'xT': 0, 'yT': 3}, 1: {'xT': 1, 'yT': 3}, 2: {'xT': 2, 'yT': 3},
            9: {'xT': 0, 'yT': 2}, 10: {'xT': 1, 'yT': 2}, 11: {'xT': 2, 'yT': 2},
        };
        return extend3x4objects(0, 0, width, 2, tt);

    }},
    21: {'x': 0, 'y': 4},
    22: {'x': 6, 'y': 6},
    23: {'x': 0, 'y': 0, 'func': function(courseObject) {
        /* type: {0} jump, {1} high jump *
        let type = (courseObject.flags >> 2) & 1;
        if(type == 1) return {'x':6, 'y':5}; 
        else return {'x':4, 'y':0};

    }},
    26: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width - 3;
        let height = courseObject.height;
        var tt = {
            0: {'xT': 11, 'yT': 8}, 1: {'xT': 12, 'yT': 8}, 2: {'xT': 12, 'yT': 8},
            3: {'xT': 11, 'yT': 8}, 4: {'xT': 12, 'yT': 8}, 5: {'xT': 12, 'yT': 8},
            6: {'xT': 11, 'yT': 8}, 7: {'xT': 12, 'yT': 8}, 8: {'xT': 12, 'yT': 8},
            9: {'xT': 11, 'yT': 7}, 10: {'xT': 12, 'yT': 7}, 11: {'xT': 12, 'yT': 7},
        };
        return extend3x4objects(0, 0, width, height, tt);
    }},
    29: {'x': 3, 'y': 0},
    37: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width - 3;
        let height = courseObject.height;
        var tt = {
            0: {'xT': 9, 'yT': 8}, 1: {'xT': 9, 'yT': 8}, 2: {'xT': 10, 'yT': 8},
            3: {'xT': 9, 'yT': 8}, 4: {'xT': 9, 'yT': 8}, 5: {'xT': 10, 'yT': 8},
            6: {'xT': 9, 'yT': 8}, 7: {'xT': 9, 'yT': 8}, 8: {'xT': 10, 'yT': 8},
            9: {'xT': 9, 'yT': 7}, 10: {'xT': 9, 'yT': 7}, 11: {'xT': 10, 'yT': 7},
        };
        return extend3x4objects(0, 0, width, height, tt);
    }},
    53: {'x': 0, 'y': 0, 'extend': function(courseObject) {
        let width = courseObject.width;
        var tt = {
            0: {'xT': 8, 'yT': 0}, 1: {'xT': 9, 'yT': 0}, 2: {'xT': 10, 'yT': 0},
            9: {'xT': 8, 'yT': 0}, 10: {'xT': 9, 'yT': 0}, 11: {'xT': 10, 'yT': 0},
        };
        return extend3x4objects(0, 0, width, 1, tt);
    }},
    63: {'x': 8, 'y': 7},
};*/