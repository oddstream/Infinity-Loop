/*jshint esversion:6, unused:true, undef:true */

"use strict";

const DEBUGGING = 1;

const Q = 100;
const Q50 = Math.floor(Q/2);
const Q25 = Math.floor(Q/4);
const Q10 = Math.floor(Q/10);
const Q20 = Math.floor(Q/5);
const Q33 = Math.floor(Q/3);
const Q66 = Math.floor((Q/3)*2);
const Q75 = Math.floor((Q/4)*3);

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

const NORTH = 0b0001;
const EAST  = 0b0010;
const SOUTH = 0b0100;
const WEST  = 0b1000;

const PLACE_COIN_CHANCE = 0.5;
const JUMBLE_COIN_CHANCE = 0.8;

let STROKE_COLOR = 'darkblue';
const BACKGROUND_COLOR = 'lightblue';
const INPROGRESS_COLOR = 'darkblue';
const COMPLETED_COLOR = 'black';

function main()
{
//  let ele = document.querySelector('div.gridoftiles');
//  if ( ele )
//      ele.parentNode.removeChild(ele);
    
    STROKE_COLOR = INPROGRESS_COLOR;
    const got = new GridOfTiles(
        Math.max(Math.floor(window.innerWidth / Q), 5),
        Math.max(Math.floor(window.innerHeight / Q), 5)
    );
    got.createHTML().placeCoinsSymmetrically().jumbleCoins().setGraphics();
}

class SvgHelper 
{
    constructor()
    {
        this.fun = [
        this.empty,         // 0
        this.singleN,       // 1
        this.singleE,       // 2
        this.curveNE,       // 3
        this.singleS,       // 4
        this.lineNS,        // 5
        this.curveSE,       // 6
        this.triNES,        // 7
        this.singleW,       // 8
        this.curveNW,       // 9
        this.lineEW,        // 10
        this.triNEW,        // 11
        this.curveSW,       // 12
        this.triNSW,        // 13
        this.triEWS,        // 14
        this.four           // 15
        ];
    }

    static buildElement(eleName, attLst)
    {
        let ele = document.createElementNS(SVG_NAMESPACE, eleName);
        ele.setAttributeNS(null, 'stroke', STROKE_COLOR);
        ele.setAttributeNS(null, 'stroke-width', Q10);
        ele.setAttributeNS(null, 'fill', 'none');
        // attLst is like { r: 25, cx: 0, cy: 100 }
        Object.keys(attLst).forEach((key) => 
                ele.setAttributeNS(null, key, attLst[key])
            );
        return ele;
    }

/*    
	flower(g)
	{
		g.appendChild(SvgHelper.buildElement("ellipse", {cx:Q33, cy:Q33, rx:Q20, ry:Q10, transform:`rotate(45 ${Q33} ${Q33})`}));
		g.appendChild(SvgHelper.buildElement("ellipse", {cx:Q66, cy:Q66, rx:Q20, ry:Q10, transform:`rotate(45 ${Q66} ${Q66})`}));

		g.appendChild(SvgHelper.buildElement("ellipse", {cx:Q33, cy:Q66, rx:Q20, ry:Q10, transform:`rotate(-45 ${Q33} ${Q66})`}));
		g.appendChild(SvgHelper.buildElement("ellipse", {cx:Q66, cy:Q33, rx:Q20, ry:Q10, transform:`rotate(-45 ${Q66} ${Q33})`}));

		g.appendChild(SvgHelper.buildElement("ellipse", {cx:Q50, cy:Q25, rx:Q10, ry:Q20}));
		g.appendChild(SvgHelper.buildElement("ellipse", {cx:Q50, cy:Q75, rx:Q10, ry:Q20}));

		g.appendChild(SvgHelper.buildElement("ellipse", {cx:Q25, cy:Q50, rx:Q20, ry:Q10})); 
		g.appendChild(SvgHelper.buildElement("ellipse", {cx:Q75, cy:Q50, rx:Q20, ry:Q10}));

		g.appendChild(SvgHelper.buildElement("circle", {r:Q10, cx:Q50, cy:Q50}));
	}
*/	
    circle(g)
    {
        g.appendChild(SvgHelper.buildElement("circle", {r:Q25, cx:Q50, cy:Q50}));
    }
    
