import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";
import { VOXLoader, VOXMesh } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/VOXLoader.js';
import { MTLLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";

// Hex calculations from https://www.redblobgames.com/grids/hexagons/
// Tank Model by MrEliptik https://sketchfab.com/3d-models/low-poly-stylized-tank-230812ff2fa74aecbd4eb6e312302b52

let canvas, scene, camera, controls, renderer, raycaster;

init();
//render();  // remove when using next line for animation loop (requestAnimationFrame)
animate();


function init() {

    scene = new THREE.Scene();
    //let sceneloader = new THREE.CubeTextureLoader();
    //let scenetexture = sceneloader.load([
    //  "./img/skybox/posx.png",
    //  "./img/skybox/negx.png",
    //  "./img/skybox/posy.png",
    //  "./img/skybox/negy.png",
    //  "./img/skybox/posz.png",
    //  "./img/skybox/negz.png",
    //])
    //scene.background = scenetexture;
    scene.background = new THREE.Color( 0x88ff88 );
    // fog

    canvas = document.querySelector('#chex');
    renderer = new THREE.WebGLRenderer( {canvas, antialias: true });
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );

    camera = new THREE.PerspectiveCamera( 45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set ( 0, 5, 10 );

    controls = new OrbitControls( camera, canvas );
    
    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 30, 50, -50 );
    scene.add( dirLight1 );
    scene.add( new THREE.AmbientLight( 0x101010 ));

    
    new MTLLoader ()
        .load( 'models/Units/OBJ/Tank/Tank-1.mtl', function ( materials ) {
            new OBJLoader()
                .setMaterials( materials )
                .load( "models/Units/OBJ/Tank/Tank-0.obj", obj => scene.add( obj ) );
            new OBJLoader()
                .setMaterials( materials )
                .load( "models/Units/OBJ/Tank/Tank-1.obj", obj => scene.add( obj ) );
            new OBJLoader()
                .setMaterials( materials )
                .load( "models/Units/OBJ/Tank/Tank-2.obj", obj => scene.add( obj ) );

        });
    
    
    
        
    //let voxloader = new VOXLoader();
    //voxloader.load( 'models/vox/TanksAndWar_Source.vox', function ( chunks ) {
    //    console.log( chunks.length );
    //    //for ( let i = 0; i < chunks.length; i++ ) {
    //        let chunk = chunks[ 16 ];
    //        let mesh = new VOXMesh( chunk );
    //        mesh.color = ( 0xBB22BB );
    //        scene.add( mesh );
    //    //}
    //},
	// called while loading is progressing
	//function ( xhr ) {
//
	//	console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
//
	//},
	//// called when loading has errors
	//function ( error ) {
//
	//	console.log( 'An error happened' );
//
	//})

    window.addEventListener( 'resize', onWindowResize );
    //canvas.addEventListener('mousemove', e => onMouseMove(e));
}

function onWindowResize() {
    renderer.setSize( canvas.clientWidth, canvas.clientHeight, false );
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    
}

function animate() {
    requestAnimationFrame( animate );
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
}

function render() {
    renderer.render( scene, camera );
}

