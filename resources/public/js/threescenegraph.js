import * as THREE from '../jsm/three.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { GUI } from '../jsm/libs/dat.gui.module.js';

let camera, scene, renderer, controls, gui;
let nav;
let sun, earth, moon;
let objects = [];

class AxesGridHelper {
  constructor( node, units = 10 ) {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2;
    node.add( axes );

    const grid = new THREE.GridHelper( units, units );
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add( grid );

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible
  }
  set visible( v ) {
    this._visible = v;
    this.grid.visible = v;
    this.axes.visible = v;
  }
}


init();
animate();

function makeAxisGrid( node, label, units ) {
  const helper = new AxesGridHelper( node, units );
  gui.add(helper, 'visible').name( label );
}

function init() {
  let canvas = document.querySelector('#c');
  nav = document.querySelector('#nav');

  gui = new GUI();

  camera = new THREE.PerspectiveCamera( 45, window.innerWidth / ( window.innerHeight - nav.clientHeight ), 0.1, 1000 );
  camera.position.set( 0, 20, 50 );

  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true });
  renderer.setSize( window.innerWidth, window.innerHeight - nav.clientHeight );
  renderer.shadowMap.enabled = true;

  controls = new OrbitControls( camera, canvas );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x333333 );

  //let dirLight = new THREE.DirectionalLight( 0xFFFFFF );
  //dirLight.position.set( 30, 40, 30 );
  //scene.add( dirLight );
  scene.add( new THREE.AmbientLight( 0x999999, 0.5 ) );
  let sunlight = new THREE.PointLight ( 0xffffff, 3 );
  sunlight.castShadow = true;
  scene.add( sunlight );

  let geometry, material;

  let solarSystem = new THREE.Object3D();
  scene.add( solarSystem )
  objects.push( solarSystem );
  
  geometry = new THREE.SphereGeometry( 5, 10, 10 );
  material = new THREE.MeshPhongMaterial( { emissive: 0xffff00 } );
  sun = new THREE.Mesh( geometry, material );
  solarSystem.add( sun );
  objects.push( sun );
  
  let earthOrbit = new THREE.Object3D();
  earthOrbit.position.x = 20;
  solarSystem.add( earthOrbit );
  objects.push( earthOrbit );

  geometry = new THREE.SphereGeometry( 2, 10, 10 );
  material = new THREE.MeshPhongMaterial( { color: 0x2222dd } );
  earth = new THREE.Mesh( geometry, material );
  earth.receiveShadow = true;
  //earth.castShadow = true;
  earthOrbit.add( earth );
  objects.push( earth );
  
  let moonOrbit = new THREE.Object3D();
  moonOrbit.position.x = 4;
  earthOrbit.add( moonOrbit );
  objects.push( moonOrbit );

  geometry = new THREE.SphereGeometry( 0.5, 10, 10 );
  material = new THREE.MeshPhongMaterial( { color: 0xababab } );
  moon = new THREE.Mesh( geometry, material );
  moon.castShadow = true;
  //moon.receiveShadow = true;
  moonOrbit.add( moon );
  objects.push( moon );
  
  makeAxisGrid( solarSystem, 'solarSystem', 26);
  makeAxisGrid( sun, 'Sun');
  makeAxisGrid( earthOrbit, 'earthOrbit');
  makeAxisGrid( earth, 'earth');
  makeAxisGrid( moonOrbit, 'moonOrbit');
  makeAxisGrid( moon, 'moon');


  window.addEventListener( 'resize', ( evt ) => { 
    let w = window.innerWidth;
    let h = window.innerHeight - nav.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
  });
}

function animate() {
  requestAnimationFrame( animate );

  controls.update();
  render();
}

function render() {

  objects.forEach( ( obj ) => { obj.rotation.y += 0.01 });
  renderer.render( scene, camera );
}