import * as GRIDMAP from '../jsm/gridmap.js';

const width = 6;
const height = width;
const size = 50;                                        //document.querySelector('#c').clientHeight / width;

const colors  = [ 'grey', 'olive', 'dodgerblue' ];      //const highlightColors = [ 'lightgrey', 'darkseagreen', 'deepskyblue' ];
const blocked = [ 2 ]
const costmap = { 0: 1, 1: 2, 2: 5 }

let gridCanvas = document.querySelector('#cgrd');
const gridTiles = new Array( width * height  ).fill().map( () => Math.floor( Math.random() * colors.length ));
//const tiles = [ 0, 0, 1, 0, 0,    0, 1, 1, 2, 0,    1, 1, 1, 2, 0,    0, 0, 1, 2, 0,    0, 0, 1, 0, 0 ];

let hexCanvas = document.querySelector('#chex');
const hexTiles = new Array( Math.pow( Math.floor( width / 2 ) * 2 + 1, 2 ) ).fill().map( () => Math.floor( Math.random() * colors.length ));


let hexMap = new GRIDMAP.HexMap ( hexCanvas, width, height, size, hexTiles, colors, blocked, costmap );
let gridMap = new GRIDMAP.GridMap( gridCanvas, width, height, size, gridTiles, colors, blocked, costmap );

init();
requestAnimationFrame( render );

function init() {

    hexCanvas.addEventListener( 'mousemove', ( evt ) => onMouseMove( evt, hexCanvas, hexMap ) );
    hexCanvas.addEventListener( 'mouseout', () => onMouseOut( hexMap ) );
    hexCanvas.addEventListener( 'click', ( evt ) => onMouseClick( evt, hexCanvas, hexMap ) );
    gridCanvas.addEventListener( 'mousemove', ( evt ) => onMouseMove( evt, gridCanvas, gridMap ) );
    gridCanvas.addEventListener( 'mouseout', () => onMouseOut( gridMap ) );
    gridCanvas.addEventListener( 'click', ( evt ) => onMouseClick( evt, gridCanvas, gridMap ) );
    
    function onMouseMove( evt, canvas, map ) {
        let bcr = canvas.getBoundingClientRect();
        let x = evt.clientX - bcr.left;
        let y = evt.clientY - bcr.top;
        map.setHover(  { x , y } );
    }
    function onMouseOut( map ) {
        map.setHover( { x: -1, y: -1 } );
    }

    function onMouseClick( evt, canvas, map ) {
        let bcr = canvas.getBoundingClientRect();
        let x = evt.clientX - bcr.left;
        let y = evt.clientY - bcr.top;
        map.toggleOrigin( { x, y } );
    }
}

function render( time ) {
    hexMap.render();
    gridMap.render();

    requestAnimationFrame( render )
}
