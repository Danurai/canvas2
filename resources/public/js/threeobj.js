import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";
import { VOXLoader, VOXMesh } from 'https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/VOXLoader.js';
import { MTLLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";

let canvas, scene, camera, controls, renderer, raycaster;

init();
//render();  // remove when using next line for animation loop (requestAnimationFrame)
animate();


function init() {

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xdddddd );
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
    scene.add( new THREE.AmbientLight( 0x303030 ));

    let units = { Tank: 3, Artillery: 3 };

    let mtlloader = new MTLLoader();
    mtlloader
        .load( '/models/Textures/Units_Blue.mtl', function ( materials ) {
            let xpos = 0;
            for (let [ unit, size ] of Object.entries( units ) ) {
                let posx = ( 10 * Math.random() ) - 5;
                for (let i = 0; i < size; i++ ) {
                    new OBJLoader()
                        .setMaterials( materials )
                        .load( '/models/Units/' + unit + '-' + i + '.obj', function (obj) {
                            scene.add( obj );
                            obj.position.x = posx;
                            obj.rotation.y = - Math.PI / 2;
                        });
                    }
            }
        });

   window.addEventListener( 'resize', onWindowResize );
    //canvas.addEventListener('mousemove', e => onMouseMove(e));
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
    renderer.render( scene, camera );
}

