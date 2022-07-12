import * as THREE from "three";

import Stats from 'three/examples/jsm/libs/stats.module';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

const container =  document.createElement( 'div' );
document.body.appendChild( container );

let camera, scene, renderer, controls;
// const controllers =[];
let controller;

let clock;

var highlight;
let room ;

var raycaster = new THREE.Raycaster();
var workingMatrix = new THREE.Matrix4();
var woringVextor = new THREE.Vector3();


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
    // shows stats fps panel
    container.appendChild( stats.dom );
    
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
    
    room = new THREE.LineSegments(
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

    highlight = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color:  0xFFFFFF,
        side: THREE.BackSide
    }));
    highlight.scale.set(1.2, 1.2, 1.2);
    scene.add(highlight);

}

function setupXR(){

    renderer.xr.enabled = true;
    document.body.appendChild( VRButton.createButton( renderer ) );
``
    function onSelectStart(){

        this.userData.selectPressed  = true;
        if(spotlight)spotlight.visible = true;
    
    }
    
    function onSelectEnd(){

        highlight.visible = false;
        this.userData.selectPressed  = false;
        if(spotlight)spotlight.visible = false;
    
    }

    controller = renderer.xr.getController(0);
    controller.addEventListener('selectstart', onSelectStart);
    controller.addEventListener('selectend', onSelectEnd);
    controller.addEventListener('connected', function ( event ) {

        buildController.call(self, event.data );

    } );

    controller.addEventListener('disconnected', function () {

        while(children.length>0)remove( children[ 0 ] );
            controller = null;
    } );

    scene.add(controller);
    scene.add(highlight);

}


function buildController(data, controller){
    let geometry, material, loader;

    switch(data.targetRayMode){

        case 'tracked-pointer':
            //code here
            let loader = new GLTFLoader().setPath('../staticAsset/');

            loader.load('flash-light.glb',
                ( gltf ) => {
                    controller.add(gltf.scene);
                },
                null,
                (error) => {
                        console.error('An error');
                }
            )

            break;

        case 'gaze':
            
            geometry = new THREE.RingBufferGeometry( 0.02, 0.04, 32 ).translate( 0, 0, - 1 );
            material = new THREE.MeshBasicMaterial( { opacity: 0.5, transparent: true } );
            controller.add( new THREE.Mesh( geometry, material ) )

    }

}

function handleController(controller){
    if(controller.userData.selectPressed){
        // controller.children[0].scale.z = 10;
        
        workingMatrix.identity().extractRotation(controller.matrixWorld);

        raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
        raycaster.ray.direction.set( 0, 0, -1).applyMatrix4(workingMatrix);

        const intersects = raycaster.intersectObjects(room.children);

        if(intersects.length>0){
            intersects[0].object.add(highlight);
            highlight.visible = true;
            // controller.children[0].scale.z = intersects[0].distance;
        }else{
            highlight.visible = false;
        }

    }

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {

    renderer.setAnimationLoop( render );

    // in vr cannot use this 
    // requestAnimationFrame( animate );

    render();
    stats.update();

}

function render() {
    
    /*
    if (vrControllers ){
        // const self = this;
        vrControllers.forEach( ( controller) => { 
            handleController( controller ) 
        });
    }
    */

    if(controller)handleController(controller);
    
    renderer.render( scene, camera );

}



