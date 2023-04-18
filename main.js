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
camera.position.set(-4, 0, -6);
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


// Create a cube
const geometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x00CEEE
});
const cube = new THREE.Mesh(geometry, cubeMaterial);
const groundGeometry = new THREE.PlaneGeometry(200, 10, 1, 1);


// Set the cube position
cube.position.set(0, geometry.parameters.height / 2 + groundGeometry.parameters.height, 0);

// Add the cube to the scene
scene.add(cube);

// Create a container object for the line and obstacles
const container = new THREE.Object3D(); 
scene.add(container);

// Create a ground
const groundMaterial = new THREE.MeshPhongMaterial({
    color: 0xDACCBF
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);

// Set the ground position
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;

// Add the ground to the scene
scene.add(ground);

// Set the cube position
cube.position.y = -1;

// Add the cube to the scene
scene.add(cube);

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


// Create a line
const lineGeometry = new THREE.BufferGeometry();
const lineMaterial = new THREE.LineBasicMaterial({});
const vertices = new Float32Array([-5, 0, 0, 5, 0, 0]);
const line = new THREE.Line(lineGeometry, lineMaterial);

// Add the line to the container object
container.add(line);

// Create obstacles
const obstacles = [];

const obstacleGeometry = new THREE.BoxGeometry();
const obstacleMaterial = new THREE.MeshPhongMaterial({
    color: 0xEE7700
});
let i = 0;
while (i < 100) {
    i++;
    const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);

    // Set position for the obstacles on the line
    const distanceBetweenObstacles = 8;
    obstacle.position.x = -2 + i * distanceBetweenObstacles;
    obstacle.position.y = -1;
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
let jumpHeight = 2.5;
let jumpDuration = 1000;
let jumpStart = null;


function jump() {
    if (!isJumping) {
        isJumping = true;
        jumpStart = Date.now();
    }
}

// Create a variable to track whether the game is paused
let isPaused = false;


// Add a keydown event listener to the window object
window.addEventListener("keydown", (event) => {
    if (event.key === "p") {
        isPaused = !isPaused;
    }
});

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
    });


    // Check for collisions with the cube
    let col = false;
    obstacles.forEach((obstacle) => {
        const obstaclePos = new THREE.Vector3();
        obstaclePos.setFromMatrixPosition(obstacle.matrixWorld);

        if (obstaclePos.distanceTo(cube.position) < obstacle.geometry.parameters.width / 2 + cube.geometry.parameters.width / 2) {
            col = true;;
            endGame();
            ISTO_NAO_FAZ_SENTIDO
        }
    });
    if (!col) {
        score += 1;
        scoreText.innerHTML = "Score: " + score;
    } else {
        score = 0;
        scoreText.innerHTML = "Score: " + score;
    }

    // Update cube position for jumping
    if (isJumping) {
        const now = Date.now();
        const elapsed = now - jumpStart;
        cube.rotation.x += 0.045;

        if (elapsed >= jumpDuration) {
            isJumping = false;
            cube.position.y = -1;
        } else {
            const progress = elapsed / jumpDuration;
            const height = jumpHeight * Math.sin(progress * Math.PI);
            cube.position.y = height - 1;
        }
    }

    // Render the scene
    renderer.render(scene, camera);
}

// Score
let score = 0;
let scoreText = document.getElementById("score");
scoreText.innerHTML = "Score: " + score;

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

renderer.domElement.addEventListener('mousemove', function(event) {
    if (mouseDown) {
        var deltaX = event.clientX - mouseX;
        var deltaY = event.clientY - mouseY;

        camera.position.x += deltaX / 100;
        camera.position.y -= deltaY / 100;

        mouseX = event.clientX;
        mouseY = event.clientY;
    }
});

renderer.domElement.addEventListener('mouseup', function(event) {
    mouseDown = false;
});

// Listen for spacebar press
document.addEventListener("keydown", (event) => {
    if (event.code === "Space") {
        jump();
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
    cube.position.set(0, geometry.parameters.height / 2 + groundGeometry.parameters.height, 0);

    // Reset the container position
    container.position.set(0, 0, 0);

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
        jump();
        starting = true;

    }
});

const startScreen = document.getElementById('start-screen');
const gameCanvas = document.getElementById('game-canvas');
const spaceBarKey = 32;

/*function startGame() {
    if (!isRunning) {
        isRunning = true;
        animate();
    }
}


document.addEventListener('keydown', event => {
  if (event.key === spaceBarKey) {
    startGame();
  }
});
*/

animate();