    empty(g)
    {
    }   
    singleN(g)
    {
        this.circle(g);
        g.appendChild(SvgHelper.buildElement("line", {x1:Q50, y1:0, x2:Q50, y2:Q25}));
    }
    singleE(g)
    {
        this.circle(g);
        g.appendChild(SvgHelper.buildElement("line", {x1:Q, y1:Q50, x2:Q75, y2:Q50}));
    }
    curveNE(g)
    {
        g.appendChild(SvgHelper.buildElement("path", {d: `M${Q50},0 A${Q50},${Q50} 0 0 0 ${Q},${Q50}`}));   // SweepFlag 0 = anticlockwise
    }
    singleS(g)
    {
        this.circle(g);
        g.appendChild(SvgHelper.buildElement("line", {x1:Q50, y1:Q, x2:Q50, y2:Q75}));
    }
    lineNS(g)
    {
        g.appendChild(SvgHelper.buildElement("line", {x1:Q50, y1:0, x2:Q50, y2:Q}));
    }
    curveSE(g)
    {
        g.appendChild(SvgHelper.buildElement("path", {d: `M${Q50},${Q} A${Q50},${Q50} 0 0 1 ${Q},${Q50}`}));    // SweepFlag 1 = clockwise
    }
    triNES(g)
    {
        this.curveNE(g);
        this.curveSE(g);
    }
    singleW(g)
    {
        this.circle(g);
        g.appendChild(SvgHelper.buildElement("line", {x1:0, y1:Q50, x2:Q25, y2:Q50}));
    }
    curveNW(g)
    {
        g.appendChild(SvgHelper.buildElement("path", {d: `M${Q50},0 A${Q50},${Q50} 0 0 1 0,${Q50}`}));  // SweepFlag 1 = clockwise
    }
    lineEW(g)
    {
        g.appendChild(SvgHelper.buildElement("line", {x1:0, y1:Q50, x2:Q, y2:Q50}));
    }
    triNEW(g)
    {
        this.curveNE(g);
        this.curveNW(g);
    }
    curveSW(g)
    {
        g.appendChild(SvgHelper.buildElement("path", {d: `M${Q50},${Q} A${Q50},${Q50} 0 0 0 0,${Q50}`}));   // SweepFlag 0 = anticlockwise
    }
    triNSW(g)
    {
        this.curveNW(g);
        this.curveSW(g);
    }
    triEWS(g)
    {
        this.curveSW(g);
        this.curveSE(g);
    }
    four(g)
    {
        this.curveNE(g);
        this.curveSE(g);
        this.curveSW(g);
        this.curveNW(g);
    }
}

