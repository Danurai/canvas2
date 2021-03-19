import * as THREE from "/jsm/three.module.js";
import { OrbitControls } from "/jsm/controls/OrbitControls.js";
import { GUI } from "/jsm/libs/dat.gui.module.js";
import Stats from "/jsm/libs/stats.module.js";
import { math } from "/jsm/math.js";

let scene, camera, renderer, controls, gui, stats;
let cube, plane, material, mesh;
let image;

let params = {
    modelcolor: 0xFFFFFF,
    wireframe: true
}

init();
animate();

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xaaaaaa );

    let canvas = document.querySelector('#c');
    let w = canvas.clientWidth;
    let h = canvas.clientHeight;

    renderer = new THREE.WebGLRenderer( { canvas, antialias: true } );
    renderer.shadowMap.enabled = true;
    renderer.setSize( w, h );
    camera = new THREE.PerspectiveCamera( 45, w/h, 1, 1000 );
    camera.position.set( -50, 30, 300)

    let light = new THREE.DirectionalLight(0x808080, 1, 100);
    light.position.set(-100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = false;
    scene.add(light);

    light = new THREE.DirectionalLight(0x404040, 1, 100);
    light.position.set(100, 100, -100);
    light.target.position.set(0, 0, 0);
    light.castShadow = true;
    scene.add(light);

    controls = new OrbitControls( camera, canvas );


    let texture = new THREE.TextureLoader().load('/img/textures/hex.png');

    //modifyVertices();
    //modifyVerticesWithBump();
    
    let imgLoader = new THREE.TextureLoader();
    imgLoader.load('/img/textures/danmap.png', 
        function ( res ) {
            image = res.image;
            image.pixels = getImageData( image );

            let geometry = new THREE.PlaneGeometry( 250, 250, 256, 256 );
            material  = new THREE.MeshStandardMaterial( { map: texture, color: params.modelcolor, wireframe: params.wireframe } ); //map: texture, 
            plane = new THREE.Mesh( geometry, material );
            plane.receiveShadow = true;
            plane.castShadow = true;
            plane.rotation.x = - Math.PI/2;
            
            modifyVerticesWithTexture();
            scene.add( plane );
        });


    window.addEventListener( 'resize', onWindowResize );

    //stats = new Stats();
    //window.append( stats.dom );
    gui = new GUI()
    gui.add( params, "wireframe" ).onChange( function () { material.wireframe = params.wireframe });
    gui.addColor( params, "modelcolor" ).onChange( function () { material.color.set( params.modelcolor ); });

}

function getImageData( image ) {
    let canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    
    let ctx = canvas.getContext('2d');
    ctx.drawImage( image, 0, 0 );

    return ctx.getImageData( 0, 0, image.width, image.height ).data;
}

function getPixelAsFloat( x, y ) {
    let position = ( x + image.width * y ) * 4;
    return image.pixels[ position ] / 255;
}

function bilinearSample ( xf, yf ) {
    let w = image.width - 1;
    let h = image.height - 1;
    
    let x1 = Math.floor( xf * w );
    let y1 = Math.floor( yf * h );
    let x2 = math.clamp( x1 + 1, 0, w );
    let y2 = math.clamp( y1 + 1, 0, h );

    let xp = xf * w - x1;
    let yp = xp * h - y1;

    let p11 = getPixelAsFloat( x1, y1 );
    let p12 = getPixelAsFloat( x2, y1 );
    let p21 = getPixelAsFloat( x1, y2 );
    let p22 = getPixelAsFloat( x2, y2 );

    let px1 = math.lerp( xp, p11, p21 );
    let px2 = math.lerp( xp, p12, p22 );

    return p11 * 20;
    //return math.lerp( yp, px1, px2 ) * 20;
}

function modifyVerticesWithTexture() {
    let vertices = plane.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        let xf = ( vertices[ i ] + 125 ) / 250;
        let yf = ( vertices[ i+1 ] + 125 ) / 250;
        //console.log( bilinearSample( xf, yf ) ); 
        plane.geometry.attributes.position.array[ i + 2 ] = bilinearSample( xf, yf );
    }
}

function modifyVertices () {
    let vertices = plane.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        if (vertices[i] == 125 && vertices[i+1] == 125) {
            plane.geometry.attributes.position.array[i+2] = 100;
        } else {
            plane.geometry.attributes.position.array[i+2] = 0;
        }
    }
}

function modifyVerticesWithBump () {
    let vertices = plane.geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        let d = Math.sqrt( Math.pow( Math.abs( vertices[i] ), 2 ) + Math.pow( Math.abs( vertices[i+1]), 2 ), 2);
        let h = smootherstep( 0, 125, 125 - d );
        //console.log ( vertices[i], vertices[i+1], d, h);
        plane.geometry.attributes.position.array[ i + 2 ] = h * 50;
    }
}

function smootherstep ( edge0, edge1, x ) {
// Scale, and clamp x to 0..1 range
x = math.clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
// Evaluate polynomial
return x * x * x * (x * (x * 6 - 15) + 10);
}

function onWindowResize() {
    let canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
}

function animate () {
    requestAnimationFrame( animate );
    render();
}

function render () {
    renderer.render( scene, camera );
}
