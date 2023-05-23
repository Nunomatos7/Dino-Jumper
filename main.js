import * as THREE from 'three';
import {GLTFLoader} from "https://cdn.rawgit.com/mrdoob/three.js/master/examples/jsm/loaders/GLTFLoader.js";

// Create a scene
const scene = new THREE.Scene();


// Create a camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Set the camera position
camera.position.set(-4, 1, -6);
camera.lookAt(0, 0, 0);


// Create a renderer
const renderer = new THREE.WebGLRenderer();

// Set the renderer size
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the renderer to the HTML document
document.body.appendChild(renderer.domElement);

// Set the window size to fit the screen
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  './xpos.png',
  './xneg.png',
  './ypos.png',
  './yneg.png',
  './zpos.png',
  './zneg.png'
]);

scene.background = texture;
scene.environment = null;

// Create a cube
const geometry = new THREE.BoxGeometry();

const groundGeometry = new THREE.PlaneGeometry(3000, 10, 1, 1);

// add texture to cube
const textureLoader = new THREE.TextureLoader();

let frog;

const loader1 = new GLTFLoader();
loader1.load('./Frog.glb', function(gltf) {
    frog = gltf.scene; // Assign the loaded gltf.scene to the variable
    
    // Set the frog's position
    frog.position.set(0, geometry.parameters.height / 2 + groundGeometry.parameters.height, 0);

    frog.castShadow = true;
    frog.receiveShadow = true;
   
    frog.position.x = 0;
    frog.position.z = 0;

    // turn the frog 90 degrees
    frog.rotation.y = Math.PI / 2;

    // Add the frog to the scene
    scene.add(frog);
});




// Create a container object for the line and obstacles
const container = new THREE.Object3D(); 
scene.add(container);

// Create a ground
const groundMaterial = new THREE.MeshPhongMaterial({
 
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.receiveShadow = true;
renderer.shadowMap.enabled = true;

// Set the ground position
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.5;

//add texture to ground
const texture3 = textureLoader.load('./water.png');
groundMaterial.map = texture3;

// Add the ground to the scene
scene.add(ground);



// Create an ambient light
const ambientLight = new THREE.AmbientLight('rgb(255, 255, 255)', 0.2);
scene.add(ambientLight);

// Create a spotlight
const spotLight = new THREE.SpotLight('rgb(0, 255, 255)', 0.8);
spotLight.position.set(-5, 30, 0);
scene.add(spotLight);

// Create a second spotlight
const spotlight2 = new THREE.SpotLight(0xffffff, 1, 100, Math.PI / 4, 0.5);
spotlight2.position.set(-10, 9, 2);
spotlight2.target.position.set(0, 0, 0);
spotlight2.castShadow = true;
spotlight2.shadow.mapSize.width = 1024;
spotlight2.shadow.mapSize.height = 1024;
spotlight2.shadow.camera.near = 0.1;
spotlight2.shadow.camera.far = 100;
scene.add(spotlight2);

spotlight2.shadow.mapSize.width = 1024;
spotlight2.shadow.mapSize.height = 1024;
spotlight2.shadow.camera.near = 0.1;
spotlight2.shadow.camera.far = 100;


// Create a line
const lineGeometry = new THREE.BufferGeometry();
const lineMaterial = new THREE.LineBasicMaterial({});
const line = new THREE.Line(lineGeometry, lineMaterial);

// Add the line to the container object
container.add(line);

// Create obstacles
const obstacles = [];

const obstacleGeometry = new THREE.BoxGeometry();
const obstacleMaterial = new THREE.MeshPhongMaterial({
});
// add texture to obstacles
const texture4 = textureLoader.load('./UndergroundEarth(horizontallyseamless).png');
obstacleMaterial.map = texture4;



let i = 0;
while (i < 100) {
    i++;
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);

    // Set position for the obstacles on the line
    const distanceBetweenObstacles = 8;
    obstacle.position.x = -2 + i * distanceBetweenObstacles;
    obstacle.position.y = -0.5;
    obstacle.scale.set(Math.random() * 1 + 0.5, Math.random() * 1 + 0.5, Math.random() * 1 + 0.5);

     // Add random rotation to the obstacle
     obstacle.rotation.x = Math.random() * Math.PI * 2;
     obstacle.rotation.y = Math.random() * Math.PI * 2;
     obstacle.rotation.z = Math.random() * Math.PI * 2;

    // Add obstacles to the container object
    container.add(obstacle);

    obstacles.push(obstacle);
}



let isJumping = false;
let isFrogJumping = false;
let jumpHeight = 3;
let jumpDuration = 1000;
let jumpStart = null;
let savedJumpStart = null;
let savedJumpY = null;

let startGame=false;

function frogJump() {
    if (!isFrogJumping) {
        isFrogJumping = true;
        jumpStart = Date.now();
    }
}


// Create a variable to track whether the game is paused
let isPaused = false;
let savedFrogPosition = null;
let savedObstacleStates = null;
let savedJumpState = null;





// Define a function to save the game state
function saveGameState() {
    // Save the position of the cube
    savedFrogPosition = frog.position.clone();
  

  
    // Save the jump state
    if (isFrogJumping) {
      savedJumpStart = jumpStart;
      savedJumpY = frog.position.y;
    } else {
      savedJumpStart = null;
      savedJumpY = null;
    }

    // Save the position and rotation of each obstacle
    savedObstacleStates = [];
    for (let obstacle of obstacles) {
        let savedObstacleState = {
            position: obstacle.position.clone(),
            rotation: obstacle.rotation.clone()
        };
        savedObstacleStates.push(savedObstacleState);
    }

    // Save the jump state
    savedJumpState = {
        isFrogJumping: isFrogJumping,
        jumpStart: jumpStart,
        jumpHeight: jumpHeight,
        jumpDuration: jumpDuration
    };
}

// Define a function to resume the game state
function resumeGameState() {
    // Set the position of the cube
    frog.position.copy(savedFrogPosition);


    // Set the position and rotation of each obstacle
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].position.copy(savedObstacleStates[i].position);
        obstacles[i].rotation.copy(savedObstacleStates[i].rotation);
    }

    // Set the jump state
    isFrogJumping = savedJumpState.isFrogJumping;
    jumpStart = savedJumpState.jumpStart;
    jumpHeight = savedJumpState.jumpHeight;
    jumpDuration = savedJumpState.jumpDuration;
    
}

