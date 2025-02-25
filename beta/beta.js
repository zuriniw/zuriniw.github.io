import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, controls;
const roomMap = new Map(); // 房间实例存储

async function init() {
    // 初始化基础场景
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 加载配置
    const config = await loadConfig();

    // 创建房间系统
    createRoomSystem(config.rooms);

    // 创建体素系统
    createVoxelSystem(config.voxels);

    // 光照配置
    setupLighting();

    // 相机与控制
    setupCameraControls();

    // 启动动画循环
    animate();
}

function createRoomSystem(rooms) {
    rooms.forEach(room => {
        const geometry = new THREE.BoxGeometry(...room.size);
        const material = new THREE.MeshPhongMaterial({
            color: 0x2194fa,
            transparent: true,
            opacity: 0.3
        });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.fromArray(room.position);
        cube.position.y += room.size[1]/2; // 底面定位修正
        roomMap.set(rooms.indexOf(room), cube); // 存储房间实例
        scene.add(cube);
    });
}

function createVoxelSystem(voxels) {
    if (!voxels || !voxels.length) return;
    
    // 创建渐变色映射器
    const colorGradient = [
        [0, new THREE.Color(0x00ff00)], // 绿色 (weight 0)
        [0.5, new THREE.Color(0xffff00)], // 黄色
        [1, new THREE.Color(0xff0000)] // 红色 (weight 1)
    ];
    
    // 创建实例化mesh
    const geometry = new THREE.BoxGeometry(0.2, 0.2, 0.2);
    const material = new THREE.MeshPhongMaterial({ vertexColors: true });
    const instancedMesh = new THREE.InstancedMesh(geometry, material, voxels.length);
    
    // 颜色属性数组
    const colors = new Float32Array(voxels.length * 3);
    const dummy = new THREE.Object3D();
    
    voxels.forEach((voxel, i) => {
        // 计算归一化权重
        const t = Math.min(Math.max(voxel.weight, 0), 1);
        
        // 插值颜色
        let color;
        for (let j = 1; j < colorGradient.length; j++) {
            if (t <= colorGradient[j][0]) {
                const [prevT, prevColor] = colorGradient[j-1];
                const [nextT, nextColor] = colorGradient[j];
                const ratio = (t - prevT)/(nextT - prevT);
                color = prevColor.clone().lerp(nextColor, ratio);
                break;
            }
        }
        
        // 如果没有找到颜色（例如，当t > 1时），使用最后一个颜色
        if (!color) {
            color = colorGradient[colorGradient.length - 1][1].clone();
        }
        
        // 设置颜色数据
        colors[i*3] = color.r;
        colors[i*3+1] = color.g;
        colors[i*3+2] = color.b;
        
        // 获取关联房间的位置
        const room = roomMap.get(voxel.cluster);
        const roomPos = room ? room.position : new THREE.Vector3();
        
        // 设置实例位置
        dummy.position.set(
            roomPos.x + voxel.position[0],
            roomPos.y + voxel.position[1],
            roomPos.z + voxel.position[2]
        );
        dummy.updateMatrix();
        instancedMesh.setMatrixAt(i, dummy.matrix);
    });
    
    // 设置顶点颜色
    geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colors, 3));
    instancedMesh.instanceMatrix.needsUpdate = true; // 更新实例矩阵
    scene.add(instancedMesh);
}

function setupLighting() {
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
}

function setupCameraControls() {
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}

async function loadConfig() {
  try {
      const response = await fetch('beta.json');
      if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
      }   
      const config = await response.json();
      return config;
  } catch (error) {
      console.error('Error loading configuration:', error);
      return null;
  }
}

function animate() {
    requestAnimationFrame(animate);
    
    if (controls) controls.update();
    
    renderer.render(scene, camera);
}

// 窗口大小变化时调整渲染器和相机
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

// 初始化应用
init();
