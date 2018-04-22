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
var enemy1, enemy2;

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
var gameState = { camera: 1, length: 6, dir: 3, health: 1, score: 0, scene: "start", pause: false };

// Constants
var white = new THREE.Color(0xffffff);
var red = new THREE.Color(0xff0000);
var green = new THREE.Color(0x00ff00);
var blue = new THREE.Color(0x0000ff);
var yellow = new THREE.Color(0xffff00);

var snake = [];
var counter = 0;
var newCubePos;

var startScene, startCamera, startText;


//End Scene
var endScene2, endCamera2, endText2;


createOpenScene();
init();
animate();

//food
var food
var crunch
var hiss
/**
   Instantiate everything.
*/
function init() {
    initPhysijs();
    createEndScene2()
    initScene();
    initListeners();
    buildMainScene();
}

function createOpenScene(){

    startScene = new THREE.Scene();
    startText = createBackground('init.png',1);

    startScene.add(startText);
    var startlight = createPointLight();
    startlight.position.set(0,200,20);
    startScene.add(startlight);
    startCamera = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    startCamera.position.set(0,50,1);
    startCamera.lookAt(0,0,0);
}

function createPointLight(){
    var light;
    light = new THREE.PointLight( 0xffffff);
    light.castShadow = true;
    //Set up shadow properties for the light
    light.shadow.mapSize.width = 2048;  // default
    light.shadow.mapSize.height = 2048; // default
    light.shadow.camera.near = 0.5;       // default
    light.shadow.camera.far = 500      // default
    return light;
}

function createBackground(image,k){
    
    var planeGeometry = new THREE.PlaneGeometry( 210, 100, 128 );
    var texture = new THREE.TextureLoader().load( '../images/'+image );
    var planeMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
    planeMesh = new THREE.Mesh( planeGeometry, planeMaterial );
    startScene.add(planeMesh);
    planeMesh.position.x = 0;
    planeMesh.position.y = 0;
    planeMesh.position.z = 0;
    planeMesh.rotation.x = -Math.PI/2;
    planeMesh.receiveShadow = true;
    return planeMesh
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


    var audioListener = new THREE.AudioListener();
    camera.add(audioListener);
    crunch = new THREE.Audio(audioListener);
    var audioLoader = new THREE.AudioLoader();
    audioLoader.load( 'sounds/334209__sethroph__eating-crisps.wav', function( buffer ) {
	crunch.setBuffer( buffer );
	crunch.setVolume( 0.5 );
    });
    
    var audioListener2 = new THREE.AudioListener();
    camera.add(audioListener2);
    hiss = new THREE.Audio(audioListener2);
    var audioLoader2 = new THREE.AudioLoader();    
    audioLoader2.load( 'sounds/343927__reitanna__hiss2.wav', function( buffer ) {
	hiss.setBuffer( buffer );
	hiss.setVolume( 0.5 );
    });    
}

//Create End scene
function createEndScene2(){
    endScene2 = initScene2();
    endText2 = createSkyBox('youlose.jpg',10);
    endScene2.add(endText2);
    var light2 = createPointLight();
    light2.position.set(0,200,20);
    endScene2.add(light2);
    endCamera2 = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
    endCamera2.position.set(0,50,1);
    endCamera2.lookAt(0,0,0);
}

function initScene2(){
    //scene = new THREE.Scene();
    var scene = new Physijs.Scene();
    return scene;
}

function createSkyBox(image,k){
    // creating a textured plane which receives shadows
    var geometry = new THREE.SphereGeometry( 80, 80, 80 );
    var texture = new THREE.TextureLoader().load( './images/'+image );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set( k, k );
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff,  map: texture ,side:THREE.DoubleSide} );
    //var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    //var mesh = new THREE.Mesh( geometry, material );
    var mesh = new THREE.Mesh( geometry, material, 0 );

    mesh.receiveShadow = false;


    return mesh
    // we need to rotate the mesh 90 degrees to make it horizontal not vertical


}

function createPointLight(){
    var light;
    light = new THREE.PointLight( 0xffffff);
    light.castShadow = true;
    //Set up shadow properties for the light
    light.shadow.mapSize.width = 2048;  // default
    light.shadow.mapSize.height = 2048; // default
    light.shadow.camera.near = 0.5;       // default
    light.shadow.camera.far = 500      // default
    return light;
}

