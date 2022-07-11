import * as THREE from "three";

import Stats from 'three/examples/jsm/libs/stats.module';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

const container =  document.createElement( 'div' );
document.body.appendChild( container );

let camera, scene, renderer;

let clock;

function InitializeSceneAssets(callback) {
    
    callback ? callback():'';
}

InitializeSceneAssets(async ()=>{

    await init();
    animate();
    
})

//unity start function
async function init() {

    clock = new THREE.Clock();
        
    camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
    camera.position.set( 0, 1.6, 3 );
    
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0x505050 );

    scene.add( new THREE.HemisphereLight( 0x606060, 0x404040 ) );

    const light = new THREE.DirectionalLight( 0xffffff );
    light.position.set( 1, 1, 1 ).normalize();
    scene.add( light );
        
    renderer = new THREE.WebGLRenderer({ antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.outputEncoding = THREE.sRGBEncoding;
    
    container.appendChild( renderer.domElement );
    
    controls = new OrbitControls( camera, renderer.domElement );
    controls.target.set(0, 1.6, 0);
    controls.update();
    
    // stats = new Stats();
    // container.appendChild( stats.dom );
    
    initScene();
    setupXR();

    onWindowResize();
    
    window.addEventListener('resize', onWindowResize );
    //renderer.setAnimationLoop( render.bind(this) );

}

function random( min, max ){
    return Math.random() * (max-min) + min;
}

function initScene(){

    //metric scale , radius 0.08 = 8 cm / 1unit = 1 meter

    let radius = 0.08;
    
    let room = new THREE.LineSegments(
        new BoxLineGeometry(6,6,6,10,10,10),
        new THREE.LineBasicMaterial({color: 0x808080 })
    );
    room.geometry.translate(0, 3, 0);
    scene.add(room);

    const geometry = new THREE.IcosahedronBufferGeometry(radius, 2);

    for(let i=0; i<200; i++){
        const object = new THREE.Mesh(
            geometry,
            new THREE.MeshLambertMaterial(
                {
                    color: Math.random()* 0xFFFFFF
                }
            )
        );

        object.position.x = random(-2, 2);
        object.position.y = random(-2, 2);
        object.position.z = random(-2, 2);

        room.add(object);
    }


}

function setupXR(){
    renderer.xr.enable = true;
    document.body.appendChild( VRButton.createButton( renderer ) );
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
    
    requestAnimationFrame( animate );
    render();
    stats.update();

}

function render() {

    renderer.render( scene, camera );

}



