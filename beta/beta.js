import * as THREE from 'three';
import { computeBoundsTree, disposeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ef_init } from './edge_finder.js'; 
// 导入必要的后处理模块
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
// import { clusters,projects } from '/Users/ziru/Documents/GitHub/autoPortfolio/project_clusters.json';

var scene, camera, renderer, cameraHolder, roomMap, composer;

var voxelMeshes = [];  // 存储所有的体素网格

var keyboard = {};
var player = { height: 1.8, speed: 0.1, turnSpeed: Math.PI * 0.02 };
var mouseControl = {
  isActive: false,
  sensitivity: 0.002,  // 鼠标灵敏度
  wheelSpeed: 0.05    // 滚轮灵敏度
};

// 添加相机状态管理
var cameraState = {
    isTopView: false,
    defaultPosition: new THREE.Vector3(0, 0, 3),
    defaultRotation: new THREE.Euler(0, 0, 0),
    topViewPosition: new THREE.Vector3(0, 20, 0),
    topViewRotation: new THREE.Euler(-Math.PI/2, 0, 0),
    transitionDuration: 1000, // 过渡动画持续时间（毫秒）
    transitioning: false
};

// 初始化 roomMap
roomMap = new Map();

async function loadConfig() {
  try {
      // const response = await fetch('beta.json');
      const response = await fetch('project_clusters.json');

  
      if (!response.ok) {
          throw new Error('HTTP error! Status: ' + response.status);
      }   
      const config = await response.json();
      return config;
  } catch (error) {
      console.error('Error loading configuration:', error);
      return null;
  }
}

function createWall(width, height, depth, position, material) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const config = {
    width: 0.008,
    alpha: true,
    invert: false,
    mode: 0,
    wave: 0,
    exp: 50
  };
  const wall = ef_init(
    geometry,
    THREE.Mesh,
    THREE.ShaderMaterial,
    THREE.Float32BufferAttribute,
    config,
    0.000001,
    0.000001
  );
  wall.position.set(...position);
  return wall;
}

// 辅助函数：创建地板
function createRoomFloor(width, depth, position, color) {
  // 创建基础几何体
  const geometry = new THREE.BoxGeometry(width, 0.1, depth);
  
  // 创建基础材质 - 使用传入的颜色
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.15,  // 降低透明度使颜色更淡
    depthWrite: false
  });
  
  // 创建基础网格
  const floor = new THREE.Mesh(geometry, material);
  floor.position.set(...position);
  
  // 创建边缘几何体
  const edges = new THREE.EdgesGeometry(geometry, 15);
  
  // 创建边缘材质 - 使用相同的颜色但透明度更高
  const lineMaterial = new THREE.LineBasicMaterial({ 
    color: color,
    transparent: true,
    opacity: 0.3,
    linewidth: 1
  });
  
  // 创建边缘线条
  const line = new THREE.LineSegments(edges, lineMaterial);
  
  // 将线条添加为地板的子对象
  floor.add(line);
  
  return floor;
}

// 辅助函数：检查xz平面上，点是否在某个房间内
// function isPointInsideRoom(point, room) {
//   const [x, y, z] = point;
//   const [roomX, roomZ] = room.position;
//   const [width, depth] = room.size;

//   return (
//       x >= roomX - width / 2 &&
//       x <= roomX + width / 2 &&
//       z >= roomZ - depth / 2 &&
//       z <= roomZ + depth / 2
//   );
// }

