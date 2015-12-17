'use strict';

var socket = io.connect('http://localhost:8000');

import spaceObject from './modules/spaceObject';

let camera, scene, renderer;

let planet, laser;
let laserActive = false;
let laserCooldown = false;
var rot = 0;

var stats = new Stats();

let spaceObjects = [];

let spaceObjectsToCollect = [3, 4, 5, 6];
let spaceObjectsProgress = [];
let spaceObjectsCollected = [];

let previousSpawnTime = performance.now();

let currentPos = 0;

let stopped = false;

let nextId = 0;

var leftPadPressed = true;
var rightPadPressed = true;

let speed = 0;

const init = () => {

  // Performance monitor voor development
  stats.setMode( 0 ); // 0: fps, 1: ms, 2: mb

  socket.emit('lightStatus', 'laserLedon');

  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );
  camera.rotation.set( 0, 0, 0 );
  camera.position.set(0, 490, 0);

  scene = new THREE.Scene();
  scene.fog = new THREE.Fog( 0x000000, 0, 750 );

  var hemiLight = new THREE.HemisphereLight( 0x3366ff, 0x3366ff, 0.4 );
  hemiLight.position.set( 0, 800, 0 );
  scene.add( hemiLight );

  var dirLight = new THREE.DirectionalLight( 0xffcc66, 0.6 );
  dirLight.position.set( 100, 600, 200 );
  dirLight.position.multiplyScalar( 50);
  dirLight.castShadow = true;
  dirLight.shadowDarkness = 0.5;
  dirLight.name = 'dirlight';
  dirLight.shadow = true;

  scene.add( dirLight );

  socket.on('notification', (data) =>{

    switch ( data.trim() ) {

    case 'q': // q

      if(rightPadPressed){
        speed += 0.001;

        leftPadPressed = true;
        rightPadPressed = false;
      }

      break;

    case 'd': // d
      if(leftPadPressed){
        speed += 0.001;

        rightPadPressed = true;
        leftPadPressed = false;
      }

      break;

    case 'z': //L

      if(!laserCooldown){
        laserActive = true;
        socket.emit('lightStatus', 'laserLedoff');

        setTimeout(function(){
          laserActive = false;

          laserCooldown = true;
          setTimeout(function(){
            laserCooldown = false;
            socket.emit('lightStatus', 'laserLedon');
          }, 5000);

        }, 600);

      }

      break;

    /*case 'x': //Launch
      if(!laserCooldown){
        laserActive = true;
      }

      break;*/

    case 'l': // left
      if(currentPos > -1){
        currentPos -= 1;
        stopped = false;
      }

      break;

    case 'r': // right
      if(currentPos < 1){
        currentPos += 1;
        stopped = false;
      }

      break;
    }
  });

  let loader1 = new THREE.ColladaLoader();

  loader1.load(
    // resource URL
    './assets/planet.dae',
    // Function when resource is loaded
    ( collada ) => {
      planet = collada.scene;
      scene.add( planet );
      planet.castShadow = true;
      planet.receiveShadow = false;
      planet.scale.set(1, 1, 1);
    }
  );

  let loader7 = new THREE.ColladaLoader();

  loader7.load(
    // resource URL
    './assets/laser.dae',
    // Function when resource is loaded
    ( collada ) => {
      laser = collada.scene.children[0].children[0];
      console.log(laser);

      let laserMaterial = new THREE.MeshLambertMaterial({
        color: 0xccffcc,
        transparent: true,
        opacity: 0,
        emissive: new THREE.Color( 0.3, 0.8, 0.3 )
      });

      laser.material = laserMaterial;

      scene.add( laser );
      laser.rotation.set(0, 0, 0);
      laser.scale.set(99, 99, 99);
    }
  );

  //
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
  renderer.shadowMap.Enabled = true;
  renderer.setClearColor( 0x000000, 0 );
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  renderer.autoClear = false;

  window.addEventListener( 'resize', onWindowResize, false );

};

const onWindowResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
};

