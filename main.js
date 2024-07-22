import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// standard global variables
var scene, camera, renderer, controls;
// var keyboard = new THREEx.KeyboardState();

// custom global variables
var cube, ball, paddle, paddleOutline, paddle2, paddleOutline2, keys;
const PADDLE_SPEED = 0.1;
const BALL_SPEED = 0.1;
const BALL_SIZE = 0.2;
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
    camera.position.set(0, 0, 13);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    // renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    // CONTROLS
    controls = new OrbitControls( camera, renderer.domElement);
    controls.update();

    // LIGHT
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
        arrowdown: false
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
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const paddleGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const ballGeometry = new THREE.SphereGeometry(BALL_SIZE, 64, 32);
    const points = [];
    points.push( new THREE.Vector3( -8, 4.5, 0 ) );
    points.push( new THREE.Vector3( 8, 4.5, 0 ) );
    points.push( new THREE.Vector3( 8, -4.5, 0 ) );
    points.push( new THREE.Vector3( -8, -4.5, 0 ) );
    points.push( new THREE.Vector3( -8, 4.5, 0 ) );

    const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );


    // Create materials
    const purpleMaterial = new THREE.MeshBasicMaterial({ color: 0xd442f5 });
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x212121 });
    const paddleOutlineMaterial = new THREE.MeshBasicMaterial({ color: 0xd1d1d1, side: THREE.BackSide });

    // const lineMaterial = new THREE.LineBasicMaterial( { color: 0x0000ff } );
    const lineMaterial = new THREE.LineDashedMaterial({ color: 0x0000ff });

    // Create meshes
    cube = new THREE.Mesh(geometry, purpleMaterial);
    ball = new THREE.Mesh(ballGeometry, purpleMaterial)
    paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddleOutline = new THREE.Mesh(paddleGeometry, paddleOutlineMaterial);
    paddle2 = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddleOutline2 = new THREE.Mesh(paddleGeometry, paddleOutlineMaterial);

    var line = new THREE.Line( lineGeometry, lineMaterial );

    // Add meshes to scene
    scene.add(cube);
    scene.add(ball);
    scene.add(paddle);
    scene.add(paddleOutline);
    scene.add(paddleOutline2);
    scene.add(paddle2);
    scene.add(line);


    cube.position.y += 3;
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
    logInput();
    Update();
    Render();
}

function Update()
{
    if (keys.w)
        paddle.position.y += PADDLE_SPEED;
    else if (keys.s)
        paddle.position.y -= PADDLE_SPEED;

    paddleOutline.position.y = paddle.position.y;

    if (keys.arrowup)
        paddle2.position.y += PADDLE_SPEED;
    else if (keys.arrowdown)
        paddle2.position.y -= PADDLE_SPEED;

    paddleOutline2.position.y = paddle2.position.y;


    // BALL
    ball.position.x += ballSpeed.x;
    ball.position.y += ballSpeed.y;

    if (ball.position.x - BALL_SIZE < -8 || ball.position.x + BALL_SIZE > 8)
        ballSpeed.x = -ballSpeed.x;
    if (ball.position.y - BALL_SIZE < -4.5 || ball.position.y + BALL_SIZE > 4.5)
        ballSpeed.y = -ballSpeed.y;

    // Rotate cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    controls.update();
}

function Render()
{
    renderer.render(scene, camera);
}

function logInput()
{
    // console.log("up: " + keys.up);
    // console.log("w: " + keys.w);
    // console.log("a: " + keys.a);
    // console.log("s: " + keys.s);
    // console.log("d: " + keys.d);
}
