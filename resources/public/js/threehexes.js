import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js";
import {GLTFLoader} from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js";
import {OrbitControls} from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/controls/OrbitControls.js";

// Hex calculations from https://www.redblobgames.com/grids/hexagons/
// Tank Model by MrEliptik https://sketchfab.com/3d-models/low-poly-stylized-tank-230812ff2fa74aecbd4eb6e312302b52

let canvas, scene, camera, controls, renderer, raycaster;
let model, mouse, INTERSECTED;

init();
//render();  // remove when using next line for animation loop (requestAnimationFrame)
animate();

function loadModel ( scene, height, url ) {
    let loader = new GLTFLoader();
    loader.load( url, 
        (gltf) => {
            model = gltf.scene;
            let scale = 0.025
            model.scale.set( scale, scale, scale )
            model.position.set( 0, height, 0 )
            //model.rotation.y = 30 * Math.PI / 180;
            scene.add(model);
        },
        ( xhr ) => {
            console.log ( ( xhr.loaded / xhr.total * 100 ) + "% loaded");
        },
        ( error ) => {
            console.log ( 'An error happened' + error );
        }
    );
}

function init() {

    scene = new THREE.Scene();
    let sceneloader = new THREE.CubeTextureLoader();
    let scenetexture = sceneloader.load([
      "./img/skybox/posx.png",
      "./img/skybox/negx.png",
      "./img/skybox/posy.png",
      "./img/skybox/negy.png",
      "./img/skybox/posz.png",
      "./img/skybox/negz.png",
    ])
    scene.background = scenetexture;
    // fog

    canvas = document.querySelector('#chex');
    renderer = new THREE.WebGLRenderer( {canvas, antialias: true });
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );

    camera = new THREE.PerspectiveCamera( 45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set (-30, 20, 50);

    controls = new OrbitControls( camera, canvas );
    
    const dirLight1 = new THREE.DirectionalLight( 0xffffff );
    dirLight1.position.set( 30, 50, -50 );
    scene.add( dirLight1 );
    scene.add( new THREE.AmbientLight( 0x101010 ));
    
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2( 200, 200 );
    
    // hexes
    const origin = { x: 0, y: 0 };
    const size = 5;
    const range = 1;
    for (let q = - range; q <= range; q++) {
        for (let r = - range; r <= range; r++) {
            //let r = 0;
            if (Math.abs(q + r) <= range) scene.add( newhex( origin, size, { q, r} ) );
        }
    }

    let centreHex = getHexObject({q: 0, r: 0});
    loadModel (scene, centreHex.userData.depth, '/models/low_poly_stylized_tank/scene.gltf' );


    window.addEventListener( 'resize', onWindowResize );
    canvas.addEventListener('mousemove', e => onMouseMove(e));
}

function onWindowResize() {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );
}

function onMouseMove( event ) {
    let rect = event.target.getBoundingClientRect();
    mouse.x = ( ( event.clientX - rect.left ) / window.innerWidth ) * 2 - 1;
    mouse.y = - ( (event.clientY - rect.top ) / window.innerHeight ) * 2 + 1;
    //console.log(mouse);
}

function animate() {
    requestAnimationFrame( animate );
    controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
    render();
}

function render() {

    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( scene.children);

    if ( intersects.length > 0 ) {
        if ( INTERSECTED != intersects[ 0 ].object ) {
            if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
            INTERSECTED = intersects[ 0 ].object;
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            INTERSECTED.material.color.setHex(0xAA0022);
            console.log ( INTERSECTED.name );
        }
    } else {
        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }

    renderer.render( scene, camera );
}


function getHexObject ( hex ) {
    return scene.children.filter(o => o.name == `hex${hex.q}${hex.r}` )[0];
}



function main() {
    // mouse
    let INTERSECTED;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2( 200, 200 );

    // Hexes
    const size = 10;
    const range = 3;

    // Rotation
    let theta = 0;
    const radius = 100;

    const canvas = document.querySelector("#chex");
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    const scene = new THREE.Scene();

    const renderer = new THREE.WebGLRenderer( {canvas} );
    renderer.setSize(w, h);

    

    function render() {
        controls.update();
        renderer.render(scene, camera);
    }


}


// Hexy


function ph_corner ( center, size, i) {
    let a_deg = 60 * i - 30;
    let a_rad = a_deg * Math.PI / 180;
    let x = center.x + (size * Math.cos(a_rad));
    let y = center.y + (size * Math.sin(a_rad));
    return { x, y } 
}
function axial_to_cube ( hex ) {
    let x = hex.q;
    let z = hex.r;
    let y = - x - z; 
    return { x, y, z }
}
function ph_center ( origin, size, hex ) {
    let cube = axial_to_cube ( hex );
    let x = size * (Math.sqrt(3) * hex.q + Math.sqrt(3)/2 * hex.r);
    let y = size * (                                  3/2 * hex.r);
    return { x, y }
}

function newhex( origin, size, hex ) {
    let colorhexes = [ 0x1144AA, 0xDAAB54, 0x007733, 0x555555 ]
    
    let center = ph_center( origin, size, hex );
    let corners = Array.apply(null, Array(6)).map((_,i)=>ph_corner({x: 0, y: 0},size - 1,i));
    let hexShape = new THREE.Shape( corners );
    let depth = Math.floor(4 * Math.random())
    
    let extrudesettings = {
        steps: 5,
        depth: depth,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelSegments: 3
    }
    let geometry = new THREE.ExtrudeGeometry( hexShape, extrudesettings );
    let material = new THREE.MeshPhongMaterial( {color: colorhexes[depth] } )
    let hexmesh =  new THREE.Mesh(geometry, material)
    
    hexmesh.position.set(center.x, 0, center.y);
    hexmesh.rotation.x = - Math.PI / 2
    hex.depth = depth + 1;
    hexmesh.userData = hex;
    hexmesh.name = (`hex${hex.q}${hex.r}`);
    return hexmesh;
}
