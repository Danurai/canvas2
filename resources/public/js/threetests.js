import * as THREE from "/jsm/three.module.js";
import { OrbitControls } from "/jsm/controls/OrbitControls.js"
import { GUI } from "/jsm/libs/dat.gui.module.js"
import Stats from "/jsm/libs/stats.module.js"

let scene, camera, renderer, controls, gui;
let cube, plane, material, mesh;
let params = {
    modelcolor: 0x2222dd
}

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xaaaaff );

    let canvas = document.querySelector('#c');
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;

    renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
    renderer.setSize( w, h );
    camera = new THREE.PerspectiveCamera( 45, w/h, 1, 1000 );
    camera.position.set( 0, 10, 10)

    let light = new THREE.DirectionalLight( 0xFFFFFF );
    light.position.set( 20, 20, 20 );
    scene.add( light );

    controls = new OrbitControls( camera, canvas );

    //let geometry = new THREE.PlaneGeometry( 100, 100, 16, 16 );
    //material  = new THREE.MeshPhongMaterial( { color: params.modelcolor, specular: 0x222222, wireframe: true } );
    //plane = new THREE.Mesh( geometry, material );
    //plane.rotation.x = - Math.PI/2;

    let geometry = new THREE.BufferGeometry();
    let x_vertices = new Float32Array( [
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
    
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0, -1.0,  1.0
    ] );
    let y_vertices = new Float32Array( [
        1, 1, 0,
        0, 1, 0,
        0, 0, 0,
        
        0, 0, 0,
        1, 0, 0,
        1, 1, 0
    ] );
    let z_vertices = new Float32Array( [
        2, 4, 0, 0, 3, 0, 2, 2, 0,
        4, 3, 0, 2, 4, 0, 2, 2, 0,
        4, 1, 0, 4, 3, 0, 2, 2, 0,
        2, 0, 0, 4, 1, 0, 2, 2, 0,
        0, 1, 0, 2, 0, 0, 2, 2, 0,
        0, 3, 0, 0, 1, 0, 2, 2, 0,
    ] );

    let corners = Array.apply(null, Array(6)).map( (_,i) => hexvec( {x: 0, y: 0}, 2, i ));
    console.log (corners.reduce( function(a, c, i, []) { return a.concat( c ); }));
    let vertices = new Float32Array( corners.reduce( function(a, c, i, []) { return a.concat( c ); }) );
    
    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
    material = new THREE.MeshBasicMaterial( { color: params.modelcolor } );
    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.x = - Math.PI / 2;

    scene.add( mesh );

    window.addEventListener( 'resize', onWindowResize );
    gui = new GUI()
    gui.add( material, "wireframe", true, false, 1 );
    gui.addColor( params, "modelcolor" ).onChange( function () { material.color.set( params.modelcolor ); });
}



function onWindowResize() {
    let canvas = renderer.domElement;
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;

    //renderer.setSize( w, h );
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
}

function animate () {
    requestAnimationFrame( animate );
    render();
}

function render () {
    renderer.render( scene, camera );
}

// Hexy

function roundtotwodp (n ) {
    return Math.round( n * 100 ) / 100;
}
function ph_corner ( center, size, i ) {
    let a_deg = 60 * i - 30;
    let a_rad = a_deg * Math.PI / 180;
    let x = center.x + (size * Math.cos(a_rad));
    let y = center.y + (size * Math.sin(a_rad));
    return [ x, y, 0 ]
}
function axial_to_cube ( hex ) {
    let x = hex.q;
    let z = hex.r;
    let y = - x - z; 
    return [ x, y, z ]
}
function ph_center ( origin, size, hex ) {
    let cube = axial_to_cube ( hex );
    let x = size * (Math.sqrt(3) * hex.q + Math.sqrt(3)/2 * hex.r);
    let y = size * (                                  3/2 * hex.r);
    return { x, y }
}
function hexvec ( center, size, i ) {
    let p1 = ph_corner ( center, size, i );
    let p2 = ph_corner ( center, size, i+1  );
    let p3 = [ center.x, center.y, 0 ];
    console.log( p1.concat( p2, p3 ) );
    return p1.concat( p2, p3 ) ;
}