// Add a keydown event listener to the window object
window.addEventListener("keydown", (event) => {
    if (event.key === "p") {
        isPaused = !isPaused;

        if (isPaused) {
            // Save the game state
            saveGameState();

            // Show the pause screen
            var pauseScreen = document.getElementById("pause-screen");
            pauseScreen.style.display = "block";
        } else {
            // Hide the pause screen
            var pauseScreen = document.getElementById("pause-screen");
            pauseScreen.style.display = "none";

            // Resume the game state
            resumeGameState();

            // Request a new animation frame
            requestAnimationFrame(animate);
        }
    }
});



/*
// Add a click event listener to an HTML button element
const button = document.querySelector("#unpause-button");
button.addEventListener("click", () => {
    isPaused = false;
    requestAnimationFrame(animate);
});
*/

// Animate the scene
function animate() {
    if (isPaused) {
        return;
    }

    requestAnimationFrame(animate);

    // Move the container object
    container.position.x -= 0.05;


    obstacles.forEach((obstacle) => {
        obstacle.rotation.x += 0.01;
        obstacle.rotation.y += 0.01;
        obstacle.rotation.z += 0.01;
        obstacle.castShadow = true;
    });


    // Check for collisions with the cube
    let col = false;
    obstacles.forEach((obstacle) => {
        const obstaclePos = new THREE.Vector3();
        obstaclePos.setFromMatrixPosition(obstacle.matrixWorld);

        if (obstaclePos.distanceTo(frog.position) < obstacle.geometry.parameters.width / 2 + obstacle.geometry.parameters.width / 2) {
            col = true;;
            endGame();
            SE_TIRAR_ESTA_LINHA_O_JOGO_NAO_PARA_NAS_COLISOES
        }
    });
    if (!col) {
        score += 1;
        scoreText.innerHTML = "Score: " + score;
    } else {
        score = 0;
        scoreText.innerHTML = "Score: " + score;
    }

    updateFrogPosition();

    // Render the scene
    renderer.render(scene, camera);
}



function updateFrogPosition() {
    if (isFrogJumping) {
        const now = Date.now();
        const elapsed = now - jumpStart;
        // cube.rotation.x += 0.045;

        if (elapsed >= jumpDuration) {
            isFrogJumping = false;
            frog.position.y = -1;
        } else {
            const progress = elapsed / jumpDuration;
            const height = jumpHeight * Math.sin(progress * Math.PI);
            frog.position.y = height - 1;
        }
    }
}


