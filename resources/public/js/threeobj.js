import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";
import { MTLLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";

import { GUI } from "/jsm/libs/dat.gui.module.js";

let canvas, scene, camera, controls, renderer, raycaster, mouse, gui;
let params = { emissive: 0x0000ff };
let INTERSECTED;

let maps = [{
        name: "Map0",
        width: 16,
        height: 12,
        map: [
             3, 0,  3, 0, 15, 0, 12, 0, 15, 0,  3, 0, 15, 0, 15, 0,  3, 0,  3, 0,  3, 0, 15, 0, 12, 0,  3, 0,  3, 0, 15, 0,
             3, 0,  3, 0, 15, 0,  9, 0, 12, 1, 12, 1, 11, 1, 12, 1, 12, 1, 12, 1, 12, 1, 12, 1,  9, 1, 15, 0, 15, 0, 15, 0,
            12, 1, 12, 1,  9, 2, 15, 0, 15, 0, 15, 0, 15, 0, 12, 0,  3, 0,  3, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0,
             3, 0, 15, 0,  9, 0, 12, 1, 11, 1, 12, 1, 12, 1,  9, 1, 15, 0, 15, 0, 15, 0,  2, 0, 15, 0, 15, 0, 15, 0, 13, 1,
            15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0,  2, 0, 13, 1, 14, 0, 14, 0, 14, 0, 14, 0, 13, 3,
            15, 0, 15, 0, 15, 0,  2, 0, 15, 0,  2, 0, 15, 0,  2, 0,  3, 0, 15, 0, 14, 1, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0,
            14, 0, 14, 0, 14, 0, 14, 0, 14, 0, 14, 0, 14, 0, 14, 0, 14, 0, 14, 0, 13, 3, 15, 0, 15, 0, 15, 0, 15, 0,  3, 0,
            15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0,  3, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0,  4, 0,
            15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0,  4, 0,  3, 0,  4, 0,
             3, 0,  3, 0, 15, 0,  3, 0, 15, 0, 15, 0, 15, 0, 15, 0,  3, 0, 15, 0, 15, 0,  4, 0,  3, 0,  3, 0,  4, 0,  5, 0,
             3, 0,  4, 0,  3, 0, 15, 0, 15, 0,  3, 0,  3, 0, 15, 0, 15, 0, 15, 0, 15, 0, 15, 0,  4, 0,  5, 0,  3, 0,  4, 0,
             3, 0,  3, 0,  4, 0,  3, 0,  3, 0,  3, 0,  4, 0,  3 ,0,  3, 0,  3, 0,  3, 0,  4, 0,  3, 0,  3, 0,  3, 0,  4, 0
        ],
        armies: [{
            team: 'Blue',
            buildings: [{ type: 'city', q: 11, r: 3 }],
            forces: [
                { type: 'Infantry', q: 11, r: 4, facing: 2 }, 
                { type: 'Infantry', q: 11, r: 5, facing: 2 }, 
                { type: 'Tank',     q:  8, r: 6, facing: 2 } 
            ]
        } , {
            team: 'Red',
            buildings: [{ type: 'City', q: 3, r: 5 }],
            forces: [
                { type: 'Infantry', q: 3, r: 6, facing: 0 },
                { type: 'Tank'    , q: 5, r: 7, facing: 0 },
                { type: 'Infantry', q: 6, r: 7, facing: 0 }
            ]
        }
        ]
    },{
        name: "Map1",
        width: 16,
        height: 12,
        map: [  // tile no, 90deg rotations
            3, 0,  3, 0, 15, 0,  3, 0,  3, 0, 15, 0, 15, 0, 15, 0, 15, 0, 12, 0,  3, 0, 15, 0, 15, 0, 14, 1, 15, 0,  3, 0,
            3, 0, 13, 1, 14, 0, 14, 0, 14, 0, 14, 0, 14, 0, 17, 0, 17, 0, 11, 0,  2, 0, 15, 0,  1, 0, 14, 1,  3, 0,  3, 0,
            15, 0, 14, 1, 15, 0, 15, 0, 15, 0, 15, 0,  2, 0, 13, 2, 17, 2, 11, 0, 14, 0, 14, 0, 14, 0, 13, 3,  3, 0,  3, 0,
            15, 0, 14, 1, 15, 0, 15, 0, 15, 0,  9, 3,  9, 2, 15, 0, 15, 0, 10, 0, 10, 3, 10, 3, 10, 3, 10, 3, 10, 3, 10, 3,
            15, 0, 14, 1, 15, 0,  9, 3, 10, 3,  8, 3,  8, 2, 10, 3, 10, 3,  8, 3,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
            3, 0, 14, 1,  9, 3,  8, 3,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
            3, 0, 14, 1, 10, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
            15, 0, 14, 1, 10, 0, 10, 1, 10, 1, 10, 1,  8, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
            15, 0, 14, 1, 12, 0,  3, 0, 15, 0,  3, 0, 10, 0,  0, 0,  0, 0,  0, 0,  0, 0, 16, 1,  0, 0,  0, 0,  0, 0,  0, 0,
            15, 0, 13, 2, 11, 0, 14, 0,  1, 0, 15, 0, 10, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
            3, 0,  9, 3,  9, 2,  3, 0, 15, 0,  3, 0, 10, 0,  0, 0,  0, 0,  0, 0, 16, 1,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
            3, 0, 10, 0,  8, 2, 10, 3, 10, 3, 10, 3,  8, 3,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0 
        ]
    }]
let levelmap = maps[ 0 ];

init();
//render();  // remove when using next line for animation loop (requestAnimationFrame)
animate();
let tilename = [
    '0-Sea', '1-QG', '2-City', '3-Forest', '4-Mountain_Low', '5-Mountain_High', '6-Airport', '7-Base', '8-Beach_OuterCorner', '9-Beach_InnerCorner', '10-Beach', 
    '11-Bridge', '12-River', '13-Road_Corner', '14-Road', '15-Grass', '16-Rocks', '17-Road_T' ];


function addTileToScene( tileno, rotation, posx, posz, mapw, maph ) {
    new MTLLoader().load('/models/Textures/Terrain.mtl', function ( materials ) {
        new OBJLoader()   
            .setMaterials( materials )
            .load( '/models/Terrain/' + tilename[ tileno ] + '.obj', function ( obj ) {
                obj.traverse( function ( child ) {
                    if ( child instanceof THREE.Mesh ) {
                        child.material.emissive = new THREE.Color( 0x000000 );
                        child.geometry.center();
                        child.geometry.translate( 0, child.geometry.boundingBox.max.y, 0 );
                        //child.geometry.translate( -child.geometry.boundingBox.min.x, child.geometry.boundingBox.max.y, -child.geometry.boundingBox.min.z );
                        child.userData = {tile: {q: posx, r: posz }};
                    }
                });
                obj.position.x = posx * 2 - mapw;
                obj.position.z = posz * 2 - maph;
                obj.rotation.y = rotation *  Math.PI / 2;
                scene.add( obj );
            });
        });
} 

//function updateBuildingToTeam( team, q, r ) {}

function addUnitToScene( team, force ) {
    new MTLLoader().load( 'models/Textures/Units_' + team + '.mtl', function ( materials ) {
        new OBJLoader()
            .setMaterials( materials )
            .load( 'models/Units/Tank-1.obj', 
                ( obj ) => {
                    obj.traverse( function ( child ) {
                        if ( child instanceof THREE.Mesh ) {
                            child.material.emissive = new THREE.Color( 0x000000 );
                            child.geometry.center();
                            child.geometry.translate( 0, child.geometry.boundingBox.max.y, 0 );
                            //child.geometry.translate( -child.geometry.boundingBox.min.x, child.geometry.boundingBox.max.y, -child.geometry.boundingBox.min.z );
                            child.userData = {tile: {q: force.q, r: force.r }};
                        }
                    });
                    obj.position.x = force.q * 2- levelmap.width;
                    obj.position.z = force.r * 2 - levelmap.height;
                    obj.position.y = 0.1;
                    obj.rotation.y = force.facing *  Math.PI / 2;
                    scene.add( obj );
                },
                //( xhr ) => {},
                //( error ) => {}
            );
    });
}

function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xdddddd );
    // fog

    canvas = document.querySelector('#chex');
    renderer = new THREE.WebGLRenderer( {canvas, antialias: true });
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );

    camera = new THREE.PerspectiveCamera( 45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set ( 0, 20, 30 );

    controls = new OrbitControls( camera, canvas );
    
    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 30, 50, -50 );
    scene.add( dirLight1 );
    scene.add( new THREE.AmbientLight( 0x303030 ));

    //levelmap.height = Math.floor( levelmap.map.length / levelmap.width );
    for ( let q = 0; q < levelmap.width * 2; q+=2 ) {
        for ( let r = 0; r < levelmap.height; r++ ) {
            addTileToScene( levelmap.map[ r * levelmap.width * 2 + q ],  levelmap.map[ r * levelmap.width * 2 + q + 1 ], q / 2, r, levelmap.width, levelmap.height );
        }
    }
    for ( let army of levelmap.armies ) {
        for ( let force of army.forces ) {
            addUnitToScene( army.team, force );
        }
    }

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mouse.x = 1; mouse.y = 1;

    
    gui = new GUI()
    //gui.add( params, "wireframe" ).onChange( function () { material.wireframe = params.wireframe });
    gui.addColor( params, "emissive" )
        // /.onChange( function () { scene.traverse( function ( c ) { if (c instanceof THREE.Mesh) { c.object.material.emissive = params.emissive; }}); });

    window.addEventListener( 'resize', onWindowResize );
    canvas.addEventListener('mousemove', e => onMouseMove( e ));
}

