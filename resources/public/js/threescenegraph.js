import * as THREE from '../jsm/three.module.js';
import { OrbitControls } from '../jsm/controls/OrbitControls.js';
import { GUI } from '../jsm/libs/dat.gui.module.js';
import Stats from '../jsm/libs/stats.module.js';

let renderer, scene, controls, stats;

let targetOrbit, tank, targetElevation, targetBob, targetCameraPivot, turretPivot;
let tankCamera, targetCamera, turretCamera, camera;
let cameras;
let groundMesh, splineObject, bodyMesh, wheels, domeMesh, turretMesh, targetMesh; 

let curve, targetMaterial, infoElem;
let tankPosition = new THREE.Vector2();
let tankTarget = new THREE.Vector2();
let targetPosition = new THREE.Vector3();

init();
requestAnimationFrame( render );

function makeCamera( fov = 40 ) {
  let w = window.innerWidth;
  let h = window.innerHeight - document.querySelector('#nav').clientHeight;
  let cam = new THREE.PerspectiveCamera( fov, w / h, 0.1, 1000 );
  return cam;
}

function init() {
  let canvas = document.querySelector('#c');
  let nav = document.querySelector('#nav');
  let w = window.innerWidth;
  let h = window.innerHeight - nav.clientHeight;

  infoElem = document.createElement('div');
  infoElem.id = 'info';
  document.querySelector('#app').append( infoElem );

  let camera = makeCamera();
  camera.position.set( 0, 20, 30 );
  
  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0xababab );

  renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize( w, h );

  let light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 20, 20, 10 );
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  let d = 50;
  light.shadow.camera.left = -d;
  light.shadow.camera.right = d;
  light.shadow.camera.top = d;
  light.shadow.camera.bottom = -d;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 50;
  light.shadow.bias = 0.001;
  scene.add( light );
  scene.add( new THREE.AmbientLight( 0xababab ));

  // Plane
  let geometry = new THREE.PlaneGeometry( 250, 250, 128, 128 );
  let material = new THREE.MeshPhongMaterial( { wireframe: false, color: 0x666677 } );
  groundMesh = new THREE.Mesh( geometry, material );
  groundMesh.rotation.x = - Math.PI / 2;
  groundMesh.receiveShadow = true;
  scene.add( groundMesh );

  // Spline Curve
  curve = new THREE.SplineCurve( [
    new THREE.Vector2( -10, 0 ),
    new THREE.Vector2( -5, 5 ),
    new THREE.Vector2( 0, 0 ),
    new THREE.Vector2( 5, -5 ),
    new THREE.Vector2( 10, 0 ),
    new THREE.Vector2( 5, 10 ),
    new THREE.Vector2( -5, 10 ),
    new THREE.Vector2( -10, -10 ),
    new THREE.Vector2( -15, -8 ),
    new THREE.Vector2( -10, 0 ),
  ]);
  let points = curve.getPoints( 100 );
  geometry = new THREE.BufferGeometry().setFromPoints( points );
  material = new THREE.LineBasicMaterial( { color: 0xbb2222 } );
  splineObject = new THREE.Line( geometry, material );
  splineObject.rotation.x = Math.PI / 2;
  splineObject.position.y = 0.05;
  scene.add( splineObject );

  // Tank
  geometry = new THREE.BoxGeometry( 5, 2, 8 );
  material = new THREE.MeshPhongMaterial( { color: 0x8888ef } );

  tank = new THREE.Object3D();
  scene.add( tank );


  bodyMesh = new THREE.Mesh( geometry, material );
  bodyMesh.position.y = 1.5;
  bodyMesh.castShadow = true;
  tank.add( bodyMesh );

  tankCamera = makeCamera( 70 );
  tankCamera.position.set( 0, 3, -6 );
  tankCamera.rotation.y = Math.PI;
  bodyMesh.add( tankCamera );

  geometry = new THREE.CylinderGeometry( 1, 1, 0.5 );
  material = new THREE.MeshStandardMaterial( { color: 0x444444 } );
  wheels = [];
  for ( let i = 0; i < 6; i ++ ) {
    let wheel = new THREE.Mesh( geometry, material );
    wheel.rotation.z = Math.PI/2;
    wheel.position.x = ( ( i % 2 ) == 1 ? 3 : -3 );
    wheel.position.y = -0.5;
    wheel.position.z = ( Math.floor( i / 2 ) - 1 ) * 2.5;
    wheel.castShadow = true;
    wheels.push( wheel );
    bodyMesh.add( wheel );
    
  }
  turretPivot = new THREE.Object3D();
  turretPivot.position.set( 0, 1, 0);
  bodyMesh.add( turretPivot );

  geometry = new THREE.SphereGeometry( 2, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2 );
  material = new THREE.MeshPhongMaterial( { color: 0x8888ef } );
  domeMesh = new THREE.Mesh( geometry, material );
  domeMesh.position.y = 1;
  domeMesh.castShadow = true;
  bodyMesh.add( domeMesh );

  geometry = new THREE.BoxGeometry( 0.5, 0.5, 3 );
  turretMesh = new THREE.Mesh( geometry, material );
  turretMesh.position.set( 0, 0.5, 3 );
  turretMesh.castShadow = true;
  turretPivot.add( turretMesh );

  turretCamera = makeCamera()
  turretCamera.position.y = 1;
  turretMesh.add( turretCamera );

  targetMaterial = new THREE.MeshPhongMaterial( { color: 0x000000 } );
  geometry = new THREE.SphereGeometry( 0.5, 10, 10 );
  targetMesh = new THREE.Mesh( geometry, targetMaterial );
  targetMesh.castShadow = true;
  
  targetOrbit = new THREE.Object3D();
  targetElevation = new THREE.Object3D();
  targetElevation.position.y = 10;
  targetElevation.position.z = 10;
  targetBob = new THREE.Object3D();

  

  scene.add( targetOrbit );
  targetOrbit.add( targetElevation );
  targetElevation.add( targetBob );
  targetBob.add( targetMesh );

  targetCamera = makeCamera();
  targetCamera.position.set ( 0, 1, 2 );
  targetCamera.rotation.y = Math.PI;
  
  targetCameraPivot = new THREE.Object3D();
  targetBob.add( targetCameraPivot );
  targetCameraPivot.add( targetCamera );

  cameras = [
    { cam: camera, desc: 'detached camera' },
    { cam: turretCamera, desc: 'on turret looking at target' },
    { cam: targetCamera, desc: 'near target looking at tank' },
    { cam: tankCamera, desc: 'above back of tank' },
  ];
  controls = new OrbitControls( camera, canvas );
  stats = new Stats()
  document.querySelector('#app').append( stats.dom );

  window.addEventListener( 'resize', ( evt ) => { 
    let w = window.innerWidth;
    let h = window.innerHeight - nav.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize( w, h );
  });
}

