const top=0,parent=c=>(c+1>>>1)-1,left=c=>(c<<1)+1,right=c=>c+1<<1;
const cubeDirections = [
    { x:  1, z: -1, y:  0 },
    { x:  1, z:  0, y: -1 },
    { x:  0, z:  1, y: -1 },
    { x: -1, z:  1, y:  0 },
    { x: -1, z:  0, y: -1 },
    { x:  0, z: -1, y:  1 }
];
const gridDirections = [
    {x:  1, y:  0},
    {x:  0, y:  1},
    {x: -1, y:  0},
    {x:  0, y: -1}
];


class PriorityQueue{constructor(c=(d,e)=>d>e){this._heap=[],this._comparator=c}size(){return this._heap.length}isEmpty(){return 0==this.size()}peek(){return this._heap[top]}push(...c){return c.forEach(d=>{this._heap.push(d),this._siftUp()}),this.size()}pop(){const c=this.peek(),d=this.size()-1;return d>top&&this._swap(top,d),this._heap.pop(),this._siftDown(),c}replace(c){const d=this.peek();return this._heap[top]=c,this._siftDown(),d}_greater(c,d){return this._comparator(this._heap[c],this._heap[d])}_swap(c,d){[this._heap[c],this._heap[d]]=[this._heap[d],this._heap[c]]}_siftUp(){for(let c=this.size()-1;c>top&&this._greater(c,parent(c));)this._swap(c,parent(c)),c=parent(c)}_siftDown(){for(let d,c=top;left(c)<this.size()&&this._greater(left(c),c)||right(c)<this.size()&&this._greater(right(c),c);)d=right(c)<this.size()&&this._greater(right(c),left(c))?right(c):left(c),this._swap(c,d),c=d}}window.PriorityQueue=PriorityQueue


class GridMap  {
    

    constructor( canvas, width, height, size, tiles, colors = [],  blocked = [], costmap = {} ) {
        this._canvas = canvas;
        this._ctx = canvas.getContext('2d');
        this._drawHome = { x: 0, y: 0 };
        this._width = width;
        this._height = height;
        this._size = size;
        this._tiles = tiles;
        this._hover = null;
        this._origin = null;
        this._colors = colors;

        let blockedTiles = [];
        tiles.forEach( ( t, i ) => {
            if ( blocked.includes( t ) ) {
                blockedTiles.push( i )
            }
        });
        this._blockedTiles = blockedTiles;
        this._costmap = costmap;
        if ( Object.keys(costmap).length == 0 ) {
            this._tiles.forEach( t => this._costmap[ t ] = 1 );
        }
        this._path = this._cameFromMap();
        this._pathToOrigin = [];

        
    }

    get tiles()  { return this._tiles; }
    get width()  { return this._width; }
    get height() { return this._height; }
    get origin() { return this._origin; }
    get size()   { return this._size; }
    get hover()  { return this._hover; }
    get path()   { return this._path; }

    setHover( coords ) {
        this._hover = this._getTileFromMouseCoOrds( coords );
    };

    toggleOrigin( coords, costmap = this._costmap ) {
        let tilecoords = this._getTileFromMouseCoOrds( coords );
        let tile = this._tileno( tilecoords );

        if ( tilecoords != null ) {
            if ( tile == this.origin ) {
                this._origin = null;
            } else {
                this._origin = tile;
            }
            this._path = this._cameFromMap( costmap );
        }
    };

    render() {
        let ctx = this._ctx;
        ctx.clearRect( 0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight );

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle' 
            
        this._tiles.forEach( ( tile, i ) => this._drawcell( ctx, tile, i ) );

            
        if ( this._hover != null ) {
            ctx.strokeStyle = 'red';
            ctx.beginPath();
            ctx.rect( this._hover.q * this._size, this._hover.r * this._size, this._size, this._size );
            ctx.stroke();
        }
    }
    