// Score
let score = 0;
let scoreText = document.getElementById("score");
scoreText.innerHTML = "Score: " + score;



// Listen for spacebar press
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        frogJump();
    }
});

function endGame() {
    // Show the "Game Over" button
    var gameOverElement = document.getElementById("game-over");
    gameOverElement.style.display = "block";

    // Update the final score
    const finalScore = document.getElementById("final-score");
    finalScore.textContent = score;

    // hide the score
    var scoreElement = document.getElementById("score");
    scoreElement.style.display = "none";

    // restart the game
    const restartButton = document.getElementById("restart-button");
    restartButton.addEventListener("click", function() {
        if (!isRunning) {
            // Reset the game
            restartGame();
        }
    });

}

let isRunning = false;

//create function to restart game
function restartGame() {
    // Hide the "Game Over" button
    var gameOverElement = document.getElementById("game-over");
    gameOverElement.style.display = "none";

    // Show the score
    var scoreElement = document.getElementById("score");
    scoreElement.style.display = "block";

    // Reset the score
    score = 0;
    scoreText.innerHTML = "Score: " + score;

    // Reset the cube position
    frog.position.set(0, geometry.parameters.height / 2 + groundGeometry.parameters.height, 0);

    // Reset the container position
    container.position.set(0, 0.5, 0);

    // Reset the obstacles positions
    obstacles.forEach((obstacle, i) => {
        const distanceBetweenObstacles = 10;
        obstacle.position.x = -2 + i * distanceBetweenObstacles;
        obstacle.position.y = -1;
    });
}

let starting = false;
window.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        frogJump();
        starting = true;

    }
});


// Get the start menu element
const startMenu = document.getElementById("start-menu");

// Add an event listener for the space bar keypress
document.addEventListener("keydown", event => {
  if (event.code === "Enter") {
    // Hide the start menu
    startMenu.style.display = "none";

    if(startGame==false){
        // Start the game
        animate();
        startGame=true;
    }
  }
});

// Define a variable to store the current camera position and rotation
let cameraPosition = camera.position.clone();
let cameraRotation = camera.rotation.clone();

// Define a function to update the camera position and rotation
function updateCamera() {
  // If the game is paused, update the camera position and rotation
  if (isPaused) {
    // Calculate the elapsed time since the last frame
    const deltaTime = clock.getDelta();

    // Move the camera forward at a constant speed
    const cameraSpeed = 2;
    cameraPosition.z -= cameraSpeed * deltaTime;

    // Rotate the camera slightly to give a better view of the obstacles
    const cameraRotationSpeed = 0.05;
    cameraRotation.y += cameraRotationSpeed * deltaTime;

    // Set the camera position and rotation
    camera.position.copy(cameraPosition);
    camera.rotation.copy(cameraRotation);
  }

  // Request the next frame
  requestAnimationFrame(updateCamera);
}

// Call the updateCamera function to start the animation loop
updateCamera();

const restartCameraBtn = document.getElementById("restart-camera-btn");
restartCameraBtn.addEventListener("click", () => {
    // Reset the camera position
    // Set the camera position
    camera.position.set(-4, 1, -6);
    camera.lookAt(0, 0, 0);

});


// Add an event listener for the change camera button
const changeCameraBtn = document.getElementById("change-camera-btn");
changeCameraBtn.addEventListener("click", () => {
    
    // Update the camera position
    // Create variables for the mouse position
    var mouseDown = false;
    var mouseX = 0;
    var mouseY = 0;

    // Add event listeners for mouse events
    renderer.domElement.addEventListener('mousedown', function(event) {
        mouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
});

// Set a minimum height for the camera's y-coordinate
var minHeight = -1;

renderer.domElement.addEventListener('mousemove', function(event) {
    if (mouseDown) {
        var deltaX = event.clientX - mouseX;
        var deltaY = event.clientY - mouseY;

        camera.position.x += deltaX / 100;
        camera.position.y -= deltaY / 100;
    
        // Check if the new camera position would be below the ground position
        if (camera.position.y < minHeight) {
            camera.position.y = minHeight;
        }
    
        mouseX = event.clientX;
        mouseY = event.clientY;
    }
});

renderer.domElement.addEventListener('mouseup', function(event) {
    mouseDown = false;
});
});

