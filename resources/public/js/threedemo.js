import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r125/build/three.module.js"
import {GLTFLoader} from "https://threejsfundamentals.org/threejs/resources/threejs/r125/examples/jsm/loaders/GLTFLoader.js"

main();

function main() {
  const canvas = document.querySelector("#c");
  const renderer = new THREE.WebGLRenderer( {canvas} );
  //renderer.setSize( canvas.clientWidth, canvas.clientHeight);
  
  const fov = 75;
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const near = 0.1;
  const far = 10000;
  const camera = new THREE.PerspectiveCamera( fov, aspect, near, far );  
  camera.position.z = 30;
  camera.position.y = 20;
  camera.rotation.x = -30*Math.PI/180;
  
  const scene = new THREE.Scene();
  
  {
    const colour = 0xFFFFFF;
    const intensity = 5;
    const light = new THREE.DirectionalLight (colour, intensity );
    light.position.set (10, 20, 40 );
    scene.add( light );
  }
  
  const geometry = new THREE.BoxGeometry();
  //const material = new THREE.MeshPhongMaterial( {color: 0x55ddee} );
  const texture = new THREE.TextureLoader().load("img/initial.png");
  const material = new THREE.MeshPhongMaterial( {color: 0x2244dd, specularMap: texture, shininess: 30} );
  const cube = new THREE.Mesh( geometry, material );
  
  scene.add( cube );
  
  let model;

  const loader = new GLTFLoader();
  const url = '/models/viking_room/scene.gltf'; 
  loader.load( url, 
    (gltf) => {
      model = gltf.scene;
      scene.add( gltf.scene );
    },
    ( xhr ) => {
      console.log ( ( xhr.loaded / xhr.total + 100 ) + "% loaded");
    },
    ( error ) => {
      console.log ( 'An error happened' );
    }
  );

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize( width, height, false );
    }
    return needResize;
  }

  function animate() {

    if ( resizeRendererToDisplaySize( renderer ) ) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    if (typeof model !== 'undefined' ) { model.rotation.y += 0.01; }
    //cube.rotation.x += 0.01;
    //cube.rotation.y += 0.01;
    
    renderer.render(scene, camera);
    
    requestAnimationFrame(animate);
  }
  animate();
}

//"Viking room" (https://skfb.ly/VAKF) by nigelgoh is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).