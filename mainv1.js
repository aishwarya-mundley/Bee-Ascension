// Bee Game Level 1: "Gathering Nectar" - Three.js Implementation

// Import necessary libraries
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Game class
class BeeGame {
  constructor() {
    // Game state
    this.gameState = {
      nectarCollected: 0,
      targetNectar: 2,
      timeRemaining: 120, // 2 minutes in seconds
      level: 1,
      lives: 3,
      gameRunning: false
    };

    // Setup scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
    
    // Setup camera
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 10, 20);
    
    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
    
    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Setup lighting
    this.setupLighting();
    
    // Create game objects
    this.createWorld();
    this.createBee();
    this.createFlowers();
    
    // Setup input handlers
    this.setupInputHandlers();
    
    // Setup game UI
    this.setupUI();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize(), false);
    
    // Animation loop
    this.clock = new THREE.Clock();
    this.animate();
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(50, 100, 50);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -100;
    sunLight.shadow.camera.right = 100;
    sunLight.shadow.camera.top = 100;
    sunLight.shadow.camera.bottom = -100;
    this.scene.add(sunLight);
  }
  
  createWorld() {
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x7CFC00,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    
    // Add some hills
    this.createHill(15, 5, -20, 0);
    this.createHill(-25, 8, -15, 0);
    this.createHill(30, 6, 10, 0);
    
    // Add some trees
    this.createTree(10, 0, -15, 2);
    this.createTree(-18, 0, 12, 1.5);
    this.createTree(25, 0, 20, 2.2);
  }
  
  createHill(x, height, z, rotation) {
    const hillGeometry = new THREE.ConeGeometry(10, height, 16);
    const hillMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,
      roughness: 0.9,
      metalness: 0.1
    });
    const hill = new THREE.Mesh(hillGeometry, hillMaterial);
    hill.position.set(x, height / 2, z);
    hill.rotation.y = rotation;
    hill.castShadow = true;
    hill.receiveShadow = true;
    this.scene.add(hill);
  }
  
  createTree(x, y, z, scale) {
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, y + 1, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    
    const leavesGeometry = new THREE.ConeGeometry(2, 4, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.8,
      metalness: 0.1
    });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(0, 3, 0);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    
    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    tree.scale.set(scale, scale, scale);
    tree.position.y = y;
    
    this.scene.add(tree);
  }
  
  createBee() {
    // Create bee body
    const bodyGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFD700, // Gold color
      roughness: 0.4,
      metalness: 0.3
    });
    
    // Create black stripes material using shader
    const stripeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000, // Black color
      roughness: 0.4,
      metalness: 0.3,
      opacity: 0.8,
      transparent: true,
    });
    
    // Create bee body
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Create black stripes
    const stripe1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI / 2),
      stripeMaterial
    );
    stripe1.rotation.x = Math.PI / 2;
    stripe1.position.z = -0.15;
    
    const stripe2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI / 2),
      stripeMaterial
    );
    stripe2.rotation.x = Math.PI / 2;
    stripe2.position.z = 0.15;
    
    // Create wings
    const wingGeometry = new THREE.CircleGeometry(0.4, 16);
    const wingMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.5, 0.3, 0);
    leftWing.rotation.z = Math.PI / 4;
    
    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0.5, 0.3, 0);
    rightWing.rotation.z = -Math.PI / 4;
    
    // Create stinger
    const stingerGeometry = new THREE.ConeGeometry(0.1, 0.3, 16);
    const stingerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000 
    });
    const stinger = new THREE.Mesh(stingerGeometry, stingerMaterial);
    stinger.position.set(0, 0, -0.65);
    stinger.rotation.x = Math.PI / 2;
    
    // Create eyes
    const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x000000 
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.2, 0.4);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.2, 0.4);
    
    // Create bee group
    this.bee = new THREE.Group();
    this.bee.add(body);
    this.bee.add(stripe1);
    this.bee.add(stripe2);
    this.bee.add(leftWing);
    this.bee.add(rightWing);
    this.bee.add(stinger);
    this.bee.add(leftEye);
    this.bee.add(rightEye);
    
    // Set bee position
    this.bee.position.set(0, 2, 0);
    this.bee.castShadow = true;
    
    // Add to scene
    this.scene.add(this.bee);
    
    // Bee movement properties
    this.beeSpeed = 0.15;
    this.beeRotationSpeed = 0.05;
    this.beeDirection = new THREE.Vector3(0, 0, 1);
    
    // Wing animation
    this.wingAnimation = { 
      time: 0,
      speed: 0.2,
      amplitude: 0.3
    };
  }
  
  createFlowers() {
    this.flowers = [];
    
    // Create different types of flowers
    const flowerColors = [
      0xFF69B4, // Pink
      0xFF6347, // Tomato
      0x9370DB, // Medium Purple
      0x20B2AA, // Light Sea Green
      0xFFD700  // Gold
    ];
    
    // Create 15 flowers randomly positioned
    for (let i = 0; i < 15; i++) {
      const x = (Math.random() - 0.5) * 80;
      const z = (Math.random() - 0.5) * 80;
      const flowerType = Math.floor(Math.random() * flowerColors.length);
      const flower = this.createFlower(flowerColors[flowerType], x, z);
      this.flowers.push(flower);
    }
  }
  
  createFlower(color, x, z) {
    // Create flower group
    const flower = new THREE.Group();
    
    // Create stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x00FF00 
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.5;
    flower.add(stem);
    
    // Create petals
    const petalCount = 6;
    const petalGeometry = new THREE.CircleGeometry(0.3, 8);
    const petalMaterial = new THREE.MeshStandardMaterial({ 
      color: color,
      side: THREE.DoubleSide
    });
    
    for (let i = 0; i < petalCount; i++) {
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      const angle = (i / petalCount) * Math.PI * 2;
      petal.position.set(
        Math.cos(angle) * 0.2,
        1.1,
        Math.sin(angle) * 0.2
      );
      petal.rotation.x = Math.PI / 2;
      petal.rotation.y = -angle;
      petal.rotation.z = Math.PI / 4;
      flower.add(petal);
    }
    
    // Create center
    const centerGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const centerMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFF00 
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.y = 1.1;
    flower.add(center);
    
    // Set flower position
    flower.position.set(x, 0, z);
    flower.castShadow = true;
    flower.receiveShadow = true;
    
    // Add nectar property
    flower.userData = {
      hasNectar: true,
      nectarAmount: 1,
      collisionRadius: 1.5
    };
    
    // Add to scene
    this.scene.add(flower);
    
    return flower;
  }
  
  setupInputHandlers() {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      up: false,
      down: false,
      space: false
    };
    
    document.addEventListener('keydown', (event) => {
      if (this.gameState.gameRunning) {
        switch (event.code) {
          case 'KeyW': case 'ArrowUp': this.keys.forward = true; break;
          case 'KeyS': case 'ArrowDown': this.keys.backward = true; break;
          case 'KeyA': case 'ArrowLeft': this.keys.left = true; break;
          case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
          case 'Space': this.keys.space = true; break;
          case 'KeyE': this.keys.up = true; break;
          case 'KeyQ': this.keys.down = true; break;
        }
      }
      
      // Start game on Space if not running
      if (event.code === 'Space' && !this.gameState.gameRunning) {
        this.startLevel();
      }
    });
    
    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW': case 'ArrowUp': this.keys.forward = false; break;
        case 'KeyS': case 'ArrowDown': this.keys.backward = false; break;
        case 'KeyA': case 'ArrowLeft': this.keys.left = false; break;
        case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
        case 'Space': this.keys.space = false; break;
        case 'KeyE': this.keys.up = false; break;
        case 'KeyQ': this.keys.down = false; break;
      }
    });
  }
  
  setupUI() {
    // Create UI container
    this.uiContainer = document.createElement('div');
    this.uiContainer.style.position = 'absolute';
    this.uiContainer.style.top = '10px';
    this.uiContainer.style.left = '10px';
    this.uiContainer.style.color = 'white';
    this.uiContainer.style.fontFamily = 'Arial, sans-serif';
    this.uiContainer.style.padding = '10px';
    this.uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    this.uiContainer.style.borderRadius = '5px';
    this.uiContainer.style.minWidth = '200px';
    document.body.appendChild(this.uiContainer);
    
    // Create UI elements
    this.nectarText = document.createElement('div');
    this.nectarText.textContent = `Nectar: 0/${this.gameState.targetNectar}`;
    this.uiContainer.appendChild(this.nectarText);
    
    this.timeText = document.createElement('div');
    this.timeText.textContent = `Time: ${this.gameState.timeRemaining}s`;
    this.uiContainer.appendChild(this.timeText);
    
    this.livesText = document.createElement('div');
    this.livesText.textContent = `Lives: ${this.gameState.lives}`;
    this.uiContainer.appendChild(this.livesText);
    
    // Create level info/instructions
    this.levelInfo = document.createElement('div');
    this.levelInfo.style.position = 'absolute';
    this.levelInfo.style.top = '50%';
    this.levelInfo.style.left = '50%';
    this.levelInfo.style.transform = 'translate(-50%, -50%)';
    this.levelInfo.style.color = 'white';
    this.levelInfo.style.fontFamily = 'Arial, sans-serif';
    this.levelInfo.style.padding = '20px';
    this.levelInfo.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    this.levelInfo.style.borderRadius = '10px';
    this.levelInfo.style.textAlign = 'center';
    this.levelInfo.style.maxWidth = '500px';
    document.body.appendChild(this.levelInfo);
    
    this.updateLevelInfo(
      "Level 1: Gathering Nectar",
      "As a worker bee, your first mission is to gather nectar for the young ones. " +
      "Collect nectar from 10 flowers before time runs out.\n\n" +
      "Controls:\n" +
      "W/↑ - Move Forward\n" +
      "S/↓ - Move Backward\n" +
      "A/← - Turn Left\n" +
      "D/→ - Turn Right\n" +
      "E - Fly Up\n" +
      "Q - Fly Down\n" +
      "Space - Collect Nectar (when near a flower)\n\n" +
      "Press SPACE to start!"
    );
  }
  
  updateLevelInfo(title, text) {
    this.levelInfo.innerHTML = `<h2>${title}</h2><p>${text.replace(/\n/g, '<br>')}</p>`;
  }
  
  updateUI() {
    this.nectarText.textContent = `Nectar: ${this.gameState.nectarCollected}/${this.gameState.targetNectar}`;
    this.timeText.textContent = `Time: ${Math.ceil(this.gameState.timeRemaining)}s`;
    this.livesText.textContent = `Lives: ${this.gameState.lives}`;
  }
  
  startLevel() {
    this.gameState.gameRunning = true;
    this.levelInfo.style.display = 'none';
    
    // Reset game state
    this.gameState.nectarCollected = 0;
    this.gameState.timeRemaining = 120;
    
    // Reset bee position
    this.bee.position.set(0, 2, 0);
    this.beeDirection = new THREE.Vector3(0, 0, 1);
    this.bee.rotation.y = 0;
    
    // Reset flowers
    this.flowers.forEach(flower => {
      flower.userData.hasNectar = true;
      // Make center yellow to indicate it has nectar
      flower.children[flower.children.length - 1].material.color.set(0xFFFF00);
    });
    
    // Update UI
    this.updateUI();
  }
  
  endLevel(success) {
    this.gameState.gameRunning = false;
    
    if (success) {
      this.updateLevelInfo(
        "Level Complete!",
        `Congratulations! You've collected enough nectar for the young ones.\n\n` +
        `You collected ${this.gameState.nectarCollected} nectar units in ${Math.floor(120 - this.gameState.timeRemaining)} seconds.\n\n` +
        "You're one step closer to becoming the Queen Bee!\n\n" +
        "Press SPACE to play again!"
      );
    } else {
      this.updateLevelInfo(
        "Level Failed",
        "You didn't collect enough nectar in time.\n\n" +
        `You only collected ${this.gameState.nectarCollected}/${this.gameState.targetNectar} nectar units.\n\n` +
        "The young ones are still hungry. Try again!\n\n" +
        "Press SPACE to retry"
      );
    }
    
    this.levelInfo.style.display = 'block';
  }
  
  moveBee(deltaTime) {
    if (!this.gameState.gameRunning) return;
    
    // Calculate forward direction
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(this.bee.quaternion);
    
    // Calculate right direction
    const right = new THREE.Vector3(1, 0, 0);
    right.applyQuaternion(this.bee.quaternion);
    
    // Calculate move direction
    const moveDirection = new THREE.Vector3(0, 0, 0);
    
    if (this.keys.forward) moveDirection.add(forward);
    if (this.keys.backward) moveDirection.sub(forward);
    if (this.keys.right) moveDirection.add(right);
    if (this.keys.left) moveDirection.sub(right);
    
    // Handle up/down movement
    if (this.keys.up) moveDirection.y += 1;
    if (this.keys.down) moveDirection.y -= 1;
    
    // Normalize and apply movement
    if (moveDirection.length() > 0) {
      moveDirection.normalize();
      
      // Apply speed
      moveDirection.multiplyScalar(this.beeSpeed);
      
      // Apply to bee position
      this.bee.position.add(moveDirection);
      
      // Update direction for rotation
      if (moveDirection.x !== 0 || moveDirection.z !== 0) {
        const horizontalDirection = new THREE.Vector3(moveDirection.x, 0, moveDirection.z).normalize();
        // Calculate angle between current direction and target direction
        const angle = Math.atan2(horizontalDirection.x, horizontalDirection.z);
        this.bee.rotation.y = angle;
      }
    }
    
    // Keep bee within bounds
    const boundarySize = 40;
    this.bee.position.x = Math.max(-boundarySize, Math.min(boundarySize, this.bee.position.x));
    this.bee.position.z = Math.max(-boundarySize, Math.min(boundarySize, this.bee.position.z));
    this.bee.position.y = Math.max(0.5, Math.min(10, this.bee.position.y));
    
    // Animate wings
    this.wingAnimation.time += deltaTime * this.wingAnimation.speed;
    const wingAngle = Math.sin(this.wingAnimation.time) * this.wingAnimation.amplitude;
    
    const leftWing = this.bee.children[3];  // Left wing
    const rightWing = this.bee.children[4]; // Right wing
    
    leftWing.rotation.z = Math.PI / 4 + wingAngle;
    rightWing.rotation.z = -Math.PI / 4 - wingAngle;
  }
  
  checkFlowerCollisions() {
    if (!this.gameState.gameRunning) return;
    
    // Check for Space key press
    if (this.keys.space) {
      // Check each flower
      for (const flower of this.flowers) {
        if (flower.userData.hasNectar) {
          // Calculate distance
          const distance = this.bee.position.distanceTo(flower.position);
          
          // If close enough
          if (distance < flower.userData.collisionRadius) {
            // Collect nectar
            flower.userData.hasNectar = false;
            
            // Change flower center color to indicate no nectar
            flower.children[flower.children.length - 1].material.color.set(0xBBBBBB);
            
            // Update game state
            this.gameState.nectarCollected += flower.userData.nectarAmount;
            
            // Play sound effect (if implemented)
            
            // Check win condition
            if (this.gameState.nectarCollected >= this.gameState.targetNectar) {
              this.endLevel(true);
            }
            
            // Update UI
            this.updateUI();
            
            // Break after collecting from one flower per press
            break;
          }
        }
      }
    }
  }
  
  updateGameTime(deltaTime) {
    if (this.gameState.gameRunning) {
      this.gameState.timeRemaining -= deltaTime;
      
      if (this.gameState.timeRemaining <= 0) {
        this.gameState.timeRemaining = 0;
        this.endLevel(false);
      }
      
      this.updateUI();
    }
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    
    // Update controls
    this.controls.update();
    
    // Move bee
    this.moveBee(deltaTime);
    
    // Check collisions
    this.checkFlowerCollisions();
    
    // Update game time
    this.updateGameTime(deltaTime);
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  const game = new BeeGame();
});

// Export game for potential use in other modules
export { BeeGame };