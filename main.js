import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// standard global variables
var scene, camera, renderer, controls, loader;
// var keyboard = new THREEx.KeyboardState();

// custom global variables
var cube, ball, leftPaddle, paddleOutline, rightPaddle, paddleOutline2, keys, textMesh;
const PADDLE_SPEED = 0.2;
const BALL_SPEED = 0.1;
const BALL_SIZE = 0.2;
const MAX_HEIGHT = 4.5; // idk how to name this
const MIN_HEIGHT = -4.5;
var ballSpeed = {x: BALL_SPEED, y: BALL_SPEED};
var leftPlayerScore = 0;
var rightPlayerScore = 0;

// TODO: I think i should load everything (all font, textures...) before initializing the rest
// Load();
Init();
Loop();

function createScoreText()
{
    if (textMesh) {
        scene.remove(textMesh);
        textMesh.geometry.dispose();
        textMesh.material.dispose();
    }
    loader.load( 'fonts/roboto_condensed.json', function ( font ) {

        const textGeometry = new TextGeometry( leftPlayerScore + "  :  " + rightPlayerScore, {
            font: font,
            size: 1,
            // !!!! Use height and not depth
            height: 0.1,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        });

        const textMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
        textMesh = new THREE.Mesh(textGeometry, textMaterial);

        // Compute the bounding box and center the text
        // textGeometry.computeBoundingBox();
        // const boundingBox = textGeometry.boundingBox;
        // const size = new THREE.Vector3();
        // boundingBox.getSize(size);
        // scoreMesh.position.x = -size.x / 2;
        // scoreMesh.position.y = -size.y / 2;
        // scoreMesh.position.z = -size.z / 2;

        textMesh.position.y += 6;
        textMesh.position.z += 1.5;
        textMesh.rotateX(45);
        textMesh.position.x -= 1.5;

        scene.add(textMesh);
    } );
}

