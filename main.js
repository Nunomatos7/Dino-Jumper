import * as THREE from 'three';
import {GLTFLoader} from "https://cdn.rawgit.com/mrdoob/three.js/master/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://cdn.rawgit.com/mrdoob/three.js/master/examples/jsm/controls/OrbitControls.js";

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
const renderer = new THREE.WebGLRenderer({ antialias: true });
// Set the renderer size
renderer.setSize(window.innerWidth, window.innerHeight);
// Enable shadow mapping
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// Add the renderer to the HTML document
document.body.appendChild(renderer.domElement);

// Set the window size to fit the screen
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Create OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);

// Set options for OrbitControls
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.maxDistance = 10;
controls.minDistance = 1;

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

const geometry = new THREE.BoxGeometry();
const groundGeometry = new THREE.PlaneGeometry(3000, 10, 1, 1);

// add texture to cube
const textureLoader = new THREE.TextureLoader();

let frog;

const loader1 = new GLTFLoader();
const placeholderModel = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
scene.add(placeholderModel);

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

    // Set the frog's size
    frog.scale.set(0.7, 0.7, 0.7);

    scene.remove(placeholderModel);


    textureLoader.load(
        './water.png',
        function (texture) {
          // Create a material with the loaded texture
          const material = new THREE.MeshStandardMaterial({ map: texture });
  
          // Apply the material to the frog model
          frog.material = material;
  
          // Add the frog model to the scene
          scene.add(frog);
        }
      );
});




// Create a container object for the line and obstacles
const container = new THREE.Object3D(); 
scene.add(container);

// Create a ground
const groundMaterial = new THREE.MeshPhongMaterial({});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
// Set the ground position
ground.rotation.x = -Math.PI / 2;
ground.position.y = -1.5;
// Enable shadow casting and receiving on the ground
ground.castShadow = true;
ground.receiveShadow = true;

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
spotLight.penumbra = 0.5;
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 0.1;
spotLight.shadow.camera.far = 10000;
scene.add(spotLight);


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
    obstacle.position.x = 3 + i * distanceBetweenObstacles;
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
let jumpDuration = 1100;
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

let gameSpeed = 0.0001;
let scoreThreshold = 1000;
let previousSpeed = 0;

function showSpeedWarning() {
    const speedWarning = document.getElementById("speed-warning");
    speedWarning.style.display = "block";
    setTimeout(() => {
      speedWarning.style.display = "none";
    }, 2000); // Hide the warning message after 2 seconds
  }

  const notification = document.getElementById('notification');

  function showNotification() {
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 2000); // Hide the warning message after 2 seconds
  }


// Animate the scene
function animate() {
    if (isPaused) {
        return;
    }

    requestAnimationFrame(animate);

    // Increase game speed based on score
    if (score >= scoreThreshold) {
        gameSpeed += 0.003;
        scoreThreshold += 1000;
    }

    // Move the container object with the adjusted game speed
    container.position.x -= gameSpeed;

    // Move the container object
    container.position.x -= 0.05;

    if (gameSpeed > previousSpeed && gameSpeed != 0.0001) {
        showNotification();
        previousSpeed = gameSpeed;
  }

    // Restrict the camera's position to stay above the ground plane
    if (camera.position.y < 0) {
        camera.position.y = 0;
    }


    obstacles.forEach((obstacle) => {
        obstacle.rotation.x += 0.01;
        obstacle.rotation.y += 0.01;
        obstacle.rotation.z += 0.01;
        obstacle.castShadow = true;
    });


    // Check for collisions with the frog
    let col = false;
    obstacles.forEach((obstacle) => {
        const obstaclePos = new THREE.Vector3();
        obstaclePos.setFromMatrixPosition(obstacle.matrixWorld);

        if (obstaclePos.distanceTo(frog.position) < obstacle.geometry.parameters.width / 2 + obstacle.geometry.parameters.width / 2) {
            col = true;;
            endGame();
            SE_TIRAR_ESTA_LINHA_O_JOGO_NAO_PARA_NAS_COLISOES_E_O_RESULTADO_NAO_GRAVA
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

    // Reset the frog position
    frog.position.set(0, geometry.parameters.height / 2 + groundGeometry.parameters.height, 0);

    // Reset the container position
    container.position.set(0, 0.5, 0);

    // Reset the obstacles positions
    obstacles.forEach((obstacle, i) => {
        const distanceBetweenObstacles = 10;
        obstacle.position.x = -2 + i * distanceBetweenObstacles;
        obstacle.position.y = -1;
    });

    // Reset the game speed
    gameSpeed = 0.0001;
    scoreThreshold = 1000;
    
    if (score >= scoreThreshold) {
        gameSpeed += 0.003;
        scoreThreshold += 1000;
    }

    // Move the container object with the adjusted game speed
    container.position.x -= gameSpeed;


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

// Add event listeners for the space bar and enter keypress
let spacePressed = false;
document.addEventListener("keydown", event => {
  if (event.code === "Space") {
    // Set spacePressed to true when the space bar is pressed
    spacePressed = true;
  } else if (event.code === "Enter" && spacePressed) {
    // Hide the start menu
    startMenu.style.display = "none";

    if (startGame == false) {
      // Start the game
      animate();
      startGame = true;
    }
  }
});

// Add an event listener for the space bar keyup
document.addEventListener("keyup", event => {
  if (event.code === "Space") {
    // Reset spacePressed to false when the space bar is released
    spacePressed = false;
  }
});



const restartCameraBtn = document.getElementById("restart-camera-btn");
restartCameraBtn.addEventListener("click", () => {
    // Reset the camera position
    // Set the camera position
    camera.position.set(-4, 1, -6);
    camera.lookAt(0, 0, 0);

});