function createRoomSystem(rooms) {
  rooms.forEach((room, roomIndex) => {
      const [width,depth] = room.size;
      const height = 4;
      const wallThickness = 0.2; // 墙壁厚度
      const height_center = height / 2+1; // 墙体居中对齐高度

      // 使用clusterColors数组获取对应的颜色
      const clusterColor = clusterColors[roomIndex % clusterColors.length];

      const material = new THREE.MeshPhongMaterial({
          color: 0x2194fa,
      });

      // 生成随机地板高度偏移量（±0.2范围内）
      const floorHeightOffset = (Math.random() * 1) - 0.5; // -0.5 到 +0.5 之间的随机值
      // 计算地板高度，整体降低0.4个单位
      const floorY = -height / 2 + floorHeightOffset - 0.4; 
      const room_z = room.position[1];
      const room_x = room.position[0];
      const room_y = 0;

      // 创建地板时传入cluster对应的颜色
      const roomfloor = createRoomFloor(width, depth, [room_x, floorY, room_y], clusterColor);
      scene.add(roomfloor);

      // 定义四个角落的墙
      const corners = [
          // 左前角
          {
              wall1: createWall(wallThickness, height * 2, depth / 4, 
                  [room_x - width / 2 + wallThickness / 2, height_center, room_y - depth / 2 + depth / 8], material),
              wall2: createWall(width / 4, height * 2, wallThickness, 
                  [room_x - width / 2 + width / 8, height_center, room_y - depth / 2 + wallThickness / 2], material),
              point: [room_x - width / 2, room_z + depth / 2, room_y - height / 2] // 角落点
          },
          // 右前角
          {
              wall1: createWall(wallThickness, height * 2, depth / 4, 
                  [room_x + width / 2 - wallThickness / 2, height_center, room_y - depth / 2 + depth / 8], material),
              wall2: createWall(width / 4, height * 2, wallThickness, 
                  [room_x + width / 2 - width / 8, height_center, room_y - depth / 2 + wallThickness / 2], material),
              point: [room_x + width / 2,   room_z + depth / 2, room_y - height / 2] // 角落点
          },
          // 左后角
          {
              wall1: createWall(wallThickness, height * 2, depth / 4, 
                  [room_x - width / 2 + wallThickness / 2, height_center, room_y + depth / 2 - depth / 8], material),
              wall2: createWall(width / 4, height * 2, wallThickness, 
                  [room_x - width / 2 + width / 8, height_center, room_y + depth / 2 - wallThickness / 2], material),
              point: [room_x - width / 2, room_z + depth / 2, room_y + height / 2] // 角落点
          },
          // 右后角
          {
              wall1: createWall(wallThickness, height * 2, depth / 4, 
                  [room_x + width / 2 - wallThickness / 2, height_center, room_y + depth / 2 - depth / 8], material),
              wall2: createWall(width / 4, height * 2, wallThickness, 
                  [room_x + width / 2 - width / 8, height_center, room_y + depth / 2 - wallThickness / 2], material),
              point: [room_x + width / 2, room_z + depth / 2, room_y + height / 2] // 角落点
          }
      ];

      // 检查每个角落是否需要生成墙
      corners.forEach(corner => {
          // 随机选择一面墙回缩一个厚度的距离
          const wallToRecede = Math.random() < 0.5 ? corner.wall1 : corner.wall2;

          // 回缩墙的位置
          if (wallToRecede === corner.wall1) {
              // wall1 是垂直于 x 轴的墙，回缩 x 方向
              wallToRecede.position.x += wallThickness  * (Math.sign(wallToRecede.position.x - room.position[0]));
          } else {
              // wall2 是垂直于 z 轴的墙，回缩 z 方向
              wallToRecede.position.z += wallThickness  * (Math.sign(wallToRecede.position.z - room_y));
          }

          // 添加墙到场景
          scene.add(corner.wall1);
          scene.add(corner.wall2);
      });

      // 存储房间实例（包括地板）
      roomMap.set(roomIndex, [roomfloor]);
  });
}

// 定义一组不同的颜色
const clusterColors = [
  0x800080,  // 
  0x0A97B0,  // 
  0x0A5EB0,  // 
  'grey',  // 
  0xCDB699,  // 
];

// 创建虚线材质
const dashedLineMaterial = new THREE.LineDashedMaterial({
    color: 0xffffff,
    linewidth: 1,
    scale: 1,
    dashSize: 0.5,
    gapSize: 0.3,
    transparent: true,
    opacity: 0.3
});