function placeFood() {
    // Find a random location that isn't occupied by the snake.
    var occupy = false;
    while (!occupy) {
	food.x = Math.floor(Math.random() * numCols);
	food.y = Math.floor(Math.random() * numRows);
	okay = true;
	for (var i = 0; i < snake.length; ++i) {
	    if (snake[i].x == food.x && snake[i].y == food.y) {
		occupy = false;
		break;
	    }
	}
    }
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
    var texture = new THREE.TextureLoader().load('./textures/clover.jpg');
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

function addMedBalls(numBalls){

    //for(i=0;i<numBalls;i++){
    var ball = createMedBall();
    x = 0;
    z = 0;
    var okay = false;
    while (!okay) {
        x = (randN(planeW)-planeW/2)*unit;
        z = (randN(planeH)-planeH/2)*unit;
        okay = true;
        for (var i = 0; i < snake.length; ++i) {
            if (snake[i].position.x == x && snake[i].position.z == z) {
		okay = false;
		break;
            }
        }
    }
    ball.position.set(x,0,z);
    console.log(x+" "+z)
    scene.add(ball);

    //Not working
    ball.addEventListener( 'collision',
    			   function( other_object, relative_velocity, relative_rotation, contact_normal ) {
    			       if (other_object==snake[0]){
    				   console.log("ball "+i+" hit the avatar");
    				   //soundEffect('good.wav');
    				   gameState.score += 1;  // add one to the score
				   crunch.play();
    				   // make the ball drop below the scene ..
    				   // threejs doesn't let us remove it from the schene...
    				   this.position.y = this.position.y - 100;
    				   this.__dirtyPosition = true;
    			       }
    			   }
    			 )
    //}
    return ball;
}

function randN(n){
    return Math.floor(Math.random()*n);
}

function createMedBall(){
    var geometry = new THREE.SphereGeometry( unit/2, 10, 10);
    var material = new THREE.MeshLambertMaterial( { color: 0x0D0DD7} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.BoxMesh( geometry, material );
    mesh.setDamping(0.1,0.1);
    mesh.castShadow = true;
    return mesh;
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
    
    enemy1 = addNewEnemy(1);
    enemy2 = addNewEnemy(1);

    for (i=0; i<gameState.length; i++) {
	var snakeCube = addPhysCube(i*unit-unit/2,0,0, white);
	setSelfCol(snakeCube);
	snake.push(snakeCube);
    }

    food = addMedBalls(1)
    // Loading the object slows down the application by a considerable amount...
    //loadApple();
}

function setSelfCol(cube) {
    console.log("I am here");
    cube.addEventListener( 'collision',
			   function( other_object, relative_velocity, relative_rotation, contact_normal ) {
			       console.log(other_object);
			       for (c in snake) {
				   if (other_object== c){
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
    if (gameState.scene == "start" && event.key == "p") {
	gameState.scene = "main";
	return;
    }
    
    if (gameState.scene == "youlose" && event.key == "r") {
	gameState.scene = "start";
	return;
    }

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
    case "ArrowRight":
	if (gameState.dir != 3) {
	    gameState.dir = 1;
	}
	break;
    case "ArrowDown":
	if (gameState.dir != 4) {
	    gameState.dir = 2;
	}
	break;
    case "ArrowLeft":
	if (gameState.dir != 1) {
	    gameState.dir = 3;
	}
	break;
    case "ArrowUp":
	if (gameState.dir != 2) {
	    gameState.dir = 4;
	}
	break;
    case "Escape":
	gameState.pause = !gameState.pause;
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
    newCubePos = pos;
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

function EnmOutOfBound(enm1,enm2) {
    return (enm1.position.x <= west+unit/2 || enm1.position.x >= east-unit/2
	    || enm1.position.z <= north+unit/2 || enm1.position.z >= south-unit/2 ||
	    enm2.position.x <= west+unit/2 || enm2.position.x >= east-unit/2
	    || enm2.position.z <= north+unit/2 || enm2.position.z >= south-unit/2
	   );
}

function createSphere(){
    //var geometry = new THREE.SphereGeometry( 4, 20, 20);
    var geometry = new THREE.SphereGeometry( 5, 10, 10);
    var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.5);
    var mesh = new Physijs.SphereMesh( geometry, material );
    mesh.setDamping(0.1,0.1);
    mesh.castShadow = true;
    return mesh;
}


function createBall(){
    //var geometry = new THREE.SphereGeometry( 4, 20, 20);
    var geometry = new THREE.SphereGeometry( 1, 16, 16);
    var material = new THREE.MeshLambertMaterial( { color: 0xffff00} );
    var pmaterial = new Physijs.createMaterial(material,0.9,0.95);
    var mesh = new Physijs.BoxMesh( geometry, pmaterial );
    mesh.setDamping(0.1,0.1);
    mesh.castShadow = true;
    return mesh;
}


function addNewEnemy(numBalls){

    //for(i=0;i<numBalls;i++){
    var ball = createSphere();
    x = 0;
    z = 0;
    var okay = false;
    while (!okay) {
        x = randN(50)+15;
        z = randN(50)+15;
        okay = true;
        for (var i = 0; i < snake.length; ++i) {
            if (snake[i].position.x == x && snake[i].position.z == z) {
		okay = false;
		break;
            }
        }
    }
    ball.position.set(x,0,z);
    scene.add(ball);

    ball.addEventListener( 'collision',
    			   function( other_object, relative_velocity, relative_rotation, contact_normal ) {
    			       if (other_object==snake[0]){
    				   console.log("enemy "+i+" hit the snake");
    				   gameState.score -= 1;  // add one to the score
    				   // make the ball drop below the scene ..
    				   // threejs doesn't let us remove it from the schene...
    				   this.position.y = this.position.y - 100;
    				   this.__dirtyPosition = true;
    			       }
    			   }
    			 )
    //}
    return ball;
}

function moveEnemy() {

    enemy1.position.x -=  unit;
    enemy2.position.z -= unit;
    if (enemy1.position.x < west) {
	enemy1.position.x += unit;
	// enemy1.position.set(Math.floor(Math.random() * numCols),
	//   Math.floor(Math.random() * numRows),0) ;
	enemy1.position.set(0,0,0)
	// += 2* unit
    } 

    if (enemy2.position.z < north) {
	// enemy1.position.x += 2* unit;
	// enemy1.position.set(Math.floor(Math.random() * numCols),
	//   Math.floor(Math.random() * numRows),0) ;
	enemy2.position.set(0,0,0)
	enemy2.position.z += unit;
	// += 2* unit
    } 

    //    if (EnmOutOfBound) {
    // enemy1.position.x += unit;
    // enemy2.position.z += unit;
    //   }

}

function loadApple() {
    var loader = new THREE.OBJLoader();
    loader.load("../models/apple/Manzana.obj",
		function(obj) {
		    console.log("loading obj file");
		    obj.scale.x=0.005;
		    obj.scale.y=0.005;
		    obj.scale.z=0.005;
		    food.add(obj);
		},
		function(xhr){
		    console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );},

		function(err){
		    console.log("error in loading: "+err);}
	       )
}

/**
   Calls relevent functions to animate the game and update state.
*/
function animate() {
    requestAnimationFrame(animate);
    //  cubeWhite.rotation.y += 0.1;
    
    if (gameState.scene == "youlose") {
	endScene2 = initScene2();
	endText2 = createSkyBox('youlose.jpg',10);
	endScene2.add(endText2);
	var light2 = createPointLight();
	light2.position.set(0,200,20);
	endScene2.add(light2);
	endCamera2 = new THREE.PerspectiveCamera( 90, window.innerWidth / window.innerHeight, 0.1, 1000 );
	endCamera2.position.set(0,50,1);
	endCamera2.lookAt(0,0,0);
    }
    
    if (gameState.scene == "main") {
	if (gameState.pause) {
	    setCamera();
	    renderer.render(scene, camera);
	    var info = document.getElementById("info");
	    info.innerHTML='<div style="font-size:24pt">*paused* Camera: ' + gameState.camera  + '.  Press 1, 2, or 3 to change camera.  Press esc to resume.</div>';	    	    
	} else {
	    setCamera();
	    counter++;
	    if (counter == 10) {
		moveSnake();
		counter = 0;
		moveEnemy()
	    }

	    if (Math.abs(food.position.x - snake[0].position.x) <= 10 && Math.abs(food.position.z - snake[0].position.z) <= 10) {
		gameState.score++;
		console.log("adding new cube");
		crunch.play();
		var snakeCube = addPhysCube(newCubePos.x,0,newCubePos.z, white);
		setSelfCol(snakeCube);
		snake.push(snakeCube);
		gameState.length++;
		food.position.y = food.position.y - 1000;
		food.__dirtyPosition = true;
		food = addMedBalls(1);
	    }


	    //console.log(snake[1])
	    for (var i = 1; i < snake.length; ++i) {
		if (snake[i].position.x == snake[0].position.x && snake[i].position.y == snake[0].position.y && snake[i].position.z == snake[0].position.z) {
		    gameState.health = gameState.health - 100;
		    break;
		}
		
		if (Math.abs(enemy1.position.x - snake[i].position.x) <= 10 && Math.abs(enemy1.position.z - snake[i].position.z) <= 10) {
		    hiss.play();
		    gameState.health = -1;
		    if (gameState.health == 0) {
			gameState.scene = 'youlose';
		    }
    		    // createEndScene2();
		    break;
		}

		if (Math.abs(enemy2.position.x - snake[i].position.x) <= 10 && Math.abs(enemy2.position.z - snake[i].position.z) <= 10) {
     		    // gameState.health--;
    		    // gameState.scene = 'youlose';
    		    // createEndScene2();
		    hiss.play();
      		    gameState.health = -1;
      		    if (gameState.health < 0) {
        		gameState.scene = 'youlose';
      		    }
    		    break;
		}
	    }

	    if (gameState.health <= 0) {
		endText2.rotateY(0.005);
		renderer.render(endScene2, endCamera2 );
		var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + '  Health: 0' +'</div>';
	    } else {
		renderer.render(scene, camera);
		var info = document.getElementById("info");
		info.innerHTML='<div style="font-size:24pt">Score: ' + gameState.score + '  Health: ' + gameState.health +'</div>';
	    }
	}

    } else if (gameState.scene == "start") {
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.render( startScene, startCamera );
    }
}