function Init()
{
    // SCENE
    scene = new THREE.Scene();

    // CAMERA
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 2000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, -11, 13);
    camera.lookAt(0, 0, 0);
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
    const geometry = new THREE.SphereGeometry(4, 64, 32);
    const arenaFloorGeometry = new THREE.BoxGeometry(16, 9, 0.5);
    const arenaSmallSideGeometry = new THREE.BoxGeometry(0.5, 10, 0.5);
    const arenaLargeSideGeometry = new THREE.BoxGeometry(17, 0.5, 0.5);
    const paddleGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    const ballGeometry = new THREE.SphereGeometry(BALL_SIZE, 64, 32);
    const points = [];
    points.push( new THREE.Vector3( 0, MAX_HEIGHT, -0.20 ) );
    points.push( new THREE.Vector3( 0, MIN_HEIGHT, -0.20) );

    const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );

    // TEXTURES
    const textureLoader = new THREE.TextureLoader();
    // const cubeMap = textureLoader.load( "./textures/honeycomb/Honeycomb_basecolor.jpg");
    // const cubeAoMap = textureLoader.load( "./textures/honeycomb/Honeycomb_ambientOcclusion.jpg");
    // const cubeRoughnessMap = textureLoader.load( "textures/honeycomb/Honeycomb_roughness.jpg");
    // const cubeHeightMap = textureLoader.load( "textures/honeycomb/Honeycomb_height.png");
    // const cubeNormalMap = textureLoader.load( "textures/honeycomb/Honeycomb_normal.jpg");
    const ballTexture = textureLoader.load("./textures/ball_texture.png")

    // MATERIAL
    const lineMaterial = new THREE.LineDashedMaterial( { color: 0x353535, linewidth: 1, scale: 1, dashSize: 0.5, gapSize: 0.5 } );
    const paddleMaterial = new THREE.MeshBasicMaterial({ color: 0x353535 });
    const whiteMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const paddleOutlineMaterial = new THREE.MeshBasicMaterial({ color: 0xd1d1d1, side: THREE.BackSide });
    // const cubeMaterial = new THREE.MeshStandardMaterial({map: cubeMap, aoMap: cubeAoMap, roughnessMap: cubeRoughnessMap, normalMap: cubeNormalMap});
    const ballMaterial = new THREE.MeshBasicMaterial({map: ballTexture});


    // TEXT
    loader = new FontLoader();

    createScoreText();

    // MESH
    const arenaFloor = new THREE.Mesh(arenaFloorGeometry, blackMaterial);
    const arenaLeftSide = new THREE.Mesh(arenaSmallSideGeometry, whiteMaterial);
    const arenaTopSide = new THREE.Mesh(arenaLargeSideGeometry, whiteMaterial);
    // cube = new THREE.Mesh(geometry, cubeMaterial);
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    paddleOutline = new THREE.Mesh(paddleGeometry, paddleOutlineMaterial);
    rightPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
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
    scene.add(leftPaddle);
    scene.add(paddleOutline);
    scene.add(paddleOutline2);
    scene.add(rightPaddle);
    scene.add(line);


    line.computeLineDistances();
    arenaFloor.position.z -= 0.5;
    arenaTopSide.position.y += 4.75;
    arenaBottomSide.position.y -= 4.75;
    arenaRightSide.position.x += 8.25;
    arenaLeftSide.position.x -= 8.25;
    // cube.position.y += 3;
    leftPaddle.position.x -= 7.25;
    paddleOutline.position.x = leftPaddle.position.x;
    paddleOutline.scale.multiplyScalar(1.05);
    paddleOutline.scale.x *= 1.2;
    rightPaddle.position.x += 7.25;
    paddleOutline2.position.x = rightPaddle.position.x;
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
    const paddleHeight = leftPaddle.geometry.parameters.height;
	const paddleWidth = leftPaddle.geometry.parameters.width;
    if (keys.w && leftPaddle.position.y + paddleHeight / 2 < MAX_HEIGHT)
        leftPaddle.position.y += PADDLE_SPEED;
    else if (keys.s && leftPaddle.position.y - paddleHeight / 2 > MIN_HEIGHT)
        leftPaddle.position.y -= PADDLE_SPEED;

    if (leftPaddle.position.y + paddleHeight / 2 > MAX_HEIGHT)
        leftPaddle.position.y = MAX_HEIGHT - paddleHeight / 2;
    else if (leftPaddle.position.y - paddleHeight / 2  < MIN_HEIGHT)
        leftPaddle.position.y = MIN_HEIGHT + paddleHeight / 2;

    paddleOutline.position.y = leftPaddle.position.y;

    // console.log(rightPaddle.geometry.parameters);
    // console.log("[rightPaddle pos] x: " + rightPaddle.position.x + " y: " + rightPaddle.position.y + " z: " + rightPaddle.position.z)
    if (keys.arrowup && rightPaddle.position.y + rightPaddle.geometry.parameters.height / 2 < MAX_HEIGHT)
        rightPaddle.position.y += PADDLE_SPEED;
    else if (keys.arrowdown && rightPaddle.position.y - rightPaddle.geometry.parameters.height / 2 > MIN_HEIGHT)
        rightPaddle.position.y -= PADDLE_SPEED;

    if (rightPaddle.position.y + paddleHeight / 2 > MAX_HEIGHT)
        rightPaddle.position.y = MAX_HEIGHT - paddleHeight / 2;
    else if (rightPaddle.position.y - paddleHeight / 2  < MIN_HEIGHT)
        rightPaddle.position.y = MIN_HEIGHT + paddleHeight / 2;

    paddleOutline2.position.y = rightPaddle.position.y;


    // BALL
    ball.position.x += ballSpeed.x;
    ball.position.y += ballSpeed.y;
    ball.rotation.x += 2 * ballSpeed.x;
    ball.rotation.y += 2 * ballSpeed.y;

    if (ball.position.x - BALL_SIZE < -8)
    {
        rightPlayerScore += 1;
        createScoreText();
        ballSpeed.x = -ballSpeed.x; //
    }
    if (ball.position.x + BALL_SIZE > 8)
    {
        leftPlayerScore += 1;
        createScoreText();
        ballSpeed.x = -ballSpeed.x; //
    }
    if (ball.position.y - BALL_SIZE < MIN_HEIGHT || ball.position.y + BALL_SIZE > MAX_HEIGHT)
        ballSpeed.y = -ballSpeed.y;


	// PADDLE COLLISIONS
	if (ball.position.x + BALL_SIZE > rightPaddle.position.x - paddleWidth / 2
		&& ball.position.y + BALL_SIZE > rightPaddle.position.y - paddleHeight / 2
		&& ball.position.y + BALL_SIZE < rightPaddle.position.y + paddleHeight / 2)
	{
		ballSpeed.x = -ballSpeed.x
		// console.log("hit");
	}

	if (ball.position.x - BALL_SIZE < leftPaddle.position.x + paddleWidth / 2
		&& ball.position.y + BALL_SIZE > leftPaddle.position.y - paddleHeight / 2
		&& ball.position.y + BALL_SIZE < leftPaddle.position.y + paddleHeight / 2)
	{
		ballSpeed.x = -ballSpeed.x
		// console.log("hit");
	}


    controls.update();
}

function Render()
{
    renderer.render(scene, camera);
}


