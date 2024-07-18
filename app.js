// Create scene
const scene = new THREE.Scene();

// Create renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.z = 5;

// Create geometry
const geometry = new THREE.BoxGeometry();

// Create material
const material = new THREE.MeshBasicMaterial({ color: 0xd442f5 });

// Create mesh
const cube = new THREE.Mesh(geometry, material);


// Add mesh to scene
scene.add(cube);


// Render scene
function animate()
{
    requestAnimationFrame(animate);
    
    // Rotate cube
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;

    // Render scene with camera
    renderer.render(scene, camera);
}

animate();