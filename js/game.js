/**
    JavaScript for the main game.
*/

// Objects
var renderer, scene;
var camera;
var ground;
var cubeWhite, cubeRed;
var lightA, lightB;
var clock;

// Measurements
var unit = 10; // unit for the "grid", used in the calculation of the cube, ground
var planeW = 30;
var planeH = 20;
var camHeight = 150; // unit for the distance that the camera is from the origin
var north = unit * (-planeH / 2);
var east = unit * (planeW / 2);
var west = unit * (-planeW / 2);
var south = unit * (planeH / 2);

// Misc. state
var gameState = { camera: 1, length: 6, dir: 3, health: 3};

// Constants
var white = new THREE.Color(0xffffff);
var red = new THREE.Color(0xff0000);
var green = new THREE.Color(0x00ff00);
var blue = new THREE.Color(0x0000ff);
var yellow = new THREE.Color(0xffff00);

var snake = [];
var counter = 0;

init();
animate();

/**
   Instantiate everything.
*/
function init() {
    initPhysijs();
    initScene();
    initListeners();
    buildMainScene();
}

/**
   Physijs scripts.
*/
function initPhysijs() {
    Physijs.scripts.worker = '/js/physijs_worker.js';
    Physijs.scripts.ammo = '/js/ammo.js';
}

/**
   Instantiate elements required for a basic THREE.js scene: the scene, renderer, camera, and DOM elements.
*/
function initScene() {
    scene = new Physijs.Scene();

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    moveCamera(0, camHeight, 0);
}

/**
   Create event listeners to respond to operations.
*/
function initListeners() {
    clock = new THREE.Clock();
    clock.start();
    window.addEventListener('keydown', keydown);
}

/**
   Move the camera to coordinates.  Set camera to look at the origin.
*/
function moveCamera(x, y, z) {
    camera.position.set(x, y, z);
    camera.lookAt(0,0,0);
}

/**
   Build and add lights to the scene.
*/
function addLighting() {
    lightA = new THREE.PointLight(0xffffff);
    lightA.castShadow = true;
    lightA.shadow.mapSize.width = 2048;
    lightA.shadow.mapSize.height = 2048;
    lightA.shadow.camera.near = 0.5;
    lightA.shadow.camera.far = 500;
    lightA.position.set(0,200,20);
    scene.add(lightA);

    lightB = new THREE.AmbientLight(0xffffff, 0.25);
    scene.add(lightB);
}

/**
   Builds a cube and adds it to the scene.
*/
function addCube(x, y, z, col) {
    var geometry = new THREE.BoxGeometry(unit, unit, unit);
    var material = new THREE.MeshBasicMaterial({ color: col });
    var cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cube.position.set(x,y,z);
    return cube;
}

function addPhysCube(x, y, z, col) {
  var geometry = new THREE.BoxGeometry(unit, unit, unit);
  var material = new THREE.MeshBasicMaterial({ color: col });
  var pmaterial = new Physijs.createMaterial(material, 0.9, 0.05);
  var cube = new Physijs.BoxMesh( geometry, pmaterial );
  scene.add(cube);
  cube.position.set(x,y,z);
  return cube;
}

/**
   Builds the ground and adds it to the scene.
*/
function addGround() {
    var geometry = new THREE.PlaneGeometry(unit * planeW + unit, unit * planeH + unit);
    var texture = new THREE.TextureLoader().load('../textures/clover.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    var material = new THREE.MeshLambertMaterial({ color: 0xffffff,  map: texture, side: THREE.DoubleSide });
    var pmaterial = new Physijs.createMaterial(material, 0.9, 0.05);
    ground = new Physijs.BoxMesh(geometry, pmaterial, 0);
    ground.receiveShadow = true;
    ground.rotateX(Math.PI/2);
    ground.position.setY(-unit / 2);
    scene.add(ground);
}

/**
   Calls relevent "add" functions to build the main scene.
*/
function buildMainScene() {
    addLighting();
    addGround();
  //  cubeWhite = addCube(0,0,0, white);

    // Corners of the ground plane


    cubeRed = addCube(west, 0, south, red);
    cubeGreen = addCube(west, 0, north, green);
    cubeBlue = addCube(east, 0, north, blue);
    cubeYellow = addCube(east, 0, south, yellow);

    for (i=0; i<gameState.length; i++) {
      var snakeCube = addPhysCube(i*unit,0,0, white);
      setSelfCol(snakeCube);
      snake.push(snakeCube);
    }
}

function setSelfCol(cube) {
  cube.addEventListener( 'collision',
		function( other_object, relative_velocity, relative_rotation, contact_normal ) {
      console.log(other_object);
      for (c in snake) {
        if (other_object==snake[c]){
          gameState.health --;
          if (gameState.health == 0) {
            console.log("self collision")
            gameState.scene = 'youlose';
          }
        }
      }
		})
}

/**
   Responses to keydown events go here.
*/
function keydown(event) {
    console.log("Keydown: " + event.key);
    switch(event.key) {
	// Switch the cameras
    case "1":
	gameState.camera = 1;
	break;
    case "2":
	gameState.camera = 2;
	break;
    case "3":
	gameState.camera = 3;
	break;
  case "d":
  if (gameState.dir != 3) {
    gameState.dir = 1;
  }
  break;
  case "s":
  if (gameState.dir != 4) {
    gameState.dir = 2;
  }
  break;
  case "a":
  if (gameState.dir != 1) {
    gameState.dir = 3;
  }
  break;
  case "w":
  if (gameState.dir != 2) {
    gameState.dir = 4;
  }
  break;
    }
}

/**
   Changes the position of the overhead camera.
*/
function setCamera() {
    switch(gameState.camera) {
    case 1:
	moveCamera(0, camHeight, 0);
	break;
    case 2:
	moveCamera(0, camHeight, camHeight);
	break;
    case 3:
	moveCamera(camHeight, camHeight, camHeight);
	break;
    }
}

function moveSnake() {
  var pos = [snake[0].position.x, snake[0].position.y, snake[0].position.z];
  moveHead();
  for (i = 1; i < gameState.length; i++) {
    var temp = [snake[i].position.x, snake[i].position.y, snake[i].position.z];
    snake[i].position.set(pos[0], pos[1], pos[2]);
    pos = temp;
  }
}

function moveHead() {
  switch(gameState.dir) {
    case 1:
    snake[0].position.x += unit;
    break;
    case 2:
    snake[0].position.z += unit;
    break;
    case 3:
    snake[0].position.x -= unit;
    break;
    case 4:
    snake[0].position.z -= unit;
    break;
  }
  if (outOfBound(0)) {
    gameState.health --;
    console.log("out of bound")
    if (gameState.health == 0) {
      gameState.scene = 'youlose';
    }
  }
}

function outOfBound(i) {
  return (snake[i].position.x <= west+unit/2 || snake[i].position.x >= east-unit/2
    || snake[i].position.z <= north+unit/2 || snake[i].position.z >= south-unit/2);
}

/**
   Calls relevent functions to animate the game and update state.
*/
function animate() {
    requestAnimationFrame(animate);
  //  cubeWhite.rotation.y += 0.1;
    setCamera();
    counter++;
    if (counter == 50) {
      moveSnake();
      counter = 0;
    }
    renderer.render(scene, camera);
}