const animate = () => {

  requestAnimationFrame( animate );

  stats.begin(); // Begin van te monitoren code

  if(performance.now() - previousSpawnTime >= 3000){

    let random = Math.floor(Math.random() * 10) + 1;

    if(random <= 3){

      if(spaceObjectsToCollect.length >= 1){
        let part = new spaceObject(
          spaceObjectsToCollect[0],
          nextId
        );
        spaceObjects.push(part);

        spaceObjectsProgress.push(spaceObjectsToCollect[0]);
        spaceObjectsToCollect.splice(0, 1);

        console.log(spaceObjectsToCollect);
        console.log(spaceObjectsProgress);
        console.log(spaceObjectsCollected);

        nextId++;
      }

    }else{
      let stone = new spaceObject(
        2,
        nextId
      );
      spaceObjects.push(stone);
      nextId++;
    }

    previousSpawnTime = performance.now();
  }

  spaceObjects.forEach( (e) => {

    //ongerenderde objecten renderen
    if(e.render() && !e.loaded){
      scene.add(e.render());
      e.loaded = true;
    }

    //rotatie aanpassen
    if(!stopped){
      e.update(speed);
    }

    //voorbije objecten deleten
    if(e.deletable){
      let selectedObject = scene.getObjectByName(e.id);
      scene.remove( selectedObject );
      spaceObjects.splice(e, 1);

      if( (e.type === 3) || (e.type === 4) || (e.type === 5) || (e.type === 6)){
        spaceObjectsProgress.splice(spaceObjectsToCollect.indexOf(e.type), 1);
        spaceObjectsToCollect.push(e.type);

        console.log(spaceObjectsToCollect);
        console.log(spaceObjectsProgress);
        console.log(spaceObjectsCollected);
      }
    }

    //collisions checken
    if((e.hPosition === currentPos) && e.collided){
      if(e.type === 2){
        stopped = true;
      }else if( (e.type === 3) || (e.type === 4) || (e.type === 5) || (e.type === 6)){
        let selectedObject = scene.getObjectByName(e.id);
        scene.remove( selectedObject );
        spaceObjects.splice(e, 1);

        spaceObjectsProgress.splice(spaceObjectsToCollect.indexOf(e.type), 1);
        spaceObjectsCollected.push(e.type);

        switch (spaceObjectsCollected.length) {
          case 1:
          socket.emit('lightStatus', 'partled1on' );
          break;
          case 2:
          socket.emit('lightStatus', 'partled2on' );
          break;
          case 3:
          socket.emit('lightStatus', 'partled3on' );
          break;
          case 4:
          socket.emit('lightStatus', 'partled4on' );
          allparts = true;
          //socket.emit('lightStatus', 'launchLedon');
          break;
        }

        console.log(spaceObjectsToCollect);
        console.log(spaceObjectsProgress);
        console.log(spaceObjectsCollected);
      }
    }

  });

  if(!stopped){
    rot += speed;
  }

  if(planet && !stopped){
    planet.rotation.set(rot, 0, 0);
  }

  if(speed >= 0){
    speed = speed/1.03;
  }

  if(laserActive && laser){

    stopped = false;

    laser.material.opacity = 0.9;

    spaceObjects.forEach( (e) => {

      if((e.hPosition === currentPos) && (e.type === 2)){
        let selectedObject = scene.getObjectByName(e.id);
        scene.remove( selectedObject );
        spaceObjects.splice(spaceObjects.indexOf(e), 1);
      }

    });

  }else if(laser){
    laser.material.opacity = 0;
  }

  if(camera.position.x < (16*currentPos)){
    let val = ((16*currentPos) - camera.position.x)/8;
    camera.position.x += val;
    if(laser){
      laser.position.x += val;
    }
  }else if(camera.position.x > (16*currentPos)){
    let val = (camera.position.x - (16*currentPos))/8;
    camera.position.x -= val;
    if(laser){
      laser.position.x -= val;
    }
  }

  renderer.clear();
  renderer.render(scene, camera);

  stats.end();
};

init();
animate();
