// Bee Game Level 1: "Gathering Nectar" - Three.js Implementation with Mobile Support

// Import necessary libraries
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Game class
class BeeGame {
  constructor() {
    // Game state
    this.gameState = {
      nectarCollected: 0,
      targetNectar: 10,
      timeRemaining: 120, // 2 minutes in seconds
      level: 1,
      lives: 3,
      gameRunning: false,
      isMobile: this.checkIfMobile()
    };

    // Setup scene
    this.scene = new window.THREE.Scene();
    this.scene.background = new window.THREE.Color(0x87CEEB); // Sky blue background
    
    // Setup camera
    this.camera = new window.THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.set(0, 10, 20);
    
    // Setup renderer
    this.renderer = new window.THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);
    
    // Setup controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    
    // Set up mobile controls if needed
    if (this.gameState.isMobile) {
      this.setupMobileControls();
      // Disable orbit controls on mobile to prevent conflicts
      this.controls.enabled = false;
    }
    
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
    this.clock = new window.THREE.Clock();
    this.animate();
  }
  
  checkIfMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  setupMobileControls() {
    // Create virtual joystick container
    this.joystickContainer = document.createElement('div');
    this.joystickContainer.style.position = 'absolute';
    this.joystickContainer.style.bottom = '20px';
    this.joystickContainer.style.left = '20px';
    this.joystickContainer.style.width = '120px';
    this.joystickContainer.style.height = '120px';
    this.joystickContainer.style.borderRadius = '60px';
    this.joystickContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    this.joystickContainer.style.border = '2px solid rgba(255, 255, 255, 0.5)';
    this.joystickContainer.style.touchAction = 'none';
    document.body.appendChild(this.joystickContainer);
    
    // Create joystick
    this.joystick = document.createElement('div');
    this.joystick.style.position = 'absolute';
    this.joystick.style.top = '50%';
    this.joystick.style.left = '50%';
    this.joystick.style.transform = 'translate(-50%, -50%)';
    this.joystick.style.width = '50px';
    this.joystick.style.height = '50px';
    this.joystick.style.borderRadius = '25px';
    this.joystick.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
    this.joystick.style.border = '2px solid rgba(255, 255, 255, 0.9)';
    this.joystickContainer.appendChild(this.joystick);
    
    // Create vertical controls container
    this.verticalControlsContainer = document.createElement('div');
    this.verticalControlsContainer.style.position = 'absolute';
    this.verticalControlsContainer.style.bottom = '20px';
    this.verticalControlsContainer.style.right = '20px';
    this.verticalControlsContainer.style.width = '60px';
    this.verticalControlsContainer.style.height = '120px';
    this.verticalControlsContainer.style.display = 'flex';
    this.verticalControlsContainer.style.flexDirection = 'column';
    this.verticalControlsContainer.style.justifyContent = 'space-between';
    document.body.appendChild(this.verticalControlsContainer);
    
    // Up button
    this.upButton = document.createElement('div');
    this.upButton.style.width = '60px';
    this.upButton.style.height = '50px';
    this.upButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    this.upButton.style.borderRadius = '10px';
    this.upButton.style.display = 'flex';
    this.upButton.style.justifyContent = 'center';
    this.upButton.style.alignItems = 'center';
    this.upButton.innerHTML = '▲';
    this.upButton.style.fontSize = '20px';
    this.upButton.style.color = 'white';
    this.upButton.style.userSelect = 'none';
    this.upButton.style.touchAction = 'none';
    this.verticalControlsContainer.appendChild(this.upButton);
    
    // Down button
    this.downButton = document.createElement('div');
    this.downButton.style.width = '60px';
    this.downButton.style.height = '50px';
    this.downButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    this.downButton.style.borderRadius = '10px';
    this.downButton.style.display = 'flex';
    this.downButton.style.justifyContent = 'center';
    this.downButton.style.alignItems = 'center';
    this.downButton.innerHTML = '▼';
    this.downButton.style.fontSize = '20px';
    this.downButton.style.color = 'white';
    this.downButton.style.userSelect = 'none';
    this.downButton.style.touchAction = 'none';
    this.verticalControlsContainer.appendChild(this.downButton);
    
    // Nectar collection button
    this.collectButton = document.createElement('div');
    this.collectButton.style.position = 'absolute';
    this.collectButton.style.bottom = '100px';
    this.collectButton.style.right = '100px';
    this.collectButton.style.width = '80px';
    this.collectButton.style.height = '80px';
    this.collectButton.style.backgroundColor = 'rgba(255, 215, 0, 0.5)';
    this.collectButton.style.borderRadius = '40px';
    this.collectButton.style.display = 'flex';
    this.collectButton.style.justifyContent = 'center';
    this.collectButton.style.alignItems = 'center';
    this.collectButton.innerHTML = '⚡';
    this.collectButton.style.fontSize = '30px';
    this.collectButton.style.color = 'white';
    this.collectButton.style.userSelect = 'none';
    this.collectButton.style.touchAction = 'none';
    document.body.appendChild(this.collectButton);
    
    // Set up joystick variables
    this.joystickActive = false;
    this.joystickPosition = { x: 0, y: 0 };
    this.joystickMax = 35; // Maximum distance the joystick can move from center
    
    // Up/down button states
    this.upButtonActive = false;
    this.downButtonActive = false;
    this.collectButtonActive = false;
    
    // Touch event listeners for joystick
    this.joystickContainer.addEventListener('touchstart', (e) => this.handleJoystickStart(e), false);
    this.joystickContainer.addEventListener('touchmove', (e) => this.handleJoystickMove(e), false);
    this.joystickContainer.addEventListener('touchend', (e) => this.handleJoystickEnd(e), false);
    
    // Touch event listeners for up/down buttons
    this.upButton.addEventListener('touchstart', () => this.upButtonActive = true, false);
    this.upButton.addEventListener('touchend', () => this.upButtonActive = false, false);
    this.downButton.addEventListener('touchstart', () => this.downButtonActive = true, false);
    this.downButton.addEventListener('touchend', () => this.downButtonActive = false, false);
    
    // Touch event listeners for collect button
    this.collectButton.addEventListener('touchstart', () => this.collectButtonActive = true, false);
    this.collectButton.addEventListener('touchend', () => this.collectButtonActive = false, false);
    
    // Prevent default touch behavior to avoid scrolling
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
  }
  
  handleJoystickStart(event) {
    this.joystickActive = true;
    this.updateJoystickPosition(event);
  }
  
  handleJoystickMove(event) {
    if (this.joystickActive) {
      this.updateJoystickPosition(event);
    }
  }
  
  handleJoystickEnd() {
    this.joystickActive = false;
    this.joystickPosition = { x: 0, y: 0 };
    this.joystick.style.transform = 'translate(-50%, -50%)';
  }
  
  updateJoystickPosition(event) {
    if (!event.touches[0]) return;
    
    const touch = event.touches[0];
    const joystickRect = this.joystickContainer.getBoundingClientRect();
    const centerX = joystickRect.left + joystickRect.width / 2;
    const centerY = joystickRect.top + joystickRect.height / 2;
    
    let x = touch.clientX - centerX;
    let y = touch.clientY - centerY;
    
    // Limit joystick movement to the maximum radius
    const distance = Math.sqrt(x * x + y * y);
    if (distance > this.joystickMax) {
      const ratio = this.joystickMax / distance;
      x *= ratio;
      y *= ratio;
    }
    
    // Update joystick position
    this.joystick.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    
    // Store normalized values for use in movement
    this.joystickPosition = {
      x: x / this.joystickMax,
      y: y / this.joystickMax
    };
  }
  
  setupLighting() {
    // Ambient light
    const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
    
    // Directional light (sun)
    const sunLight = new window.THREE.DirectionalLight(0xffffff, 0.8);
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
    const groundGeometry = new window.THREE.PlaneGeometry(100, 100);
    const groundMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x7CFC00,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new window.THREE.Mesh(groundGeometry, groundMaterial);
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
    const hillGeometry = new window.THREE.ConeGeometry(10, height, 16);
    const hillMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x4CAF50,
      roughness: 0.9,
      metalness: 0.1
    });
    const hill = new window.THREE.Mesh(hillGeometry, hillMaterial);
    hill.position.set(x, height / 2, z);
    hill.rotation.y = rotation;
    hill.castShadow = true;
    hill.receiveShadow = true;
    this.scene.add(hill);
  }
  
  createTree(x, y, z, scale) {
    const trunkGeometry = new window.THREE.CylinderGeometry(0.5, 0.7, 2, 8);
    const trunkMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x8B4513,
      roughness: 0.9,
      metalness: 0.1
    });
    const trunk = new window.THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, y + 1, z);
    trunk.castShadow = true;
    trunk.receiveShadow = true;
    
    const leavesGeometry = new window.THREE.ConeGeometry(2, 4, 8);
    const leavesMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.8,
      metalness: 0.1
    });
    const leaves = new window.THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(0, 3, 0);
    leaves.castShadow = true;
    leaves.receiveShadow = true;
    
    const tree = new window.THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    tree.scale.set(scale, scale, scale);
    tree.position.y = y;
    
    this.scene.add(tree);
  }
  
  createBee() {
    // Create bee body
    const bodyGeometry = new window.THREE.SphereGeometry(0.5, 16, 16);
    const bodyMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0xFFD700, // Gold color
      roughness: 0.4,
      metalness: 0.3
    });
    
    // Create black stripes material using shader
    const stripeMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x000000, // Black color
      roughness: 0.4,
      metalness: 0.3,
      opacity: 0.8,
      transparent: true,
    });
    
    // Create bee body
    const body = new window.THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Create black stripes
    const stripe1 = new window.THREE.Mesh(
      new window.THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI / 2),
      stripeMaterial
    );
    stripe1.rotation.x = Math.PI / 2;
    stripe1.position.z = -0.15;
    
    const stripe2 = new window.THREE.Mesh(
      new window.THREE.TorusGeometry(0.5, 0.1, 16, 32, Math.PI / 2),
      stripeMaterial
    );
    stripe2.rotation.x = Math.PI / 2;
    stripe2.position.z = 0.15;
    
    // Create wings
    const wingGeometry = new window.THREE.CircleGeometry(0.4, 16);
    const wingMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0xFFFFFF,
      transparent: true,
      opacity: 0.4,
      side: window.THREE.DoubleSide
    });
    
    const leftWing = new window.THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-0.5, 0.3, 0);
    leftWing.rotation.z = Math.PI / 4;
    
    const rightWing = new window.THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(0.5, 0.3, 0);
    rightWing.rotation.z = -Math.PI / 4;
    
    // Create stinger
    const stingerGeometry = new window.THREE.ConeGeometry(0.1, 0.3, 16);
    const stingerMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x000000 
    });
    const stinger = new window.THREE.Mesh(stingerGeometry, stingerMaterial);
    stinger.position.set(0, 0, -0.65);
    stinger.rotation.x = Math.PI / 2;
    
    // Create eyes
    const eyeGeometry = new window.THREE.SphereGeometry(0.1, 16, 16);
    const eyeMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x000000 
    });
    
    const leftEye = new window.THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.2, 0.2, 0.4);
    
    const rightEye = new window.THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.2, 0.2, 0.4);
    
    // Create bee group
    this.bee = new window.THREE.Group();
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
    this.beeDirection = new window.THREE.Vector3(0, 0, 1);
    
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
    const flower = new window.THREE.Group();
    
    // Create stem
    const stemGeometry = new window.THREE.CylinderGeometry(0.05, 0.05, 1, 8);
    const stemMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0x00FF00 
    });
    const stem = new window.THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.5;
    flower.add(stem);
    
    // Create petals
    const petalCount = 6;
    const petalGeometry = new window.THREE.CircleGeometry(0.3, 8);
    const petalMaterial = new window.THREE.MeshStandardMaterial({ 
      color: color,
      side: window.THREE.DoubleSide
    });
    
    for (let i = 0; i < petalCount; i++) {
      const petal = new window.THREE.Mesh(petalGeometry, petalMaterial);
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
    const centerGeometry = new window.THREE.SphereGeometry(0.2, 16, 16);
    const centerMaterial = new window.THREE.MeshStandardMaterial({ 
      color: 0xFFFF00 
    });
    const center = new window.THREE.Mesh(centerGeometry, centerMaterial);
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
    
    // Only set up keyboard controls if not on mobile
    if (!this.gameState.isMobile) {
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
    } else {
      // For mobile, add tap event to start the game
      document.addEventListener('touchstart', (event) => {
        if (!this.gameState.gameRunning) {
          this.startLevel();
        }
      }, { once: true });
    }
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
    // Ensure the UI is legible on mobile
    if (this.gameState.isMobile) {
      this.uiContainer.style.fontSize = '14px';
    }
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
    this.levelInfo.style.maxWidth = '80%';
    // Adjust for mobile
    if (this.gameState.isMobile) {
      this.levelInfo.style.fontSize = '14px';
      this.levelInfo.style.maxWidth = '90%';
    }
    document.body.appendChild(this.levelInfo);
    
    // Set instructions based on device
    if (this.gameState.isMobile) {
      this.updateLevelInfo(
        "Level 1: Gathering Nectar",
        "As a worker bee, your first mission is to gather nectar for the young ones. " +
        "Collect nectar from 10 flowers before time runs out.\n\n" +
        "Controls:\n" +
        "Left Joystick - Move the bee\n" +
        "Up/Down Buttons - Fly Up/Down\n" +
        "Yellow Button - Collect Nectar (when near a flower)\n\n" +
        "Tap anywhere to start!"
      );
    } else {
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
    this.beeDirection = new window.THREE.Vector3(0, 0, 1);
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
          `You collected ${this.gameState.nectarCollected} nectar in ${Math.floor(120 - this.gameState.timeRemaining)} seconds.\n\n` +
          `Press ${this.gameState.isMobile ? 'anywhere' : 'SPACE'} to restart!`
      );
      } else {
      // Failed level case
      this.gameState.lives--;
        
      if (this.gameState.lives <= 0) {
          this.updateLevelInfo(
          "Game Over!",
          `You've run out of lives!\n\n` +
          `You collected ${this.gameState.nectarCollected} out of ${this.gameState.targetNectar} nectar.\n\n` +
          `Press ${this.gameState.isMobile ? 'anywhere' : 'SPACE'} to try again!`
          );
          // Reset lives for restart
          this.gameState.lives = 3;
      } else {
          this.updateLevelInfo(
          "Level Failed!",
          `You didn't collect enough nectar in time!\n\n` +
          `You collected ${this.gameState.nectarCollected} out of ${this.gameState.targetNectar} nectar.\n\n` +
          `Lives remaining: ${this.gameState.lives}\n\n` +
          `Press ${this.gameState.isMobile ? 'anywhere' : 'SPACE'} to try again!`
          );
      }
      }
      
      this.levelInfo.style.display = 'block';
  }
  
  checkCollisions() {
    // Check for flower collisions
    this.flowers.forEach(flower => {
      if (flower.userData.hasNectar) {
        const distance = this.bee.position.distanceTo(flower.position);
        
        // If bee is close enough to collect nectar
        if (distance < flower.userData.collisionRadius) {
          // Highlight flower when in range
          flower.children[flower.children.length - 1].material.color.set(0xFFA500);
          
          // Collect nectar if space is pressed or mobile collect button is active
          if ((this.keys.space || this.collectButtonActive) && flower.userData.hasNectar) {
            this.collectNectar(flower);
          }
        } else {
          // Reset flower highlight when out of range
          flower.children[flower.children.length - 1].material.color.set(0xFFFF00);
        }
      }
    });
  }
  
  collectNectar(flower) {
    if (flower.userData.hasNectar) {
      // Update flower appearance
      flower.userData.hasNectar = false;
      flower.children[flower.children.length - 1].material.color.set(0xCCCCCC); // Gray out center
      
      // Update game state
      this.gameState.nectarCollected += flower.userData.nectarAmount;
      this.updateUI();
      
      // Check if level complete
      if (this.gameState.nectarCollected >= this.gameState.targetNectar) {
        this.endLevel(true);
      }
    }
  }
  
  updateBeePosition(deltaTime) {
    const moveSpeed = this.beeSpeed * deltaTime;
    const rotateSpeed = this.beeRotationSpeed * deltaTime;
    
    // Handle bee movement based on input type
    if (this.gameState.isMobile) {
      // Mobile controls
      if (this.joystickActive) {
        // Rotate bee based on joystick horizontal position
        this.bee.rotation.y -= this.joystickPosition.x * rotateSpeed * 5;
        
        // Update bee direction based on current rotation
        this.beeDirection.x = Math.sin(this.bee.rotation.y);
        this.beeDirection.z = Math.cos(this.bee.rotation.y);
        
        // Move bee forward/backward based on joystick vertical position
        this.bee.position.x += this.beeDirection.x * -this.joystickPosition.y * moveSpeed * 5;
        this.bee.position.z += this.beeDirection.z * -this.joystickPosition.y * moveSpeed * 5;
      }
      
      // Vertical movement with up/down buttons
      if (this.upButtonActive) {
        this.bee.position.y += moveSpeed * 2;
      }
      if (this.downButtonActive) {
        this.bee.position.y -= moveSpeed * 2;
      }
    } else {
      // Keyboard controls
      if (this.keys.left) {
        this.bee.rotation.y += rotateSpeed * 5;
      }
      if (this.keys.right) {
        this.bee.rotation.y -= rotateSpeed * 5;
      }
      
      // Update bee direction based on current rotation
      this.beeDirection.x = Math.sin(this.bee.rotation.y);
      this.beeDirection.z = Math.cos(this.bee.rotation.y);
      
      // Forward/backward movement
      if (this.keys.forward) {
        this.bee.position.x += this.beeDirection.x * moveSpeed * 5;
        this.bee.position.z += this.beeDirection.z * moveSpeed * 5;
      }
      if (this.keys.backward) {
        this.bee.position.x -= this.beeDirection.x * moveSpeed * 5;
        this.bee.position.z -= this.beeDirection.z * moveSpeed * 5;
      }
      
      // Vertical movement
      if (this.keys.up) {
        this.bee.position.y += moveSpeed * 2;
      }
      if (this.keys.down) {
        this.bee.position.y -= moveSpeed * 2;
      }
    }
    
    // Limit bee movement area
    this.bee.position.x = Math.max(-45, Math.min(45, this.bee.position.x));
    this.bee.position.z = Math.max(-45, Math.min(45, this.bee.position.z));
    this.bee.position.y = Math.max(1, Math.min(15, this.bee.position.y));
    
    // Animate wings
    this.wingAnimation.time += deltaTime * this.wingAnimation.speed;
    const wingAngle = Math.sin(this.wingAnimation.time) * this.wingAnimation.amplitude;
    
    // Left and right wings (index 3 and 4 in the bee group)
    this.bee.children[3].rotation.z = Math.PI / 4 + wingAngle;
    this.bee.children[4].rotation.z = -Math.PI / 4 - wingAngle;
  }
  
  updateGameState(deltaTime) {
    if (this.gameState.gameRunning) {
      // Update time remaining
      this.gameState.timeRemaining -= deltaTime;
      this.updateUI();
      
      // Check if time has run out
      if (this.gameState.timeRemaining <= 0) {
        this.gameState.timeRemaining = 0;
        this.endLevel(false);
      }
    }
  }
  
  animate() {
    requestAnimationFrame(() => this.animate());
    
    const deltaTime = this.clock.getDelta();
    
    // Update game state
    this.updateGameState(deltaTime);
    
    // Update bee position if game is running
    if (this.gameState.gameRunning) {
      this.updateBeePosition(deltaTime);
      this.checkCollisions();
    }
    
    // Update controls
    if (!this.gameState.isMobile) {
      this.controls.update();
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  onWindowResize() {
    // Update camera aspect ratio
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// Initialize the game when the page is loaded
window.addEventListener('DOMContentLoaded', () => {
  new BeeGame();
});