// 按cluster创建连接线
function createClusterConnections(projects) {
    // 按cluster分组
    const clusterProjects = {};
    projects.forEach(project => {
        if (!clusterProjects[project.cluster]) {
            clusterProjects[project.cluster] = [];
        }
        clusterProjects[project.cluster].push(project);
    });

    // 为每个cluster创建连接线
    Object.entries(clusterProjects).forEach(([clusterId, projects]) => {
        // 按seq排序
        projects.sort((a, b) => a.seq - b.seq);
        
        // 创建线条几何体
        const points = [];
        projects.forEach(project => {
            points.push(new THREE.Vector3(...project.position));
        });
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, dashedLineMaterial);
        
        // 计算线段长度并更新虚线
        line.computeLineDistances();
        
        scene.add(line);
    });
}

function createVoxel(projects) {
    projects.forEach(project => {
        const [x, y, z] = project.position;
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

        // 根据project的cluster_id选择颜色
        const colorIndex = project.cluster % clusterColors.length;
        const color = clusterColors[colorIndex];

        // 创建带有对应颜色的透明材质
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        const cubeMesh = new THREE.Mesh(cubeGeometry, material);
        cubeMesh.position.set(x, y, z);
        voxelMeshes.push(cubeMesh);
        scene.add(cubeMesh);
    });

    // 创建连接线
    createClusterConnections(projects);
}