    _directions() {
        return gridDirections;
    }
    _getPathDistance( tile, origin = this._origin, costmap = this._costmap ) {
        let path = this._getPath( tile, origin );
        if ( path ) return path.reduce( ( total, tile ) => total += costmap[ this.tiles[ tile ] ], 0 );
    }

    _drawcell( ctx, tile, i ) {
        let x = i % this._width;
        let y = Math.floor( i / this._width );

        ctx.fillStyle = this._colors[ tile ];
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect( this._size * x, this._size * y, this._size, this._size );
        ctx.fill();
        if ( i == this._origin ) {
            ctx.fillStyle = '#ffffff88';
            ctx.fill();
        }
        ctx.stroke();

        if ( this._origin != null ) {
            let distance = this._getPathDistance( i );
            ctx.lineWidth = 1;
            if ( distance != null ) {
                ctx.beginPath();
                ctx.strokeStyle = '#222222';
                ctx.strokeText( distance, this._size * ( x + 0.5 ), this._size * ( y + 0.5 ) );  
            }
        }
    }

    _getTileFromMouseCoOrds( coords ) {
        let q = Math.floor( coords.x / this._size );
        let r = Math.floor( coords.y / this._size );
        if ( this._inBounds( { q, r } ) ) return { q, r }
    }
    _getAxialFromTileNo( tile ) {
        let q = tile % this._width;
        let r = Math.floor( tile / this._width );
        return { q, r };
    }
    _tileno( axial ) {
        return axial == null ? null : ( axial.q + axial.r * this.width );
    }
    _isBlocked( tile ) {
        return this._blockedTiles.includes( tile );
    };
    _inBounds( axial ) {
        return axial.q >= 0 && axial.q < this._width && axial.r >= 0 && axial.r < this._height;
    }
    _neighbours( tileno ) {
        let n = [];
        let axial = this._getAxialFromTileNo( tileno );

        this._directions().forEach( dir => {
            let q = axial.q + dir.x;
            let r = axial.r + dir.y;
            if ( this._inBounds( { q, r } ) && !this._isBlocked( this._tileno( { q, r } ) ) ) {
                n.push( this._tileno( { q, r } ));
            }
        });

        return n;
    }
    _cameFromMap( costmap = this._costmap ) {
        // Dijkstra's Alogorithm ( Uniform COst Search )
        let frontier = new PriorityQueue( ( a, b ) => a[1] < b[1] );
        frontier.push( [ this._origin, 0 ] );
        let came_from = {};
        let cost_so_far = {};
        came_from[ this._origin ] = null;
        cost_so_far[ this._origin ] = 0;

        while ( frontier.size() > 0 ) {
            let current = frontier.pop()[0];
            console.log( current , this._neighbours( current ) );
            this._neighbours( current ).forEach( next => {
                
                let new_cost = cost_so_far[ current ] + costmap[ this._tiles[ next ] ];  
                if (typeof cost_so_far[ next ] == 'undefined' || new_cost < cost_so_far[ next ]) {
                    cost_so_far[ next ] = new_cost;
                    let priority = new_cost;
                    frontier.push( [ next, priority ] );
                    came_from[ next ] = current;
                }
            });
        
        }
        return came_from;
    }
    _getPath ( tile, origin ) {
        let current = tile;
        let path = [];
        if (typeof this._path[ current ] == 'undefined' ) {
            return null;
        } else {
            while (current != origin) {
                path.push( current );
                current = this.path[ current ];
            }
        }
        return path;
    }
}

class HexMap extends GridMap {
    
    constructor( canvas, width, height, size, tiles, colors = [],  blocked = [], costmap = {} ) {
        super( canvas, width, height, size, tiles, colors,  blocked, costmap );
        this._range = Math.floor( width / 2 );
        this._size = Math.floor( size / 2 );
        this._drawHome = { x: this._canvas.clientWidth / 2, y: this._canvas.clientHeight / 2 };
    }

    set range ( value ) {
        this._range = value;
    }
    
