import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';

// standard global variables
var scene, camera, renderer, controls, loader;
// var keyboard = new THREEx.KeyboardState();

// custom global variables
var cube, line, ball, ballBB, leftPaddle, leftPaddleOutLine, leftPaddleBB, rightPaddle, rightPaddleOutLine, rightPaddleBB, keys, textMesh;
const PADDLE_SPEED = 0.2;
const BALL_SPEED = 0.1;
const BALL_SIZE = 0.2;
const MAX_HEIGHT = 4.5; // idk how to name this
const MIN_HEIGHT = -4.5;
var ballSpeed = {x: BALL_SPEED, y: BALL_SPEED};
var leftPlayerScore = 0;
var rightPlayerScore = 0;
var pause = false;

// TODO: I think i should load everything (all font, textures...) before initializing the rest
// Load();
Init();
Loop();

function abs(num)
{
    if (num < 0)
        return (-num);
    return (num);
}

function onWindowResize()
{

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

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
        textGeometry.computeBoundingBox();
        const textBoundingBox = textGeometry.boundingBox;
        const textSize = new THREE.Vector3();
        textBoundingBox.getSize(textSize);
        textMesh.position.x = -textSize.x / 2;
        textMesh.position.y = -textSize.y / 2;
        textMesh.position.z = -textSize.z / 2;

        textMesh.position.y += 6;
        textMesh.position.z += 1.5;
        // console.log("[text] x: " + textMesh.position.x + " y: " + textMesh.position.y + " z: " + textMesh.position.z);
		// console.log("[line] x: " + line.position.x + " y: " + line.position.y + " z: " + line.position.z);
        textMesh.rotateX(45);

        scene.add(textMesh);
    } );
}

function Init()
{
    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // CAMERA
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    // var SCREEN_WIDTH = 900, SCREEN_HEIGHT = 700;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 2000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.set(0, -11, 13);
    camera.lookAt(0, 0, 0);
    scene.add(camera);

    // WINDOW RESIZE
	window.addEventListener( 'resize', onWindowResize );
	console.log("width: " + SCREEN_WIDTH + " height: " + SCREEN_HEIGHT);


    // RENDERER
    renderer = new THREE.WebGLRenderer({antialias: true, canvas: gameCanvas});
	renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.outputEncoding = THREE.sRGBEncoding;
    // renderer.setClearColor(0x1c1c1c, 1); // same as scene.background
    document.body.appendChild(renderer.domElement);
    // renderer.setAnimationLoop(animate);

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
        i: false,
        escape: false
      };

    document.body.addEventListener( 'keydown', function(e) {

    var key = e.code.replace('Key', '').toLowerCase();
    // console.log("key: " + key);
    if (key == "escape" && keys.escape == false)
        pause = !pause;
    if ( keys[ key ] !== undefined )
        keys[ key ] = true;

    });
    document.body.addEventListener( 'keyup', function(e) {

    var key = e.code.replace('Key', '').toLowerCase();
    if ( keys[ key ] !== undefined )
        keys[ key ] = false;

    });


    // TEXT
    loader = new FontLoader();

    createScoreText();


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
    const redWireframeMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    const paddleOutlineMaterial = new THREE.MeshBasicMaterial({ color: 0xd1d1d1, side: THREE.BackSide });
    // const cubeMaterial = new THREE.MeshStandardMaterial({map: cubeMap, aoMap: cubeAoMap, roughnessMap: cubeRoughnessMap, normalMap: cubeNormalMap});
    const ballMaterial = new THREE.MeshBasicMaterial({map: ballTexture});
 

    // CUSTOM GEOMETRY

    // Arena
    const arenaFloorGeometry = new THREE.BoxGeometry(16, 9, 0.5);
    const arenaSmallSideGeometry = new THREE.BoxGeometry(0.5, 10, 0.5);
    const arenaLargeSideGeometry = new THREE.BoxGeometry(17, 0.5, 0.5);
    const arenaFloor = new THREE.Mesh(arenaFloorGeometry, blackMaterial);
    const arenaLeftSide = new THREE.Mesh(arenaSmallSideGeometry, whiteMaterial);
    const arenaTopSide = new THREE.Mesh(arenaLargeSideGeometry, whiteMaterial);
    const arenaBottomSide = arenaTopSide.clone();
    const arenaRightSide = arenaLeftSide.clone();
    scene.add(arenaFloor);
    scene.add(arenaLeftSide);
    scene.add(arenaTopSide);
    scene.add(arenaRightSide);
    scene.add(arenaBottomSide);
    arenaFloor.position.z -= 0.5;
    arenaTopSide.position.y += 4.75;
    arenaBottomSide.position.y -= 4.75;
    arenaRightSide.position.x += 8.25;
    arenaLeftSide.position.x -= 8.25;

    // Ball
    const cubeGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
    const ballGeometry = new THREE.SphereGeometry(BALL_SIZE, 64, 32);
    cube = new THREE.Mesh(cubeGeometry, redWireframeMaterial);
    ball = new THREE.Mesh(ballGeometry, ballMaterial);
    scene.add(cube);
    scene.add(ball);

    ballBB = new THREE.Sphere(ball.position, BALL_SIZE);

  
    // Paddles
    const paddleGeometry = new THREE.BoxGeometry(0.2, 2, 0.2);
    leftPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    leftPaddleOutLine = new THREE.Mesh(paddleGeometry, paddleOutlineMaterial);
    rightPaddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
    rightPaddleOutLine = new THREE.Mesh(paddleGeometry, paddleOutlineMaterial);
    scene.add(leftPaddle);
    scene.add(leftPaddleOutLine);
    scene.add(rightPaddleOutLine);
    scene.add(rightPaddle);
    leftPaddle.position.x -= 7.5;
    leftPaddleOutLine.position.x = leftPaddle.position.x;
    leftPaddleOutLine.scale.multiplyScalar(1.05);
    leftPaddleOutLine.scale.x *= 1.2;
    rightPaddle.position.x += 7.5;
    rightPaddleOutLine.position.x = rightPaddle.position.x;
    rightPaddleOutLine.scale.multiplyScalar(1.05);
    rightPaddleOutLine.scale.x *= 1.2;

    leftPaddleBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    leftPaddleBB.setFromObject(leftPaddle);
    
    rightPaddleBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    rightPaddleBB.setFromObject(rightPaddle);

    
    // Middle Line
    
    const points = [];
    points.push( new THREE.Vector3( 0, MAX_HEIGHT, -0.20 ) );
    points.push( new THREE.Vector3( 0, MIN_HEIGHT, -0.20) );
    const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
    line = new THREE.Line( lineGeometry, lineMaterial );
    scene.add(line);
    line.computeLineDistances();

   
}

