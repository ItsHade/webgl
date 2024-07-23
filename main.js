import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// standard global variables
var scene, camera, renderer, controls;
// var keyboard = new THREEx.KeyboardState();

// custom global variables
var cube, ball, paddle, paddleOutline, paddle2, paddleOutline2, keys;
const PADDLE_SPEED = 0.2;
const BALL_SPEED = 0.1;
const BALL_SIZE = 0.2;
const MAX_HEIGHT = 4.5; // idk how to name this
const MIN_HEIGHT = -MAX_HEIGHT;
var ballSpeed = {x: BALL_SPEED, y: BALL_SPEED};

Init();
Loop();


function Init()
{
    // SCENE
    scene = new THREE.Scene();
    
    // CAMERA
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 2000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, -10, 10);
    camera.lookAt(scene);
    scene.add(camera);

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.setClearColor(0x1c1c1c, 1);
    // renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    // CONTROLS
    controls = new OrbitControls( camera, renderer.domElement);
    controls.update();

    // LIGHT
    // can't see textures without light
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0, 0, 10);
	scene.add(light);

    // INPUT
    keys = {
        a: false,
        s: false,
        d: false,
        w: false,
        arrowup: false,
        arrowdown: false,
        i: false
      };
    
    document.body.addEventListener( 'keydown', function(e) {

    var key = e.code.replace('Key', '').toLowerCase();
    console.log("key: " + key); 
    if ( keys[ key ] !== undefined )
        keys[ key ] = true;
    
    });
    document.body.addEventListener( 'keyup', function(e) {
    
    var key = e.code.replace('Key', '').toLowerCase();
    if ( keys[ key ] !== undefined )
        keys[ key ] = false;
    
    });


    // CUSTOM GEOMETRY
    // const geometry = new THREE.BoxGeometry(1, 1, 1);
    const arenaFloorGeometry = new THREE.BoxGeometry(16, 9, 0.5);
    const arenaSmallSideGeometry = new THREE.BoxGeometry(0.5, 10, 0.5);
    const arenaLargeSideGeometry = new THREE.BoxGeometry(17, 0.5, 0.5);
    const paddleGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const ballGeometry = new THREE.SphereGeometry(BALL_SIZE, 64, 32);
    const points = [];
    points.push( new THREE.Vector3( -8, MAX_HEIGHT, 0 ) );
    points.push( new THREE.Vector3( 8, MAX_HEIGHT, 0 ) );
    points.push( new THREE.Vector3( 8, MIN_HEIGHT, 0 ) );
    points.push( new THREE.Vector3( -8, MIN_HEIGHT, 0 ) );
    points.push( new THREE.Vector3( -8, MAX_HEIGHT, 0 ) );

    const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );

    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    // const cubeTexture = textureLoader.load( "./textures/cube_texture.png");
    const ballTexture = textureLoader.load("./textures/ball_texture.png")

    // MATERIAL
    const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x353535 });
    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const paddleOutlineMaterial = new THREE.MeshBasicMaterial({ color: 0xd1d1d1, side: THREE.BackSide });
    // const cubeMaterial = new THREE.MeshStandardMaterial({map: cubeTexture}); 
    const ballMaterial = new THREE.MeshBasicMaterial({map: ballTexture});


    // MESH
    const arenaFloor = new THREE.Mesh(arenaFloorGeometry, blackMaterial);
    const arenaLeftSide = new THREE.Mesh(arenaSmallSideGeometry, whiteMaterial);
    const arenaTopSide = new THREE.Mesh(arenaLargeSideGeometry, whiteMaterial);
    // cube = new THREE.Mesh(geometry, cubeMaterial);
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddleOutline = new THREE.Mesh(paddleGeometry, paddleOutlineMaterial);
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddleOutline2 = new THREE.Mesh(paddleGeometry, paddleOutlineMaterial);

    var line = new THREE.Line( lineGeometry, lineMaterial );
    const arenaBottomSide = arenaTopSide.clone();
    const arenaRightSide = arenaLeftSide.clone();

    // Add meshes to scene
    // scene.add(cube);
    scene.add(arenaFloor);
    scene.add(arenaLeftSide);
    scene.add(arenaTopSide);
    scene.add(arenaRightSide);
    scene.add(arenaBottomSide);
    scene.add(ball);
    scene.add(paddle);
    scene.add(paddleOutline);
    scene.add(paddleOutline2);
    scene.add(paddle2);
    // scene.add(line); // add back single line for middle of board


    arenaFloor.position.z -= 0.5;

    arenaTopSide.position.y += 4.75;
    arenaBottomSide.position.y -= 4.75;
    arenaRightSide.position.x += 8.25;
    arenaLeftSide.position.x -= 8.25;
    // cube.position.y += 3;
    paddle.position.x -= 7.25;
    paddleOutline.position.x = paddle.position.x;
    paddleOutline.scale.multiplyScalar(1.05);
    paddleOutline.scale.x *= 1.2;
    paddle2.position.x += 7.25;
    paddleOutline2.position.x = paddle2.position.x;
    paddleOutline2.scale.multiplyScalar(1.05);
    paddleOutline2.scale.x *= 1.2;      
}

