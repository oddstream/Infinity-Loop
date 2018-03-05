'use strict';

class Util
{
    /**
     * Calculate the number of bits set in the coins for this cell
     * @param {Number} coins to examine
     * @returns {Number} number of bits
     */
    static hammingWeight(coins)
    {
        /*
        return this.coins.toString(2).split('1').length-1;
        return this.coins.toString(2).match(/1/g).length;
        https://stackoverflow.com/questions/109023/how-to-count-the-number-of-set-bits-in-a-32-bit-integer
        */
        let v = coins;
        v = v - ((v >> 1) & 0x55555555);                // put count of each 2 bits into those 2 bits
        v = (v & 0x33333333) + ((v >> 2) & 0x33333333); // put count of each 4 bits into those 4 bits
        return ((v + (v >> 4) & 0xF0F0F0F) * 0x1010101) >> 24;
    }
    
    /**
     * Test if a point is in a circle
     * @param {Number} x coord of point to test
     * @param {Number} y
     * @param {Number} cx coord of circle centre
     * @param {Number} cy
     * @param {Number} radius of circle
     * @returns {Boolean}
     */
    static pointInCircle(x, y, cx, cy, radius)
    {
        const distanceSquared = (x - cx) * (x - cx) + (y - cy) * (y - cy);
        return distanceSquared <= radius * radius;
    }

    /**
     * Test if a point is within a triangle
     * @param {Number} px coord of point to test 
     * @param {Number} py 
     * @param {Number} ax coord of triangle corner 
     * @param {Number} ay 
     * @param {Number} bx coord of triangle corner 
     * @param {Number} by 
     * @param {Number} cx coord of triangle corner 
     * @param {Number} cy
     * @returns {Boolean}
     * @see {@link http://www.blackpawn.com/texts/pointinpoly/default.html}
     * @see {@link https://koozdra.wordpress.com/2012/06/27/javascript-is-point-in-triangle/}
     */
    static pointInTriangle(px,py,ax,ay,bx,by,cx,cy)
    {

        const v0 = [cx-ax,cy-ay];
        const v1 = [bx-ax,by-ay];
        const v2 = [px-ax,py-ay];

        const dot00 = (v0[0]*v0[0]) + (v0[1]*v0[1]);
        const dot01 = (v0[0]*v1[0]) + (v0[1]*v1[1]);
        const dot02 = (v0[0]*v2[0]) + (v0[1]*v2[1]);
        const dot11 = (v1[0]*v1[0]) + (v1[1]*v1[1]);
        const dot12 = (v1[0]*v2[0]) + (v1[1]*v2[1]);

        const invDenom = 1/ (dot00 * dot11 - dot01 * dot01);

        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

        return ((u >= 0) && (v >= 0) && (u + v < 1));
    }
    
    /**
     * bsd16 for arrays, each value must be numeric and will be bound to 8-bits (Int8Array or Uint8Array works best!)
     * @param   {Array}  a input (8-bit array)
     * @param   {Number} p previous checksum state
     * @returns {Number} new checksum state
     */
    static BSD16(a, p)
    {
        let c = p || 0, i = 0, l = a.length;
        for(; i < l; i++) c = (((((c >>> 1) + ((c & 1) << 15)) | 0) + (a[i] & 0xff)) & 0xffff) | 0;
        return c;
    }

    /**
     * turn stuff in the url into an object containing name,value items
     * @returns {Object} 
    */
    static getCommandLine()
    {
        var urlParams = {},
        match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = (s) => decodeURIComponent(s.replace(pl, ' ')),
        query  = window.location.search.substring(1);

        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);

        return urlParams;
    }

    static saveLoop(jsonObj)
    {
        fetch('http://localhost:3000/loops', {
            body: JSON.stringify(jsonObj),
            headers: {'Content-Type':'application/json'},
            method: 'POST'
            // mode:'no-cors' didn't work
        })
        .then(data => console.log('Saved',data))
        .catch(error => console.error('Error saving',error));
        // 201 CREATED The request has been fulfilled and has resulted in one or more new resources being created.            
    }
}

class GameState
{
    constructor()
    {   // this == GameState
        this._gridsSolved = this._getLocalStorageInt('gridsSolved', 0);
        this._jumbleCoinChance = this._gridsSolved / 200;
        this._jumbleCoinChance = Math.min(this._jumbleCoinChance, 0.5);
        this._jumbleCoinChance = Math.max(this._jumbleCoinChance, 0.05);
    }

    gridSolved()
    {
        this._gridsSolved += 1;
        try
        {
            window.localStorage.setItem('gridsSolved', this._gridsSolved.toString());
        }
        catch (err)
        {
            console.log('window.localStorage not available');
        }
    }

    _getLocalStorageInt(key, defaultValue)
    {   // this == GameState
        let val = '';
        try
        {
            val = window.localStorage.getItem(key);
        }
        catch (err)
        {
            console.log('window.localStorage not available');
        }
        const num = parseInt(val);  // parseInt(null) returns NaN
        if ( isNaN(num) )
            return defaultValue;
        if ( num < 0 )
            return defaultValue;
        return num;
    }
    
    get level()
    {
        return (this._gridsSolved+1).toString();
    }

    get jumbleCoinChance()
    {
        return this._jumbleCoinChance;
    }
}
