import * as THREE from "/jsm/three.module.js";
import { OrbitControls } from "/jsm/controls/OrbitControls.js"
import { GUI } from "/jsm/libs/dat.gui.module.js"
import Stats from "/jsm/libs/stats.module.js"

let scene, camera, renderer, controls, gui;
let cube, plane, material;
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
    camera.position.set( 0, 50, 120)

    let light = new THREE.DirectionalLight( 0xFFFFFF );
    light.position.set( 20, 20, 20 );
    scene.add( light );

    controls = new OrbitControls( camera, canvas );

    let geometry = new THREE.PlaneGeometry( 100, 100, 16, 16 );
    material  = new THREE.MeshPhongMaterial( { color: params.modelcolor, specular: 0x222222, wireframe: true } );
    plane = new THREE.Mesh( geometry, material );
    plane.rotation.x = - Math.PI/2;

    scene.add( plane );

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