function Loop()
{
    requestAnimationFrame(Loop);
    Update();
    Render();
}

function Update()
{
    if (keys.i)
    {
        console.log("[INFO]");
        console.log("POS x: " + camera.position.x + " y: " + camera.position.y + " z: " + camera.position.z);    
        console.log("ROTATION x: " + camera.rotation.x + " y: " + camera.rotation.y + " z: " + camera.rotation.z);    
    
    }
    const paddleSize = paddle.geometry.parameters.height;
    if (keys.w && paddle.position.y + paddleSize / 2 < MAX_HEIGHT)
        paddle.position.y += PADDLE_SPEED;
    else if (keys.s && paddle.position.y - paddleSize / 2 > MIN_HEIGHT)
        paddle.position.y -= PADDLE_SPEED;

    if (paddle.position.y + paddleSize / 2 > MAX_HEIGHT)
        paddle.position.y = MAX_HEIGHT - paddleSize / 2;
    else if (paddle.position.y - paddleSize / 2  < MIN_HEIGHT)
        paddle.position.y = MIN_HEIGHT + paddleSize / 2;

    paddleOutline.position.y = paddle.position.y;

    // console.log(paddle2.geometry.parameters);
    // console.log("[paddle2 pos] x: " + paddle2.position.x + " y: " + paddle2.position.y + " z: " + paddle2.position.z)
    if (keys.arrowup && paddle2.position.y + paddle2.geometry.parameters.height / 2 < MAX_HEIGHT)
        paddle2.position.y += PADDLE_SPEED;
    else if (keys.arrowdown && paddle2.position.y - paddle2.geometry.parameters.height / 2 > MIN_HEIGHT)
        paddle2.position.y -= PADDLE_SPEED;

    if (paddle2.position.y + paddleSize / 2 > MAX_HEIGHT)
        paddle2.position.y = MAX_HEIGHT - paddleSize / 2;
    else if (paddle2.position.y - paddleSize / 2  < MIN_HEIGHT)
        paddle2.position.y = MIN_HEIGHT + paddleSize / 2;

    paddleOutline2.position.y = paddle2.position.y;


    // BALL
    ball.position.x += ballSpeed.x;
    ball.position.y += ballSpeed.y;
    ball.rotation.x += 2 * ballSpeed.x;
    ball.rotation.y += 2 * ballSpeed.y;

    if (ball.position.x - BALL_SIZE < -8 || ball.position.x + BALL_SIZE > 8)
        ballSpeed.x = -ballSpeed.x;
    if (ball.position.y - BALL_SIZE < MIN_HEIGHT || ball.position.y + BALL_SIZE > MAX_HEIGHT)
        ballSpeed.y = -ballSpeed.y;

    // Rotate cube
    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;

    controls.update();
}

function Render()
{
    renderer.render(scene, camera);
}