function Tile()
{
    this.n = null;
    this.e = null;
    this.w = null;
    this.s = null;

    this.news = 0;

    this.div = null;
    
    this.hlp = new SvgHelper();
}
{
    Tile.prototype.spinSVG = function(g)
    {
//      let t1 = window.performance.now();

//      var handleOnend = function() {
//          let t2 = window.performance.now(); 
//          console.log(t2-t1);
//      };
        
//      g.addEventListener('onend', handleOnend);
        
        let angle = 15;
        
        const tilt = function() {
            g.setAttributeNS(null, 'transform', `rotate(${angle} ${Q50},${Q50})`);
            angle += 15;
            if ( angle < 90 )
                window.requestAnimationFrame(tilt);
        };
        window.requestAnimationFrame(tilt);
    };
    
    Tile.prototype.unspinSVG = function(g)
    {
        let angle = 15;
        
        const tilt = function() {
            g.setAttributeNS(null, 'transform', `rotate(-${angle} ${Q50},${Q50})`);
            angle += 15;
            if ( angle < 90 )
                window.requestAnimationFrame(tilt);
        };
        window.requestAnimationFrame(tilt);
    };

    Tile.prototype.shiftBits = function()
    {
        if ( this.news & 0b1000 )
            this.news = ((this.news << 1) & 0b1111) | 0b0001;
        else
            this.news = (this.news << 1) & 0b1111;
    };

    Tile.prototype.unshiftBits = function()
    {
        if ( this.news & 0b0001 )
            this.news = (this.news >> 1) | 0b1000;
        else
            this.news = this.news >> 1;
    };
    
    Tile.prototype.rotate = function()
    {
        if ( this.news === 0  )
            return;
        let g = this.div.querySelector("g");
        if ( g )
        {
            this.spinSVG.bind(this)(g);
            this.shiftBits();
        }
    };

    Tile.prototype.unrotate = function()
    {
        if ( this.news === 0  )
            return;
        let g = this.div.querySelector("g");
        if ( g )
        {
            this.unspinSVG.bind(this)(g);
            this.unshiftBits();
        }
    };

    Tile.prototype.isTileComplete = function()
    {
        let complete = true;
        if (this.news & NORTH) {
            if ((this.n === null) || !(this.n.news & SOUTH)) {
                complete = false;
            }
        }
        if (this.news & EAST) {
            if ((this.e === null) || !(this.e.news & WEST)) {
                complete = false;
            }
        }
        if (this.news & WEST) {
            if ((this.w === null) || !(this.w.news & EAST)) {
                complete = false;
            }
        }
        if (this.news & SOUTH) {
            if ((this.s === null) || !(this.s.news & NORTH)) {
                complete = false;
            }
        }
        return complete;
    };

    Tile.prototype.getRoot = function()
    {
        let t = this;
        while ( t.w ) t = t.w;
        while ( t.n ) t = t.n;
        return t;
    };

    Tile.prototype.createIterator = function*()
    {
        for ( let y=this.getRoot(); y; y=y.s )
        {
            for ( let x=y; x; x=x.e )
            {
                yield x;
            }
        }
    };

    Tile.prototype.isGridComplete = function()
    {
        const it = this.createIterator();
        for ( const t of it )
            if ( !t.isTileComplete() )
                return false;
        return true;
    };
    
    Tile.prototype.placeCoin = function()
    {
        if ( this.e )
        {
            if ( Math.random() > PLACE_COIN_CHANCE )
            {
                this.news = this.news | EAST;
                this.e.news = this.e.news | WEST;
            }
        }
        if ( this.s )
        {
            if ( Math.random() > PLACE_COIN_CHANCE )
            {
                this.news = this.news | SOUTH;
                this.s.news = this.s.news | NORTH;
            }
        }
    };

    Tile.prototype.jumbleCoin = function()
    {
        if ( DEBUGGING )
        {
            if ( Math.random() > 0.95 )
                this.unshiftBits();
        }
        else
        {
            if ( Math.random() > JUMBLE_COIN_CHANCE )
            {
                this.unshiftBits();
            }
            else if ( Math.random() > JUMBLE_COIN_CHANCE )
            {
                this.shiftBits();
            }
        }
    };
    
    // Tile implements the handleEvent interface
    Tile.prototype.handleEvent = function(event)
    {
        if ( event.type != "click" )
            return;
        
        if ( STROKE_COLOR == COMPLETED_COLOR )
            return;
        
        if ( event.altKey || event.shiftKey || event.ctrlKey )
            this.unrotate();
        else
            this.rotate();
        
        // wait a bit to allow animation to complete then set new SVG
        window.setTimeout(this.setGraphic.bind(this), 50);

        if ( this.isGridComplete() )
        {
            const it = this.createIterator();
            STROKE_COLOR = COMPLETED_COLOR;
            window.setTimeout( () => {
                for ( const t of it )
                    t.setGraphic();
            }, 0);
        }
    };
    
    Tile.prototype.setGraphic = function()
    {
        if ( 0 === this.news )
            return;
        
        let svg = document.createElementNS(SVG_NAMESPACE, 'svg');
        svg.setAttributeNS(null, 'width', Q);
        svg.setAttributeNS(null, 'height', Q);
        svg.addEventListener("click", this, false);
        
        let g = document.createElementNS(SVG_NAMESPACE, 'g');
        svg.appendChild(g);
        
        // Without .bind(), calls the function with this == Array(16) because
        // in a function call, ‘this’ is a reference to the object which made that call
        this.hlp.fun[this.news].bind(this.hlp)(g);
        
        while ( this.div.lastChild )
            this.div.removeChild(this.div.lastChild);
        this.div.appendChild(svg);
    };
}