async function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, document.body.clientWidth / window.innerHeight, 0.1, 1000);
  scene.background = new THREE.Color(0x000000);  // 设置背景为黑色
  
  const config = await loadConfig();
  if (!config) {
      console.error('Failed to load configuration');
      return;
  }

  createRoomSystem(config.clusters);
  createVoxel(config.projects);

  cameraHolder = new THREE.Object3D();
  scene.add(cameraHolder);
  cameraHolder.position.set(0, player.height, 0);
  cameraHolder.add(camera);
  camera.position.set(0, 0, 3);

  console.log('Initial camera setup:');
  console.log('CameraHolder position:', cameraHolder.position);
  console.log('Camera position:', camera.position);
  console.log('Camera rotation:', camera.rotation);

  // Lighting
  var light = new THREE.PointLight(0xffffff, 1.3, 50, 2);
  light.position.set(-10, 20, 12);
  scene.add(light);

  var light2 = new THREE.PointLight(0xffffff, 1.3, 50, 2);
  light2.position.set(10, 20, 12);
  scene.add(light2);

  var spotLight = new THREE.SpotLight(0xffffff, 0.1);
  spotLight.position.set(10, 80, 10);
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 500;
  spotLight.shadow.mapSize.height = 500;
  spotLight.shadow.camera.near = .25;
  spotLight.shadow.camera.far = 1000;
  spotLight.shadow.camera.fov = 3;
  scene.add(spotLight);

  // Render 
  renderer = new THREE.WebGLRenderer({
    antialias: true,  // 添加抗锯齿
    alpha: true       // 允许透明背景
  });
  renderer.setSize(document.body.clientWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  // Resize to the size of the screen
  window.addEventListener('resize', function() {
    var width = document.body.clientWidth;
    var height = window.innerHeight;
    renderer.setSize( width, height );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

  // 添加鼠标事件监听
  document.addEventListener('mousedown', function(e) {
    if (e.button === 0) { // 左键点击
      mouseControl.isActive = true;
    }
  });
  
  document.addEventListener('mouseup', function(e) {
    if (e.button === 0) { // 左键释放
      mouseControl.isActive = false;
    }
  });
  
  document.addEventListener('mousemove', function(e) {
    if (mouseControl.isActive) {
      cameraHolder.rotation.y -= e.movementX * mouseControl.sensitivity;
    }
  });
  
  // 防止鼠标拖动时选中文本
  document.addEventListener('selectstart', function(e) {
    if (mouseControl.isActive) {
      e.preventDefault();
    }
  });

  // 添加鼠标滚轮事件监听
  document.addEventListener('wheel', function(e) {
    // 获取滚轮方向
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(cameraHolder.quaternion);
    
    // 计算前进方向
    const forward = new THREE.Vector3(direction.x, 0, direction.z).normalize();
    
    // deltaY 向上滚动为负，向下滚动为正
    // 向上滚动前进，向下滚动后退
    const moveAmount = -e.deltaY * mouseControl.wheelSpeed;
    cameraHolder.position.add(forward.multiplyScalar(moveAmount));
  }, { passive: true });  // 使用 passive 监听器提高性能

    // 使用导入的类而不是通过 THREE 命名空间
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // 修改辉光效果参数
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.1,    // 降低强度
        0.1,    // 半径
        0.9     // 提高阈值，使得只有更亮的物体才会发光
    );
    composer.addPass(bloomPass);


  animate();
}

function animate() {
  requestAnimationFrame(animate);
  
  // 更新所有体素的旋转
  voxelMeshes.forEach(voxel => {
      voxel.rotation.x += 0.01;
      voxel.rotation.y += 0.02;
  });

  // 使用 cameraHolder 的方向来计算移动
  const direction = new THREE.Vector3(0, 0, -1);
  direction.applyQuaternion(cameraHolder.quaternion);
  
  // 计算前进方向和侧向移动的向量
  const forward = new THREE.Vector3(direction.x, 0, direction.z).normalize();
  const right = new THREE.Vector3(forward.z, 0, -forward.x);

  if (keyboard[87]) { // W key
    cameraHolder.position.add(forward.clone().multiplyScalar(player.speed));
  }
  if (keyboard[83]) { // S key
    cameraHolder.position.add(forward.clone().multiplyScalar(-player.speed));
  }
  if (keyboard[68]) { // A key
    cameraHolder.position.add(right.clone().multiplyScalar(-player.speed));
  }
  if (keyboard[65]) { // D key
    cameraHolder.position.add(right.clone().multiplyScalar(player.speed));
  }
  if (keyboard[37]) { // left arrow key
    cameraHolder.rotation.y -= player.turnSpeed;
  }
  if (keyboard[39]) { // right arrow key
    cameraHolder.rotation.y += player.turnSpeed;
  }

  composer.render();
}

function keyDown(e) {
  keyboard[e.keyCode] = true;
  
  // 添加按键调试日志
  console.log('Key pressed:', e.keyCode);
  
  // 't'键的keyCode是84
  if (e.keyCode === 84) { // 't' key
    console.log('T key pressed, triggering top view toggle');
    toggleTopView();
  }
}

function keyUp(e) {
  keyboard[e.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

window.addEventListener('load', () => {
    init().catch(error => {
        console.error('Initialization failed:', error);
    });
});

// 修改toggleTopView函数，使用直接设置而不是TWEEN动画
function toggleTopView() {
    console.log('Toggle top view called');
    console.log('Current camera position:', camera.position);
    console.log('Current camera rotation:', camera.rotation);
    
    cameraState.isTopView = !cameraState.isTopView;
    console.log('Switching to:', cameraState.isTopView ? 'top view' : 'default view');
    
    if (cameraState.isTopView) {
        // 切换到顶视图
        cameraHolder.position.set(0, 30, 0);
        cameraHolder.rotation.x = -Math.PI/2;
        cameraHolder.rotation.y = 0;
        cameraHolder.rotation.z = 0;
    } else {
        // 恢复到默认视图
        cameraHolder.position.set(0, player.height, 0);
        cameraHolder.rotation.x = 0;
        cameraHolder.rotation.y = 0;
        cameraHolder.rotation.z = 0;
        camera.position.z = 3;
    }
    
    console.log('New camera holder position:', cameraHolder.position);
    console.log('New camera holder rotation:', cameraHolder.rotation);
}
