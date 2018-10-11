var renderer = null,
scene = null,
raycaster = null,
camera = null,
root = null,
robot_idle = null,
robot_attack = null,
flamingo = null,
stork = null,
robotsGroup = null,
robots = [],
group = null,
orbitControls = null;
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;
var bgUrl = "./images/milkyway.jpg";
var timer = 0;
var robot_mixer = {};
var deadAnimator;
var morphs = [];
var robotModel = null;
var time = null;
var score = 0;

var duration = 2000; // ms
var currentTime = Date.now();

var animation = "idle";


function createDeadAnimation(robot) {
    let animator = new KF.KeyFrameAnimator;
    animator.init({
        interps:
            [
                {
                    keys:[0, 1],
                    values:[
                            { x : 0 },
                            { x : - Math.PI  },
                    ],
                    target:robot.rotation
                }
            ],
        loop: false,
        duration:duration
    });
    // Add animator to robot object
    robot.dead = animator;
}


function createAttackAnimation(robot) {
    let animator = new KF.KeyFrameAnimator;
    animator.init({
        interps:
            [
                {
                    keys:[0, 0.5, 1],
                    values:[
                            { y : -40 },
                            { y : 5},
                            { y : -40},
                    ],
                    target:robot.position
                },
            ],
        loop: true,
        duration:duration*3
    });
    // Add animator to robot object
    robot.attack = animator;
}

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( './models/Robot/robot_atk.fbx', function ( object )
    {
      robotModel = object;
      robotModel.position.y = 5;
      robotModel.position.z = 5;
      robotModel.name = "robot0";
      

      cloneRobotModel();
      cloneRobotModel();
      cloneRobotModel();


      run();
    } );
}
//
function cloneRobotModel()
{
  for(let i=0; i<Math.floor(Math.random() * 4); i++) {
      let robot = cloneFbx(robotModel);

      robot.scale.set(0.02, 0.02, 0.02);

      var rx = Math.floor(Math.random() * 30);
      var rz = Math.floor(Math.random() * 80);

      robot.position.x = robotModel.position.x + rx;
      robot.position.z = robotModel.position.z + rz;

      robot.traverse(function(child) {
          if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
          }
      } );

      robot.name = "robot" + i+1;

      console.log(robot.name);

      // Add animators to objects
      createAttackAnimation(robot);
      createDeadAnimation(robot);

      // Start idle animation
      robot.attack.start();



      scene.add(robot);
      //robotsGroup.add(robot);

      // Add mixer to object
      robot.mixer = new THREE.AnimationMixer( scene );
      robot.mixer.clipAction(robot.animations[ 0 ], robot ).play();
      robot.active = true;
      robots.push(robot);
    }
}




function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;


    robots.forEach(function(robot) {
        robot.mixer.update(deltat * 0.01);
    })

    KF.update();
}

function run() {
    requestAnimationFrame(function() { run(); });


        var now = Date.now();
        var deltat = now - currentTime;
        currentTime = now;

        // Render the scene
        renderer.render( scene, camera );

        // Spin the cube for next frame
        animate();

        // Update the camera controller
        //orbitControls.update();

        if (Math.round((timer - now)/1000) > 1)
        {
          time.text("Time:" + Math.round((timer - now)/1000));
          //score_l.text(score);
        } else {
          time.text("GAME OVER. RELOAD.")
          scene.remove(robot);
        }

}

function setLightColor(light, r, g, b)
{
    r /= 255;
    g /= 255;
    b /= 255;

    light.color.setRGB(r, g, b);
}

var directionalLight = null;
var spotLight = null;
var ambientLight = null;
var mapUrl = "./images/texture1.png";

var SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function createScene(canvas) {

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();

    var backgroundImg = new THREE.TextureLoader().load(bgUrl);
    backgroundImg.wrapS = backgroundImg.wrapT = THREE.RepeatWrapping;
    backgroundImg.repeat.set(1, 1);
    scene.background = backgroundImg

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 22, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(10, 0, 120);
    scene.add(camera);

    //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a group to hold all the objects
    root = new THREE.Object3D;

    spotLight = new THREE.SpotLight (0xffffff);
    spotLight.position.set(-30, 8, -10);
    spotLight.target.position.set(-2, 0, -2);
    root.add(spotLight);

    spotLight.castShadow = true;

    spotLight.shadow.camera.near = 1;
    spotLight.shadow.camera.far = 200;
    spotLight.shadow.camera.fov = 45;

    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);

    // Create the objects
    loadFBX();

    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create a texture map
    var map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;

    // Add the mesh to our group
    group.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    // Now add the group to our scene
    scene.add( root );


    timer = Date.now() + 30000;
    //score_l = $("#score");
    time = $("#time");


    raycaster = new THREE.Raycaster();

    document.addEventListener('mousedown', onDocumentMouseDown);
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( scene.children, true );

    //console.log(mouse.x);
    //console.log(mouse.y);

    if ( intersects.length > 0 )
    {
        CLICKED = intersects[ 0 ].object.parent;

        console.log(CLICKED);


      let robot = robots.filter(obj => {
        return obj.name === CLICKED.name;
        })[0];
        console.log("FOUND: ");
        //console.log(robot.name);
        //robot.idle.stop();
        if (robot.active)
        {
          robot.attack.stop();
          robot.dead.start();
          robot.active = false;
        }

        score = score + 1;
        $("#score").html("Score: " + score);
        scene.remove(robot);
        scene.remove(robot);
        cloneRobotModel();

    }

}