function Loop()
{
    requestAnimationFrame(Loop);
    if (!pause)
    {
        Update();
        Render();
    }
}

function Update()
{
    // Info
    if (keys.i)
    {
        console.log("[INFO]");
        // console.log("POS x: " + camera.position.x + " y: " + camera.position.y + " z: " + camera.position.z);
        // console.log("ROTATION x: " + camera.rotation.x + " y: " + camera.rotation.y + " z: " + camera.rotation.z);
        console.log("[right paddle] x: " + leftPaddle.position.x + " y: " + leftPaddle.position.y + " z: " + leftPaddle.position.z);
		console.log("[ball] x: " + ball.position.x + " y: " + ball.position.y + " z: " + ball.position.z);
		console.log("[ballBB] x: " + ballBB.position.x + " y: " + ballBB.position.y + " z: " + ballBB.position.z);
        console.log("[right paddle] x: " + rightPaddle.position.x + " y: " + rightPaddle.position.y + " z: " + rightPaddle.position.z);
    }
    
    // Paddle movement
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

    leftPaddleOutLine.position.y = leftPaddle.position.y;

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

    rightPaddleOutLine.position.y = rightPaddle.position.y;


    // Ball movement
    ball.position.x += ballSpeed.x;
    ball.position.y += ballSpeed.y;
    ball.rotation.x += 2 * ballSpeed.x;
    ball.rotation.y += 2 * ballSpeed.y;

    if (ball.position.x - BALL_SIZE <= -8)
    {
        rightPlayerScore += 1;
        createScoreText();
        ball.position.x = 0;
        ball.position.y = 0;
    }
    if (ball.position.x + BALL_SIZE >= 8)
    {
        leftPlayerScore += 1;
        createScoreText();
        ball.position.x = 0;
        ball.position.y = 0;
    }
    if (ball.position.y - BALL_SIZE < MIN_HEIGHT || ball.position.y + BALL_SIZE > MAX_HEIGHT)
        ballSpeed.y = -ballSpeed.y;


    // Wireframe Cube
    cube.position.x = ball.position.x;
    cube.position.y = ball.position.y;

    // // ballBB.copy(ball.geometry.boundingBox);
    leftPaddleBB.copy(leftPaddle.geometry.boundingBox).applyMatrix4(leftPaddle.matrixWorld);
    rightPaddleBB.copy(rightPaddle.geometry.boundingBox).applyMatrix4(rightPaddle.matrixWorld);

	// BALL-PADDLE COLLISIONS
    // TODO: collision with upper and lower side of the paddle

    if (ballBB.intersectsBox(rightPaddleBB))
    {
        cube.material.color = new THREE.Color(0x00ff00);
        ballSpeed.x = -ballSpeed.x;
        ball.position.x += ballSpeed.x;
    }
    else
    cube.material.color = new THREE.Color(0xff0000);

    
    if (ballBB.intersectsBox(leftPaddleBB))
        {
            cube.material.color = new THREE.Color(0x00ff00);
            ballSpeed.x = -ballSpeed.x;
            ball.position.x += ballSpeed.x;
        }
        else
            cube.material.color = new THREE.Color(0xff0000);
        
    

    // if (abs(ball.position.x - leftPaddle.position.x) <= BALL_SIZE + paddleWidth / 2
    //     && abs(ball.position.y - leftPaddle.position.y) <= BALL_SIZE + paddleHeight / 2)
    // {
    //     if (ball.position.y + BALL_SIZE > leftPaddle.position.y + paddleHeight / 2
    //         || ball.position.y - BALL_SIZE < leftPaddle.position.y - paddleHeight / 2)
    //         {
    //             // console.log("hit top of left paddle");
    //             ballSpeed.y = -ballSpeed.y;
    //         }
    //     ballSpeed.x = -ballSpeed.x;
    //     ball.position.x += ballSpeed.x;
    // }
    // else if (abs(ball.position.x - rightPaddle.position.x) <= BALL_SIZE + paddleWidth / 2
    //     && abs(ball.position.y - rightPaddle.position.y) <= BALL_SIZE + paddleHeight / 2)
    // {
    //     if (ball.position.y + BALL_SIZE > rightPaddle.position.y + paddleHeight / 2
    //         || ball.position.y - BALL_SIZE < rightPaddle.position.y - paddleHeight / 2)
    //         {
    //             // console.log("hit top of right paddle");
    //             ballSpeed.y = -ballSpeed.y;
    //         }
    //     ballSpeed.x = -ballSpeed.x;
    //     ball.position.x += ballSpeed.x;
    // }

   
    controls.update();
}

function Render()
{
    renderer.render(scene, camera);
}


