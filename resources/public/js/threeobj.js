import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";
import { MTLLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";

import { GUI } from "/jsm/libs/dat.gui.module.js";

let canvas, scene, camera, controls, renderer, raycaster, mouse, gui;
let params = { emissive: 0x000000 };
let INTERSECTED;


let levelmap = {
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
         3, 0,  9, 3, 10, 3,  3, 0, 15, 0,  3, 0, 10, 0,  0, 0,  0, 0,  0, 0, 16, 1,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,
         3, 0, 10, 0,  8, 2, 10, 3, 10, 3, 10, 3,  8, 3,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0,  0, 0 
    ]
}

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
                    console.log( obj );
                    if ( child instanceof THREE.Mesh ) {
                        child.material.emissive = new THREE.Color( 0x000000 );
                        child.geometry.center();
                        child.geometry.translate( 0, child.geometry.boundingBox.max.y, 0 );
                        //child.geometry.translate( -child.geometry.boundingBox.min.x, child.geometry.boundingBox.max.y, -child.geometry.boundingBox.min.z );
                    }
                });
                obj.position.x = posx * 2 - mapw;
                obj.position.z = posz * 2 - maph;
                obj.rotation.y = rotation *  Math.PI / 2;
                obj.userData = {tile: {q: posx / 2, r: posz }};
                scene.add( obj );
            });
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
    
        for ( let q = 0; q < levelmap.width * 2; q+=2 ) {
            for ( let r = 0; r < levelmap.height; r++ ) {
                addTileToScene( levelmap.map[ r * levelmap.width * 2 + q ],  levelmap.map[ r * levelmap.width * 2 + q + 1 ], q / 2, r, levelmap.width, levelmap.height );
            }
        }

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    mouse.x = 1; mouse.y = 1;

    
    gui = new GUI()
    //gui.add( params, "wireframe" ).onChange( function () { material.wireframe = params.wireframe });
    gui.addColor( params, "emissive" ).onChange( function () { scene.traverse( function ( c ) { if (c instanceof THREE.Mesh) { c.object.material.emissive = params.emissive; }}); });

    window.addEventListener( 'resize', onWindowResize );
    canvas.addEventListener('mousemove', e => onMouseMove( e ));
}



function displayPalette( palette ) {
    const canvas = document.createElement( 'canvas' );
    canvas.width = 8;
    canvas.height = 32;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.width = '100px';
    canvas.style.imageRendering = 'pixelated';
    document.body.appendChild( canvas );
    const context = canvas.getContext( '2d' );
    for ( let c = 0; c < 256; c ++ ) {
        const x = c % 8;
        const y = Math.floor( c / 8 );
        const hex = palette[ c + 1 ];
        const r = hex >> 0 & 0xff;
        const g = hex >> 8 & 0xff;
        const b = hex >> 16 & 0xff;
        context.fillStyle = `rgba(${r},${g},${b},1)`;
        context.fillRect( x, 31 - y, 1, 1 );
    }
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
            if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( 0x000000 );
        
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.material.emissive.setHex( 0xff0000 );
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( 0x000000 );
        INTERSECTED = null;
    }

    //for ( let i = 0; i < intersects.length; i ++ ) {
    //    intersects[ i ].object.material.emissive = new THREE.Color( 0x555555 );
    //}

    renderer.render( scene, camera );
}