function onMouseMove( evt ) {
    let rect = canvas.getBoundingClientRect();
    mouse.x = ( evt.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( ( evt.clientY - rect.top ) / window.innerHeight ) * 2 + 1;
}

function onWindowResize() {
    let w = window.innerWidth;
    let h = window.innerHeight;
    renderer.setSize( w, h );
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame( animate );
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
}

function render() {
    raycaster.setFromCamera( mouse, camera );

    let intersects = raycaster.intersectObjects( scene.children, true );

    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ]) {
            INTERSECTED = intersects[ 0 ].object;
            let nb = qrNeighbours( INTERSECTED.userData.tile );
            scene.traverse( function ( obj ) {
                if ( obj instanceof THREE.Mesh ) {
                    let highlight = false;
                    for ( let t of nb ) {
                        if ( obj.userData.tile.q == t.q  && obj.userData.tile.r ==  t.r ) highlight = true;
                    }
                    if ( highlight ) {
                         obj.material.emissive.setHex( params.emissive );
                    } else {
                        obj.material.emissive.setHex( 0x00000 );
                    }
                }
            });
        }
    } else {
        scene.traverse( function ( obj ) {
            if ( obj instanceof THREE.Mesh ) obj.material.emissive.setHex( 0x00000 ); 
        });
        INTERSECTED = null;
    }


    //for ( let i = 0; i < intersects.length; i ++ ) {
    //    intersects[ i ].object.material.emissive = new THREE.Color( 0x555555 );
    //}

    renderer.render( scene, camera );
}

function setinfo ( info ) {
    document.querySelector('#info').textContent = ("q:" + info.tile.q + ", r:" + info.tile.r );
    console.log( qrNeighbours( info.tile ) );
}


let directions = [
    {q: 1, r: 0}, 
    {q: 0, r: 1}, 
    {q: -1, r: 0}, 
    {q: 0, r: -1}
]

function qrNeighbours ( axial ) {
    let neighbours = [ axial ]
    for ( let i = 0; i < 4; i ++ ) {
        let q = axial.q + directions[ i ].q;
        let r = axial.r + directions[ i ].r;
        neighbours.push( { q, r } );
    }
    return neighbours;
}