function render( time ) {
  time *= 0.001;

  targetOrbit.rotation.y = time * .27;
  targetBob.position.y = Math.sin(time * 2) * 4;
  targetMesh.rotation.x = time * 7;
  targetMesh.rotation.y = time * 13;
  targetMaterial.emissive.setHSL(time * 10 % 1, 1, .25);
  targetMaterial.color.setHSL(time * 10 % 1, 1, .25);

  let tankTime = time * .05;
  curve.getPointAt( tankTime % 1, tankPosition );
  curve.getPointAt( (tankTime + 0.01  ) % 1, tankTarget );
  tank.position.set( tankPosition.x, 0, tankPosition.y );
  tank.lookAt( tankTarget.x, 0, tankTarget.y );

  wheels.forEach( ( obj ) => { obj.rotation.x = time * 3 });
 
  targetMesh.getWorldPosition( targetPosition );
  turretPivot.lookAt( targetPosition );

  turretCamera.lookAt( targetPosition );

  tank.getWorldPosition( targetPosition );
  targetCamera.lookAt( targetPosition );



  let camera = cameras[time * .25 % cameras.length | 0];
  infoElem.textContent = camera.desc;

  renderer.render( scene, camera.cam );
  controls.update();
  stats.update();
  requestAnimationFrame( render );
}