function main() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({canvas});
  var WIDTH = window.innerWidth-200, HEIGHT = window.innerHeight-90;

  var arena = 13,                  // Value used to dictate position of objects in the arena
      aspectratio = WIDTH/HEIGHT,  // Aspect ratio used with the snake game cameras.
      clock = new THREE.Clock(),  // Clock used to determine speed of snake animation is started.
      counter = 1,                // Counter object used with fruit.
      direction = new THREE.Vector3(1,0,0),   // Default direction assigned to the snake.
      direction1 = new THREE.Vector3(1,0,0),  // Second direction used to for the alternating camera modes.
      flag = 0,                   // Flag that controls which camera is being used.
      fruit,                      // Fruit object.
      keyChecker = [],            // Intial keychecker that registers the user's input for the snake's movement.
      keyChecker1 = [],           // Secondary keychecker for use with the different camera schemes without altering the initial keychecker.
      keyflag = 0,                // Flag that dictates the current direction of the snake for use with the camera modes.
      padding = 0.1,              // Amount of padding used to seperate the cubes of the snake slightly, used when the lengh of the snake is considered.
      pkeyflag = 0,               // Flag that controls the direction of the camera in Chase camera mode.
      score = 0,                  // Intial score to display to the player.
      speed = 8,                  // The speed of the snake's movement.
      speedcheck = 1,             // Used to check whether the speed has been increased past 100 already.
      time = 1/speed,             // Creates a value from the speed to compare against time elapsed to dictate how fast the snake moves.
      time1 = 0;                  // The time object to hold the time elapsed since the clock began.


  const boxDepth = 1,             // The temporary Depth,
        boxHeight = 1,            // Height,
        boxWidth = 1,             // And width of the cubes that make up the snake.
        cam = document.createElement("div"),  // Creates the div HTML element that holds the text displaying which camera mode is in use.
        camL = document.querySelector('#cam'),  //  Selects the element used to dictate the position and style of the camera text.
        far = 100,                // Camera variable that dictates how far the cameras' vision extend.
        fov = 80,                 // Camera variable that holds the field-of-view value.
        near = 0.01,              // Camera variable that dictates where the front of the cameras' vision begins.
        scene = new THREE.Scene(),                    // The scene created for use with the snake game.
        scoreboard = document.createElement("div"),   // Creates the div HTML element that holds the text displaying the score of the player.
        scoreL = document.querySelector('#score'),    // Selects the element used to style the scoreboard.
        snake = [],                                   // The snake array that holds the cubes that make up the snake and their relevant values.
        title = document.createElement("div"),        // Creates the div HTML element that holds the text displaying the title of the game.
        titleL = document.querySelector('#labels');   // Selects the element used to style the title.

  const camera = new THREE.PerspectiveCamera(fov, aspectratio, near, far),   // Initial corner camera mode used.
        camera1 = new THREE.PerspectiveCamera(fov, aspectratio, near, far),  // Manipulated for chase camera.
        camera2 = new THREE.PerspectiveCamera(fov, aspectratio, near, far),  // Manipulated for first-person camera.
        geometry = new THREE.BoxGeometry(1, 1, 1);                           // Temporary geometry set before the cube function is called.

  renderer.setSize(WIDTH, HEIGHT)
  title.style.fontSize = "70px";
  title.innerHTML = "3D SNAKE GAME";
  titleL.appendChild(title);

  camera.position.z = 20;
  camera.position.y=20;
  camera.position.x=-20;
  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([ // Loads the cubemap for use as a background texture
    '/assets/px.png',
    '/assets/nx.png',
    '/assets/py.png',
    '/assets/ny.png',
    '/assets/pz.png',
    '/assets/nz.png',
  ]);
  scene.background = texture;
  const color = 0xFFFFFF,
        groundColor = 0x113d0d,
        intensity = 1.5,
        intensity1 = 1.6,
        skyColor = 0xb7eff7,
        light = new THREE.HemisphereLight(skyColor, groundColor, intensity),
        light2 = new THREE.DirectionalLight(color, intensity1);



  light2.position.set(-5, 10, 10);
  light2.target.position.set(0,0,0);
  scene.add(light);         // Sets up and adds the lighting to the scene.
  scene.add(light2);
  scene.add(light2.target);


  for(var i = 0; i < 4; i++) {
    var snakeMaterial = new THREE.MeshPhongMaterial({ color: (i == 3) ? 0xd4043c : 0xd13b63} )
    var vx =(i + i * padding) - arena;        //Each cube for the snake is calculated using the value of its iteration, combined with padding to seperate the cubes of the snake.
    snake.push(new Cube(new THREE.Vector3(vx, 0, 5), snakeMaterial,scene))    //The cubes are pushed to the snake array for use during rendering.
  }



  function Cube(vec, material, scene, geometry) {
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    this.geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.position.set(vec.x, vec.y, vec.z);
    scene.add(this.mesh);
    this.setPosition = function(vec)
    {
      this.mesh.position.set(vec.x,vec.y, vec.z);
    }
  }

  function textbox() {
    scoreboard.style.fontSize = "50px";
    scoreboard.innerHTML = "SCORE: " + score; // The initial scoreboard before the player scores.
    scoreL.appendChild(scoreboard);



  }

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;   // A function to select a random integer bordered by the values called with the function.
  }



  function randLocation() {
    var x = rand(5, 19);
    var y = rand(8,19);
    var z = rand(5, 19);
    return new THREE.Vector3(x - arena, y - arena, z - arena)
  }


  function deleteFruit(fruit) {
      var targetFruit = scene.getObjectByName(fruit);
      scene.remove( targetFruit );    // Used to remove the eaten fruit from the scene.

  }

  function makeFruit() {
    var material1 = new THREE.MeshPhongMaterial({ color: 0x00000});
    const gltfLoader = new THREE.GLTFLoader();
    var url = "";
    var which = rand(0,6);
    var scale = 20; // Scale is used to assign each of the fruit models a specific scale in order to keep the fruit sizes uniform.
    if (which == 0){
      url = "/assets/pomegranate/food_pomegranate_01_4k.gltf";
      scale = 20;
    }
    else if(which == 1){
      url = '/assets/avocado/food_avocado_01_4k.gltf';
      scale = 30;
    }
    else if(which == 2){
      url = '/assets/apple/food_apple_01_4k.gltf';
      scale = 20;
    }
    else if(which == 3){
      url = '/assets/kiwi/food_kiwi_01_4k.gltf';
      scale = 35;
    }
    else if(which == 4){
      url = '/assets/lime/food_lime_01_4k.gltf';
      scale = 40;
    }
    else{
      url = '/assets/lychee/food_lychee_01_4k.gltf';
      scale = 40;
    }

    const rl = new randLocation();
    fruit = new Cube(rl, material1, scene); // A cube object represents the true shape of the collideable fruit.


    gltfLoader.load(url,
    (gltf) => {
      var root = gltf.scene;

      root.position.set(rl.x,rl.y-0.8,rl.z);
      root.scale.set(scale,scale,scale);
      root.name = counter;
      counter++;

      scene.add(root);


    },
    ( xhr ) => {
          console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` );
    },
    ( error ) => {
          console.error( 'An error happened', error );
    },
    );

  }





  function makeGrid(geometry) {

    const b1 = 0x1d05fa,
          divisions = 20,
          g1 = 0x2cfc03,
          r1 = 0xfc0303,
          size = 20;

    const gridHelper = new THREE.GridHelper( size, divisions, g1, g1);
    const gridHelper1 = new THREE.GridHelper( size, divisions, r1, r1);
    const gridHelper2 = new THREE.GridHelper( size, divisions, b1, b1);
    gridHelper.position.set(0,-5,0);

    scene.add( gridHelper );
    gridHelper1.position.set(0,5,0);
    gridHelper1.rotation.z=Math.PI/2;
    gridHelper1.position.x = 10;
    scene.add(gridHelper1);

    gridHelper2.position.y = 5;
    gridHelper2.rotation.x=Math.PI/2;
    gridHelper2.position.z= -10;
    scene.add(gridHelper2);




  }



  makeGrid(geometry);
  makeFruit();
  textbox();

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function restartGame() {
    while(snake.length > 4){
      scene.remove(snake.shift().mesh);
    }
    for(var i = 0; i < snake.length; i++) {
      var vx =(i + i * padding) - arena;
      snake[i].setPosition(vx, 0, 5);
    }
    direction = new THREE.Vector3(1,0,0);
    direction1 = new THREE.Vector3(1,0,0);
    score = 0;
    scoreL.removeChild(scoreboard);   //Previous scoreboard is removed and a new one created with the textbox() function.
    speed = 8;
    textbox();
  }


  function render() {
    requestAnimationFrame(render);
    time1 += clock.getDelta();
    if(time1 > time) {  // If the time since the clock started is larger than 1 divided by the speed given...
                        // ie depending on how high the speed value is, determines how quickly the snake is animated.
      var back = snake.shift();   // The back of the snake is taken by removing the first element in the snake array,
                                  // since the back will be the first cube added to the snake array.
      var front = snake[snake.length - 1];  // The front of the snake is taken from the last elemnt in the snake array.
      front.mesh.material.color.setHex(0xd13b63);
      back.mesh.material.color.setHex(0xd4043c);
      direction = keyChecker.length > 0 ? keyChecker.pop(): direction;  // The direction given by the controls is checked for.
                                                                        // By default, a direction heading positive on the x-axis is given.
      var newPosition = new THREE.Vector3(front.mesh.position.x + direction.x + Math.sign(direction.x) * padding,
                                          front.mesh.position.y + direction.y + Math.sign(direction.y) * padding,
                                          front.mesh.position.z + direction.z + Math.sign(direction.z) * padding);
      back.setPosition(newPosition);  // The removed cube is assigned the new position,
                                      //calculated using the position of the front of the snake with the current direction given.
      snake.push(back);   // The newly placed cube is added to the end of the snake array, to be used as the next front.
      front = back;
      for(var i = snake.length - 2; i > -1; i--) {  // Detects whether the snake collides with itself.
        if(front.mesh.position.distanceTo(snake[i].mesh.position) <= 1) {
          restartGame();
          break;
        }
      }
      if(front.mesh.position.distanceTo(fruit.mesh.position) <= 1) { // Detects whether the snake collides with any fruit.
        const nl = new randLocation();    // Creates new random location for the next fruit.
        const gltfLoader = new THREE.GLTFLoader();
        var url = "";
        var which = rand(0,4);
        var scale = 20; // Scale is used to assign each of the fruit models a specific scale in order to keep the fruit sizes uniform.
        if (which == 0){
          url = '/assets/pomegranate/food_pomegranate_01_4k.gltf';
          scale = 20;
        }
        else if(which == 1){
          url = '/assets/avocado/food_avocado_01_4k.gltf';
          scale = 30;
        }
        else if(which == 2){
          url = '/assets/apple/food_apple_01_4k.gltf';
          scale = 20;
        }
        else if(which == 3){
          url = '/assets/kiwi/food_kiwi_01_4k.gltf';
          scale = 35;
        }
        else if(which == 4){
          url = '/assets/lime/food_lime_01_4k.gltf';
          scale = 40;
        }
        else{
          url = '/assets/lychee/food_lychee_01_4k.gltf';
          scale = 40;
        }
        fruit.setPosition(nl);
        var counter1 = counter - 1;
        deleteFruit(counter1);

        gltfLoader.load(url,
        (gltf) => {
          var root = gltf.scene;
          root.position.set(nl.x,nl.y-0.8,nl.z);
          root.scale.set(scale,scale,scale);
          root.name = counter;
          counter++;

          scene.add(root);


        },
        ( xhr ) => {
              console.log( `${( xhr.loaded / xhr.total * 100 )}% loaded` );
        },
        ( error ) => {
              console.error( 'An error happened', error );
        },
        );
          if(speedcheck < 100) {
              speed = speed + 0.1;  // The speed is incremented on every successful fruit eaten.
              speedcheck++;
          }
          scoreboard.innerHTML = "SCORE: " + (++score);
          snake.unshift(new Cube(new THREE.Vector3(snake[0].mesh.position.x,snake[0].mesh.position.y,snake[0].mesh.position.z),
                                 new THREE.MeshPhongMaterial({color: 0xd4043c}),
                                 scene));  // Unshift is used to add a new cube to the start of the snake array, functionally the tail of the snake.

      }


      if(front.mesh.position.x > arena-3) {   // Used to detect if the snake has crosed the confines of the arena and teleport it to the opposite end if so.
        front.mesh.position.x = -arena + 2.5;
        // restartGame() add to increase difficulty
      }
      else if(front.mesh.position.x < -arena+3) {
        front.mesh.position.x = arena - 2.5;
      }
      else if(front.mesh.position.y > arena+2) {
        front.mesh.position.y = -arena + 8;
      }
      else if(front.mesh.position.y < -arena+8.5) {
        front.mesh.position.y = arena +3;
      }
      else if(front.mesh.position.z > arena-2.5) {
        front.mesh.position.z = -arena + 4;
      }
      else if(front.mesh.position.z < -arena+3.5) {
        front.mesh.position.z = arena - 2;
      }

      time1 = 0;
    }



    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }





    renderer.render(scene, camera);


    if(flag == 0) {   // flag is used to seperate the different camera modes
      cam.style.fontSize = "40px";
      cam.innerHTML = "Corner Cam";
      camL.appendChild(cam);
      camera.lookAt(scene.position);
    }
    else if(flag == 1) {
      cam.style.fontSize = "40px";
      cam.innerHTML = "Chase Cam";
      camL.appendChild(cam);
      direction1 = keyChecker1.length > 0 ? keyChecker1.pop(): direction1;
      var camPosition = new THREE.Vector3(snake[snake.length-2].mesh.position.x + direction1.x + Math.sign(direction1.x) * padding,
                                          snake[snake.length-2].mesh.position.y + direction1.y + Math.sign(direction1.y) * padding,
                                          snake[snake.length-2].mesh.position.z + direction1.z + Math.sign(direction1.z) * padding);
      if(keyflag == 0) {
        camera2.position.z = camPosition.z;
        camera2.position.y=camPosition.y + 0.5;
        camera2.position.x=camPosition.x+3;
        camera.position.z = camPosition.z;
        camera.position.y=camPosition.y + 2;
        camera.position.x=camPosition.x - 2;
        camera.lookAt(camera2.position);
        pkeyflag = 0;
      }

      else if(keyflag == 1) {
        camera2.position.z = camPosition.z+3;
        camera2.position.y=camPosition.y + 0.5;
        camera2.position.x=camPosition.x;
        camera.position.z = camPosition.z-2;
        camera.position.y=camPosition.y + 2;
        camera.position.x=camPosition.x;
        camera.lookAt(camera2.position);
        pkeyflag = 1;
      }
      else if(keyflag == 2) {
        camera2.position.z = camPosition.z;
        camera2.position.y=camPosition.y + 0.5;
        camera2.position.x=camPosition.x-3;
        camera.position.z = camPosition.z;
        camera.position.y=camPosition.y + 2;
        camera.position.x=camPosition.x+2;
        camera.lookAt(camera2.position);
        pkeyflag = 2;
      }
      else if(keyflag == 3) {
        camera2.position.z = camPosition.z-3;
        camera2.position.y=camPosition.y + 0.5;
        camera2.position.x=camPosition.x;
        camera.position.z = camPosition.z+2;
        camera.position.y=camPosition.y + 2;
        camera.position.x=camPosition.x;
        camera.lookAt(camera2.position);
        pkeyflag = 3;
      }
      else if(keyflag == 4) {
        if(pkeyflag == 0) {
          camera2.position.z = camPosition.z;
          camera2.position.y=camPosition.y + 3;
          camera2.position.x=camPosition.x-0.5;
          camera.position.z = camPosition.z;
          camera.position.y=camPosition.y -2;
          camera.position.x=camPosition.x-2;
          camera.lookAt(camera2.position);
        }
        else if(pkeyflag == 1) {
          camera2.position.z = camPosition.z - 0.5;
          camera2.position.y=camPosition.y + 3;
          camera2.position.x=camPosition.x;
          camera.position.z = camPosition.z-2;
          camera.position.y=camPosition.y -2;
          camera.position.x=camPosition.x;
          camera.lookAt(camera2.position);
        }
        else if(pkeyflag == 2) {
          camera2.position.z = camPosition.z;
          camera2.position.y=camPosition.y + 3;
          camera2.position.x=camPosition.x + 0.5;
          camera.position.z = camPosition.z;
          camera.position.y=camPosition.y - 2;
          camera.position.x=camPosition.x + 2;
          camera.lookAt(camera2.position);
        }
        else if(pkeyflag == 3) {
          camera2.position.z = camPosition.z + 0.5;
          camera2.position.y=camPosition.y + 3;
          camera2.position.x=camPosition.x;
          camera.position.z = camPosition.z + 2;
          camera.position.y=camPosition.y -2;
          camera.position.x=camPosition.x;
          camera.lookAt(camera2.position);
        }

      }
      else if(keyflag == 5) {
        if(pkeyflag == 0) {
          camera2.position.z = camPosition.z;
          camera2.position.y=camPosition.y - 3;
          camera2.position.x=camPosition.x-0.5;
          camera.position.z = camPosition.z;
          camera.position.y=camPosition.y + 2;
          camera.position.x=camPosition.x-2;
          camera.lookAt(camera2.position);
        }
        else if(pkeyflag == 1) {
          camera2.position.z = camPosition.z - 0.5;
          camera2.position.y=camPosition.y - 3;
          camera2.position.x=camPosition.x;
          camera.position.z = camPosition.z-2;
          camera.position.y=camPosition.y + 2;
          camera.position.x=camPosition.x;
          camera.lookAt(camera2.position);
        }
        else if(pkeyflag == 2) {
          camera2.position.z = camPosition.z;
          camera2.position.y=camPosition.y - 3;
          camera2.position.x=camPosition.x + 0.5;
          camera.position.z = camPosition.z;
          camera.position.y=camPosition.y + 2;
          camera.position.x=camPosition.x + 2;
          camera.lookAt(camera2.position);
        }
        else if(pkeyflag == 3) {
          camera2.position.z = camPosition.z + 0.5;
          camera2.position.y=camPosition.y - 3;
          camera2.position.x=camPosition.x;
          camera.position.z = camPosition.z + 2;
          camera.position.y=camPosition.y + 2;
          camera.position.x=camPosition.x;
          camera.lookAt(camera2.position);
        }

      }
    }
    else {
      cam.style.fontSize = "40px";
      cam.innerHTML = "First Person Cam";
      camL.appendChild(cam);
      direction1 = keyChecker1.length > 0 ? keyChecker1.pop(): direction1;
      var camPosition = new THREE.Vector3(snake[snake.length-1].mesh.position.x + direction1.x + Math.sign(direction1.x) * padding,
                                          snake[snake.length-1].mesh.position.y + direction1.y + Math.sign(direction1.y) * padding,
                                          snake[snake.length-1].mesh.position.z + direction1.z + Math.sign(direction1.z) * padding);
      if(keyflag == 0) {
        camera2.position.z = camPosition.z;
        camera2.position.y=camPosition.y;
        camera2.position.x=camPosition.x+3;
        camera.position.z = camPosition.z;
        camera.position.y=camPosition.y;
        camera.position.x=camPosition.x;
        camera.lookAt(camera2.position);
        pkeyflag = 0;
      }

      else if(keyflag == 1) {
        camera2.position.z = camPosition.z+3;
        camera2.position.y=camPosition.y ;
        camera2.position.x=camPosition.x;
        camera.position.z = camPosition.z;
        camera.position.y=camPosition.y;
        camera.position.x=camPosition.x;
        camera.lookAt(camera2.position);
        pkeyflag = 1;
      }
      else if(keyflag == 2) {
        camera2.position.z = camPosition.z;
        camera2.position.y=camPosition.y;
        camera2.position.x=camPosition.x-3;
        camera.position.z = camPosition.z;
        camera.position.y=camPosition.y;
        camera.position.x=camPosition.x;
        camera.lookAt(camera2.position);
        pkeyflag = 2;
      }
      else if(keyflag == 3) {
        camera2.position.z = camPosition.z-3;
        camera2.position.y=camPosition.y;
        camera2.position.x=camPosition.x;
        camera.position.z = camPosition.z;
        camera.position.y=camPosition.y;
        camera.position.x=camPosition.x;
        camera.lookAt(camera2.position);
        pkeyflag = 3;
      }
      else if(keyflag == 4) {
          camera2.position.z = camPosition.z;
          camera2.position.y=camPosition.y + 3;
          camera2.position.x=camPosition.x;
          camera.position.z = camPosition.z;
          camera.position.y=camPosition.y ;
          camera.position.x=camPosition.x;
          camera.lookAt(camera2.position);

      }
      else if(keyflag == 5) {
          camera2.position.z = camPosition.z;
          camera2.position.y=camPosition.y - 3;
          camera2.position.x=camPosition.x;
          camera.position.z = camPosition.z;
          camera.position.y=camPosition.y ;
          camera.position.x=camPosition.x;
          camera.lookAt(camera2.position);

      }
      //camera.updateProjectionMatrix();
      //scene.add(camera1);
      //camera1.lookAt(camera2.position);
      //camera2.lookAt(camera2.position);
    }
  }
  requestAnimationFrame(render);
//render();

  window.addEventListener("keydown", function(e) {
    if(["ArrowUp","ArrowDown","ArrowRight", "ArrowLeft"].indexOf(e.code) > -1) {
        e.preventDefault(); // Prevents the user from accidentally scrolling the webpoage with the arrowkeys.
    }
  }, false);
  document.addEventListener("keydown",function(event) {
    switch(event.key) {
      case "ArrowUp":
        keyChecker.push(new THREE.Vector3(0,0,-1));   // On key press, the up direction is assigned to the keychecker arrays for manipulation.
        keyChecker1.push(new THREE.Vector3(0,0,-1));
        keyflag = 3;
      break;
      case "ArrowDown":
        keyChecker.push(new THREE.Vector3(0,0,1));
        keyChecker1.push(new THREE.Vector3(0,0,1));
        keyflag = 1;
      break;
      case "ArrowLeft":
        keyChecker.push(new THREE.Vector3(-1,0,0));
        keyChecker1.push(new THREE.Vector3(-1,0,0));
        keyflag = 2;
      break;
      case "ArrowRight":
        keyChecker.push(new THREE.Vector3(1,0,0));
        keyChecker1.push(new THREE.Vector3(1,0,0));
        keyflag = 0;
      break;
      case "A":
      case "a":
        keyChecker.push(new THREE.Vector3(0,1,0));
        keyChecker1.push(new THREE.Vector3(0,1,0));
        keyflag = 4;
      break;
      case "Z":
      case "z":
        keyChecker.push(new THREE.Vector3(0,-1,0));
        keyChecker1.push(new THREE.Vector3(0,-1,0));
        keyflag = 5;
      break;
      case "c":
      case "C":
        const size = 20;
        const divisions = 20;
        const g1 = 0x2cfc03;
        const b1 = 0x1d05fa;
        const r1 = 0xfc0303;
        const gridHelper3 = new THREE.GridHelper( size, divisions, g1, g1);   // Adds the missing grids for the chase and first-person cameras.
        const gridHelper4 = new THREE.GridHelper( size, divisions, r1, r1);
        const gridHelper5 = new THREE.GridHelper( size, divisions, b1, b1);
        gridHelper3.name = "grid1";
        gridHelper4.name = "grid2";
        gridHelper5.name = "grid3";
        if(flag == 0) {
          gridHelper3.position.set(0,15,0);
          scene.add(gridHelper3);
          gridHelper4.position.set(0,5,0);
          gridHelper4.rotation.z=Math.PI/2;
          gridHelper4.position.x = -10;
          scene.add(gridHelper4);
          gridHelper5.position.y = 5;
          gridHelper5.rotation.x=Math.PI/2;
          gridHelper5.position.z= 10;
          scene.add(gridHelper5);
          flag = 1;
        }
        else if( flag == 1) {
          flag = 2;

        }
        else {
          scene.remove(scene.getObjectByName("grid1"));
          scene.remove(scene.getObjectByName("grid2"));
          scene.remove(scene.getObjectByName("grid3"));
          camera.position.z = 20;
          camera.position.y=20;
          camera.position.x=-20;
          flag = 0;
        }
      break;

    }
  });


}



main();