    render () {
        let ctx = this._ctx;
        ctx.clearRect( 0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight );
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for ( let q = -this._range; q <= this._range; q++ ) {
            for ( let r = -this._range; r <= this._range; r++ ) {
                if ( Math.abs( q + r ) <= this._range ) this._drawHex( ctx, { q, r } );
            }
        }
        if ( this._hover ) this._drawHex( this._ctx, this._hover, true );
        
    }

    _directions() {
        return cubeDirections.map( d => this._cubeToAxial( d ) );
    }

    _tileno( axial ) {
        let width = this._range * 2 + 1;
        return (axial.q + this._range) + width * (axial.r + this._range); 
    }
    _getAxialFromTileNo( tileno ) {
        let width = this._range * 2 + 1;
        let q = tileno % width - this._range;
        let r = Math.floor( tileno / width ) - this._range; 
        return { q, r };
    }
    _inBounds ( axial ) {
        return Math.abs( axial.q ) <= this._range && Math.abs( axial.r ) <= this._range && Math.abs( axial.q + axial.r ) <= this._range;
    }
    _axialToCube( axial ) {
        let x = axial.q;
        let z = axial.r
        let y = - x - y;
        return { x, y, z };
    }
    _cubeToAxial( cube ) {
        let x = cube.x;
        let y = cube.z;
        return { x, y } 
    }

    
    _pointyHexCorner ( center, i) {
        let a_deg = 60 * i - 30;
        let a_rad = a_deg * Math.PI / 180;
        let x = center.x + (this._size * Math.cos(a_rad));
        let y = center.y + (this._size * Math.sin(a_rad));
        return { x, y }
    }
    _pointyHexToPixel ( mapCenter, axial ) {
        //let cube = _axial_to_cube ( hex );
        let x = mapCenter.x + this._size * (Math.sqrt(3) * axial.q + Math.sqrt(3)/2 * axial.r);
        let y = mapCenter.y + this._size * (                                    3/2 * axial.r);
        return { x, y }
    }
    _pixelToPointyHex( coords ) {
        let point = {
            x: coords.x - this._drawHome.x,
            y: coords.y - this._drawHome.y
        }
        let q = Math.round( ( Math.sqrt(3) / 3 * point.x  -  1/3 * point.y ) / this._size );
        let r = Math.round( (                                2/3 * point.y ) / this._size );
        return Math.abs( q + r )  <= this._range && Math.abs( q ) <= this._range && Math.abs( r)  <= this._range ? { q, r } : null;
    }
    _getTileFromMouseCoOrds( coords ) {
        return this._pixelToPointyHex( coords );
    }
    _drawHex( ctx, axial, hover = false ) {
        let tile = this._tileno( axial );

        ctx.lineWidth = 2;
        ctx.fillStyle = this._colors[ this._tiles[ tile ] ];
        ctx.strokeStyle = hover ? '#ff0000': '#ffffff';

        let center = this._pointyHexToPixel( this._drawHome, axial );
        let points = Array.apply( null, Array(6) ).map( ( _, i ) => this._pointyHexCorner( center, i ) );

        ctx.beginPath();
        points.forEach( ( pt, idx ) => {
            idx == 0 ? ctx.moveTo( pt.x, pt.y ) : ctx.lineTo( pt.x, pt.y );
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        if ( tile == this._origin ) {
            ctx.fillStyle = '#ffffff88';
            ctx.fill();
        }

        ctx.lineWidth = 1;
        ctx.strokeStyle = '#222222';
        ctx.beginPath();
        let t = ''; //tile + ': ' + axial.q + ',' + axial.r
        if ( this._origin != null ) {
            let distance = this._getPathDistance( tile );
            if ( distance != null ) {
                t = distance;
                //ctx.strokeText( distance, center.x, center.y );  
            }
        }
        //t = hover ? tile + '<' + this._path[ tile ] : t; 
        ctx.strokeText( t, center.x, center.y );
    }
}

export { PriorityQueue, GridMap, HexMap }