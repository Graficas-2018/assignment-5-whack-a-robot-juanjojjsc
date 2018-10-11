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

var duration = 20000; // ms
var currentTime = Date.now();

var animation = "idle";

function changeAnimation(animation_text)
{
    animation = animation_text;

    if(animation =="dead")
    {
        createDeadAnimation();
    }
    else
    {
        robot_idle.rotation.x = 0;
        robot_idle.position.y = -4;
    }
}

function createDeadAnimation()
{
  robot_idle.rotation.x = 0;
  robot_idle.position.y = -4;
}

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( './models/Robot/robot_idle.fbx', function ( object )
    {
        robot_mixer["idle"] = new THREE.AnimationMixer( scene );
        object.scale.set(0.02, 0.02, 0.02);
        object.position.y -= 4;
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        robot_idle = object;

        //robotsGroup.add(robot_idle);
        //scene.add( robotsGroup );

        scene.add(robot_idle);

        createDeadAnimation();

        robot_mixer["idle"].clipAction( object.animations[ 0 ], robot_idle ).play();

        loader.load( './models/Robot/robot_atk.fbx', function ( object )
        {
            robot_mixer["attack"] = new THREE.AnimationMixer( scene );
            robot_mixer["attack"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( './models/Robot/robot_run.fbx', function ( object )
        {
            robot_mixer["run"] = new THREE.AnimationMixer( scene );
            robot_mixer["run"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );

        loader.load( './models/Robot/robot_walk.fbx', function ( object )
        {
            robot_mixer["walk"] = new THREE.AnimationMixer( scene );
            robot_mixer["walk"].clipAction( object.animations[ 0 ], robot_idle ).play();
        } );
    } );
}


function onKeyDown(event)
{
    switch(event.keyCode)
    {
        case 65:
            console.log("Cloning robot");
            var newRobot = cloneFbx(robot_idle);
            newRobot.mixer =  new THREE.AnimationMixer( scene.children );
            var action = newRobot.mixer.clipAction( newRobot.animations[ 0 ], newRobot );
            action.play();
            robots.push(newRobot);
            var rx = Math.floor(Math.random() * 30);
            var rz = Math.floor(Math.random() * 30);
            newRobot.position.x = robot_idle.position.x + rx;
            newRobot.position.z = robot_idle.position.z + rz;
            scene.add(newRobot);
            robot_mixer["walk"] = new THREE.AnimationMixer( scene );
            robot_mixer["walk"].clipAction( newRobot.animations[ 0 ], newRobot ).play();
            //robotsGroup.add(newRobot);
            console.log(robots);
            console.log(robotsGroup);
            break;
    }
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    if(robot_idle && robot_mixer[animation])
    {
        robot_mixer[animation].update(deltat * 0.001);
    }

    if(animation =="dead")
    {
        KF.update();
    }
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

        time.text("Time:" + Math.round((timer - now)/1000));
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
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(10, 0, 60);
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
    score_l = $("#score");
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
        CLICKED = intersects[ 0 ].object;
        //changeAnimation(dad);
        console.log(CLICKED);

        console.log("FOUND");
        scene.remove(CLICKED);
        //console.log(target[0]);

    }

}