function GridOfTiles(numX=7, numY=5)
{
    this.numX = numX;
    this.numY = numY;
    this.grid = this.createFirstRow(numX, null);
    let row = numY;

    for ( let nextRow=this.grid; row>1; row--, nextRow=nextRow.s )
    {
        let tPrev = null;
        for ( let t = nextRow; t; t = t.e)
        {
            t.s = new Tile();
            t.s.n = t;

            t.s.w = tPrev;
            if ( tPrev )
            {
                tPrev.e = t.s;
            }

            tPrev = t.s;
        }
    }
}
{
    GridOfTiles.prototype.createFirstRow = function(n, leftTile)
    {
        let t = new Tile();
        t.w = leftTile;
        if ( n > 1 )
        {
            t.e = this.createFirstRow(n-1, t);
        }
        return t;
    };

    GridOfTiles.prototype.placeCoins = function()
    {
        const it = this.createIterator();
        for ( const t of it )
            t.placeCoin();
        
        return this;
    };
    
    GridOfTiles.prototype.placeCoinsSymmetrically = function()
    {
        const xHalf = Math.floor(this.numX / 2);
        const yHalf = Math.floor(this.numY / 2);
        
        let y1 = this.grid; while ( y1.s ) y1 = y1.s;
        for ( let yCount=0, y=this.grid; yCount < yHalf; yCount++, y=y.s )
        {
            let x1 = y; while ( x1.e ) x1 = x1.e;
            for ( let xCount=0, x=y; xCount < xHalf; xCount++, x=x.e )
            {
                // place the top left coin
                x.placeCoin();
                
                // mirror the coin to the top right
                if ( x.news & EAST )
                {
                    x1.news |= WEST;
                    x1.w.news |= EAST;
                }
                if ( x.news & SOUTH )
                {
                    x1.news |= SOUTH;
                    x1.s.news |= NORTH;
                }
                x1 = x1.w;
            }
            
            y1 = y1.n;
        }

        // now a second pass, mirroring top to bottom
        
        let x1 = this.grid; while ( x1.e ) x1 = x1.e;
        for ( let x=this.grid; x; x=x.e )   // go all the way across
        {
            let y1 = x; while ( y1.s ) y1 = y1.s;
            for ( let yCount=0, y=x; yCount < yHalf; yCount++, y=y.s )
            {
                if ( y.news & EAST )
                {
                    y1.news |= EAST;
                    y1.e.news |= WEST;
                }
                if ( y.news & SOUTH )
                {
                    y1.news |= NORTH;
                    y1.n.news |= SOUTH;
                }
                y1 = y1.n;
            }
            
            x1 = x1.w;
        }

        return this;
    };

    GridOfTiles.prototype.jumbleCoins = function()
    {
        const it = this.createIterator();
        for ( const t of it )
            t.jumbleCoin();
        
        return this;
    };

    GridOfTiles.prototype.createHTML = function()
    {
        // create a grid container; all direct children will become grid items
        const eleWrapper = document.createElement("div");
//      eleWrapper.className = "gridoftiles";
        // set attributes; "grid-gap" becomes camelCase "gridGrap"
        eleWrapper.style.display = "grid";
        eleWrapper.style.gridGap = "0px 0px";   // auto-sets .gridRowGap and .gridColumnGap
        eleWrapper.style.gridTemplateRows = `${Q}px `.repeat(this.numY);        // can't use SVG repeat(5,100px)
        eleWrapper.style.gridTemplateColumns = `${Q}px `.repeat(this.numX);     // can't use SVG repeat(7,100px)
        eleWrapper.style.backgroundColor = BACKGROUND_COLOR;
        eleWrapper.style.border = `${Q10}px solid ${STROKE_COLOR}`;
        eleWrapper.style.width = `${Q * this.numX}px`;
        eleWrapper.style.height = `${Q * this.numY}px`;
        
        const it = this.createIterator();
        for ( const t of it )
        {
            // n.b. the iterator must generate the rows across for the HTML grid to work
            t.div = document.createElement("div");
            eleWrapper.appendChild(t.div);
        }

        document.body.appendChild(eleWrapper);
        
        return this;
    };

    GridOfTiles.prototype.setGraphics = function()
    {
        const it = this.createIterator();
        for ( const t of it )
            t.setGraphic();
        
        return this;
    };
    
    GridOfTiles.prototype.createIterator = function*()
    {
        // loop y outside x to generate grid elements in correct order
        for ( let y=this.grid; y; y=y.s )
        {
            for ( let x=y; x; x=x.e )
            {
                yield x;
            }
        }
    };
}

main();
