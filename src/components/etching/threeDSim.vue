<template>
  <div class="simulation-container">
    <div ref="container" class="three-container"></div>

    <div class="insight-panel">
      <a-card class="panel-card" :bordered="false">
        <template #title>
          <div class="panel-title">
            <div class="panel-title-left">
              <div class="panel-clock">{{ totalSimTimeDisplay }}</div>
              <div class="panel-subtitle">{{ lastUpdateDisplay }}</div>
            </div>
          </div>
        </template>

        <div class="panel-controls">
          <div class="panel-controls-left">
            <CaretRightOutlined @click="handleSimStart" />
            <PauseOutlined @click="handleSimStop" />
          </div>
          <a-select
            v-model:value="selectedScene"
            :options="simOptions"
            size="small"
            style="min-width: 120px"
          />
        </div>
        <div class="panel-table">
          <a-table
            size="small"
            :columns="eventColumns"
            :data-source="eventRows"
            :pagination="false"
            :scroll="{ y: 260 }"
            row-key="key"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'label'">
                <a-space size="small">
                  <a-badge :status="record.badgeStatus" />
                  <span class="event-label-text">{{ record.label }}</span>
                </a-space>
              </template>
              <template v-else-if="column.key === 'path'">
                <span class="event-path" :title="record.path">{{ record.path }}</span>
              </template>
              <template v-else-if="column.key === 'simTimeDisplay' || column.key === 'durationDisplay'">
                <span class="event-number">{{ record[column.key] }}</span>
              </template>
            </template>
          </a-table>
        </div>

        <template #actions>
          <div class="panel-footer">
            <div class="footer-stats">
              <div class="stat-item">
                <span class="stat-label">事件数:</span>
                <span class="stat-value">{{ eventSummary.eventCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">平均耗时:</span>
                <span class="stat-value">{{ avgDurationDisplay }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">晶圆数:</span>
                <span class="stat-value">{{ throughputDisplay }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">运行:</span>
                <span class="stat-value">{{ runDurationDisplay }}</span>
              </div>
              <div class="stat-item">
                <a-progress type="circle" :percent="progressPercent" :size="20" />
                <span class="stat-value">{{ statusLabel }}</span>
              </div>
            </div>
          </div>
        </template>
      </a-card>
    </div>

    <div v-if="helpersParams.isAnimation" class="timeline-panel">
      <div class="timeline-controls">
        <!-- <a-button size="small" type="primary" @click="onPlay" :disabled="timelineState.isPlaying">播放</a-button>
        <a-button size="small" @click="onPause" :disabled="!timelineState.isPlaying">暂停</a-button>
        <a-button size="small" @click="onRestart">重置</a-button> -->
        <CaretRightOutlined @click="onPlay" :disabled="timelineState.isPlaying" />
        <PauseOutlined @click="onPause" :disabled="!timelineState.isPlaying" />
        <PlusCircleOutlined />
        <div class="speed-control">
          <a-input-number addon-before="x" v-model:value="timelineState.speed" :min="0.1" :max="10" :step="0.1" @change="onSpeedChange" />
        </div>
        <MinusCircleOutlined />
        <ForwardOutlined />
      </div>
      <div class="timeline-slider">
        <a-slider :min="0" :max="Math.max(0.001, timelineState.duration)" :step="0.001" v-model:value="timelineState.current" @change="onScrub" />
      </div>
      <a-select
        v-model:value="selectedScene"
        :options="sceneOptions"
        size="small"
        style="min-width: 120px"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive, nextTick, computed } from "vue";
import { CaretRightOutlined, PauseOutlined, PlusCircleOutlined, MinusCircleOutlined, ForwardOutlined } from "@ant-design/icons-vue";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three-stdlib";
import { gsap } from "gsap";
import { start, status, events } from "@/api/sim";

const container = ref(null);

let renderer, scene, camera, controls, target;
let model = null;

let raycaster, mouse, groundPlane, clickMarker;
let m2Ref = null;
let timeLine = null;
let timer = null;
let logTypingTimer = null;

const sceneOptions = [
  { label: '全景视图', value: 'lab-1' },
  { label: '透明视图', value: 'lab-2' },
  { label: '内景视图', value: 'lab-3' },
];

const simOptions = [
  { label: '实验室一', value: 'lab-1' },
  { label: '实验室二', value: 'lab-2' },
  { label: '实验室三', value: 'lab-3' },
];
const selectedScene = ref(simOptions[0].value);

const eventColumns = [
  { title: '', dataIndex: 'index', key: 'index', width: 52, align: 'center' },
  { title: 'xx事件预订通过：', dataIndex: 'label', key: 'label', ellipsis: true },
  { title: '剩余时间', dataIndex: 'durationDisplay', key: 'durationDisplay', width: 110, align: 'right' },
];

const eventRows = ref([
  { index: 0, label: 'root.preLaminationLi ', durationDisplay: '1'}
]);
const eventSummary = reactive({
  totalSimTime: 555.5,
  eventCount: 5,
  avgDuration: 1,
  throughput: 0,
  runDuration: 2,
  lastUpdate: '2025/01/01 00:00:00',
  progress: 10,
});

const eventKeySet = new Set();

const simOperationState = reactive({ starting: false });

const totalSimTimeDisplay = computed(() => `${formatNumber(eventSummary.totalSimTime)} 秒`);
const avgDurationDisplay = computed(() => {
  if (!eventSummary.eventCount) return '--';
  return `${formatNumber(eventSummary.avgDuration)} 秒`;
});
const throughputDisplay = computed(() => {
  if (!eventSummary.eventCount) return '--';
  return `${formatNumber(eventSummary.throughput)} /秒`;
});
const runDurationDisplay = computed(() => {
  if (!eventSummary.runDuration) return '--';
  return `${formatNumber(eventSummary.runDuration)} 秒`;
});
const lastUpdateDisplay = computed(() => eventSummary.lastUpdate || '--');
const statusLabel = computed(() => {
  return helpersParams.isStart ? '准备中' : '10%';
});
const statusColor = computed(() => {
  const status = helpersParams.simStatus;
  if (status === 'finished') return 'success';
  if (status === 'running') return 'processing';
  if (status === 'error' || status === 'failed') return 'error';
  return 'default';
});
const progressPercent = computed(() => Math.max(0, Math.min(100, Math.round(eventSummary.progress))));

// 时间线与播放状态
const timelineState = reactive({
  isPlaying: false,
  current: 0,
  duration: 0,
  speed: 10,
});

// 将仿真分钟映射为秒（例如 1 分钟 -> 6 秒）
const SIM_TIME_UNIT = 10;

const helpersParams = reactive({
  isTransparent: false,
  isShow: true,
  preset: 'A4',
  work: 'E0',
  clean: '',
  arm1: '',
  arm2: '',
  isStart: false,
  simStatus: '',
  isAnimation: true,
  simLog: ''
});

// 日志容器引用与增量状态
const eventState = reactive({ sinceId: 0 });

// 仿真配置
const simConfig = reactive({
  simId: 0,
  cassettes: {
    count: 4,
    layers: 1000
  },
  wafer_aligner: {
    align_time: [1.0, 2.0]
  },
  load_lock: {
    pump_down_time: [2.0, 3.0],
    vent_time: [1.5, 2.5]
  },
  robot_systems: {
    atmospheric_arm_count: 2,
    vacuum_arm_count: 2,
    atmospheric_transfer_time: [0.5, 1.0],
    vacuum_transfer_time: [0.3, 0.8]
  },
  etching_chambers: {
    count: 6,
    etch_time: [5.0, 8.0]
  },
  cleaning_chambers: {
    count: 2,
    clean_time: [3.0, 5.0]
  },
  wafer_arrival: {
    interval_range: [2.0, 4.0]
  },
  simulation_time: 1000
});

const presetTargets = {
  A0: new THREE.Vector3(160, 52, 90),
  A1: new THREE.Vector3(160, 52, 90),
  A2: new THREE.Vector3(160, 52, 40),
  A3: new THREE.Vector3(160, 52, -10),
  A4: new THREE.Vector3(160, 52, -60),
  E0: new THREE.Vector3(0, 0, 0),
  E1: new THREE.Vector3(0, -Math.PI*0.6, 0),
  E2: new THREE.Vector3(0, -Math.PI*0.9, 0),
  E3: new THREE.Vector3(0, -Math.PI*1.1, 0),
  E4: new THREE.Vector3(0, -Math.PI*1.4, 0),
  E5: new THREE.Vector3(0, -Math.PI*1.6, 0),
  E6: new THREE.Vector3(0, -Math.PI*1.9, 0),
  F1: new THREE.Vector3(0, -Math.PI*0.4, 0),
  F2: new THREE.Vector3(0, -0.2, 0),
}

let modelArr = ['Group012', 'Group015', 'Group018', '组003', '组004', 'a', 'b', 'c', 'ICP34', 'ICP363'];

onMounted(async () => {
  init();
  await loadModel('/model/AMEC10/AMEC.gltf')
  initializeControls()
  animate();
});

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(8, 8, 8);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 色彩与色调映射设置
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 2
  container.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  // 物理正确光照
  renderer.physicallyCorrectLights = true

  // 环境光照
  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.3)
  hemi.position.set(0, 1, 0)
  scene.add(hemi)

  // 添加方向光
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0)
  dirLight.position.set(-5, 5, -5)
  dirLight.castShadow = true
  scene.add(dirLight)

  // 添加点光源作为补光
  const pointLight = new THREE.PointLight(0xffffff, 0.5)
  pointLight.position.set(-5, 10, -5)
  scene.add(pointLight)

  // 光源
  let light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x404040));

  // 地面
  let grid = new THREE.GridHelper(20000, 2000, '#E6E6E6', '#f3f3f3');
  scene.add(grid);

  // 交互拾取初始化
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  setupClickMarker();
  renderer.domElement.addEventListener('click', onPointerClick);
}

// --------------------------------------- 模型加载 ---------------------------------------
async function loadModel(url) {
  const loader = new GLTFLoader()
  try {
    const gltf = await loader.loadAsync(url)
    model = gltf.scene

    // 确保 sRGB（基础色）与线性（法线/粗糙/金属）正确
    model.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mat = obj.material
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace
        
        mat.needsUpdate = true
        obj.castShadow = obj.receiveShadow = true
      }
    })

    scene.add(model)

    let scale = 0.1
    model.scale.setScalar(scale)
    model.position.set(0, 0, 0)

    // 相机位置设置
    camera.position.set( 62.304, 45.628, 1.13)
    controls.target.set( -0.856, 1.575, -0.981)
    controls.update()
    
    console.log('模型加载完成，相机位置:', camera.position.toArray())
  } catch (error) {
    console.error('模型加载失败:', error)
  }
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // 刷新时间线读数
  if (timeLine) {
    timelineState.current = timeLine.time();
    timelineState.duration = timeLine.duration();
    timelineState.isPlaying = !timeLine.paused();
  }
}

// 设置点击拾取标记
function setupClickMarker() {
  const geometry = new THREE.SphereGeometry(0.001, 16, 16)
  const material = new THREE.MeshBasicMaterial({ color: 0xff5533 })
  clickMarker = new THREE.Mesh(geometry, material)
  clickMarker.visible = false
  scene.add(clickMarker)
}

// 点击拾取
function onPointerClick(event) {
  if (!renderer) return
  const rect = renderer.domElement.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  const y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  mouse.set(x, y)
  raycaster.setFromCamera(mouse, camera)

  const hitPoint = new THREE.Vector3()
  if (raycaster.ray.intersectPlane(groundPlane, hitPoint)) {
    if (clickMarker) {
      clickMarker.position.copy(hitPoint)
      clickMarker.visible = true
    }
    console.log('点击坐标:', hitPoint.toArray())
  }
}

function initializeControls() {
  timeLine = gsap.timeline()
  
  const m2 = scene.getObjectByName('jixiebi2');
  m2Ref = m2

  // const zhaozi = scene.getObjectByName('zhaozi001');
  // if (zhaozi) setObjectTransparency(zhaozi, true, 0.5)
}

// 记录材质原始状态（属性级），可用于无需克隆的场景
const materialStateMap = new WeakMap()
// 记录目标网格的原始材质（实例级），用于避免材质共享导致的串改
const meshOriginalMaterialMap = new WeakMap()
// 半透明时的蓝色着色（可根据需要调整）
const TRANSPARENT_TINT_HEX = 0x66aaff

// 应用材质透明度
function applyMaterialTransparency(material, enable, opacity = 0.25, tint) {
  if (!material) return
  // 处理多材质数组
  if (Array.isArray(material)) {
    material.forEach(mat => applyMaterialTransparency(mat, enable, opacity))
    return
  }

  // 保存原始状态（只保存一次）
  if (!materialStateMap.has(material)) {
    materialStateMap.set(material, {
      transparent: !!material.transparent,
      opacity: material.opacity !== undefined ? material.opacity : 1,
      depthWrite: material.depthWrite !== undefined ? material.depthWrite : true,
    })
  }

  if (enable) {
    material.transparent = true
    material.opacity = opacity
    // 避免透明排序导致的遮挡问题
    if (material.depthWrite !== undefined) material.depthWrite = false
    // 施加蓝色着色（若材质支持颜色）
    if (material.color && tint) {
      if (typeof tint === 'string' && typeof material.color.set === 'function') {
        material.color.set(tint)
      } else if (typeof material.color.setHex === 'function') {
        material.color.setHex(tint)
      }
    }
  } else {
    const original = materialStateMap.get(material)
    if (original) {
      material.transparent = original.transparent
      material.opacity = original.opacity
      if (material.depthWrite !== undefined) material.depthWrite = original.depthWrite
    } else {
      material.transparent = false
      material.opacity = 1
      if (material.depthWrite !== undefined) material.depthWrite = true
    }
  }
  material.needsUpdate = true
}

// 释放材质
function disposeMaterial(material) {
  if (!material) return
  if (Array.isArray(material)) {
    material.forEach(m => m && m.dispose && m.dispose())
  } else if (material.dispose) {
    material.dispose()
  }
}

// 确保唯一材质
function ensureUniqueMaterial(mesh) {
  if (meshOriginalMaterialMap.has(mesh)) return
  const original = mesh.material
  const cloned = Array.isArray(original)
    ? original.map(m => (m && m.clone ? m.clone() : m))
    : (original && original.clone ? original.clone() : original)
  meshOriginalMaterialMap.set(mesh, original)
  mesh.material = cloned
  mesh.userData.__transparencyCloned = true
}

// 恢复原始材质
function restoreOriginalMaterial(mesh) {
  if (!meshOriginalMaterialMap.has(mesh)) return
  const cloned = mesh.material
  const original = meshOriginalMaterialMap.get(mesh)
  disposeMaterial(cloned)
  mesh.material = original
  meshOriginalMaterialMap.delete(mesh)
  delete mesh.userData.__transparencyCloned
}

function setObjectTransparency(object3D, enable, opacity = 0.25, tint) {
  object3D.traverse(child => {
    if (child.isMesh && child.material) {
      if (enable) {
        ensureUniqueMaterial(child)
        applyMaterialTransparency(child.material, true, opacity, tint)
      } else {
        // 恢复到未克隆前的原始材质，避免影响到共享该材质的其他网格
        restoreOriginalMaterial(child)
      }
    }
  })
}

// 透明
function onTransparentChange(transparent) {
  const targetOpacity = 0.25 // 可按需调整默认半透明强度
  modelArr.forEach(name => {
    const obj = scene.getObjectByName(name)
    if (obj) setObjectTransparency(obj, transparent, targetOpacity, TRANSPARENT_TINT_HEX)
  })
}

// 显隐
function onVisibilityChange(visible) {
  modelArr.forEach(name => {
    const m = scene.getObjectByName(name);
    if (m) m.visible = visible
  })
}

// 取样点A
function onPresetChange(key, { duration = 1, absolutetime = null }) {
  const target = presetTargets[key]
  const m3 = scene.getObjectByName('ICP375');
  const dur = duration * 0.8
  if (target && m3) {
    moveM2To(target, dur, absolutetime)
    gsapRotation(timeLine, m3, { x: 0, y: 0, z: 0 }, duration * 0.2, absolutetime + dur)
  }
}

// 加工点
function onWorkChange(key, { duration = 1, absolutetime = null }) {
  const target = presetTargets[key]
  const m22 = scene.getObjectByName('对象105');
  if (target && m22) {
    gsapRotation(timeLine, m22, { x: target.x, y: target.y, z: target.z }, duration, absolutetime)
  }
}

// 固定点
function onFixedClick({ duration = 1, absolutetime = null }) {
  const m3 = scene.getObjectByName('ICP375');
  const dur = duration * 0.8
  moveM2To(new THREE.Vector3(147.72, 52, 90), dur, absolutetime)
  if (m3) {
    gsapRotation(timeLine, m3, { x: 0, y: Math.PI * 3/2, z: 0 }, duration * 0.2, absolutetime + dur)
  }
}

// 送样点C
function onSampleClick({ duration = 1, absolutetime = null }) {
  const m3 = scene.getObjectByName('ICP375');
  const dur = duration * 0.8
  moveM2To(new THREE.Vector3(147.72, 52, 15), dur, absolutetime)
  if (m3) {
    gsapRotation(timeLine, m3, { x: 0, y: Math.PI, z: 0 }, duration * 0.2, absolutetime + dur)
  }
}

// 机械臂1伸缩
function onArm1Change(key, { duration = 1, absolutetime = null }) {
  const m4 = scene.getObjectByName('ICP372');
  const m5 = scene.getObjectByName('ICP371');
  const m7 = scene.getObjectByName('ICP368');
  const m8 = scene.getObjectByName('ICP367');
  
  if (key === '机械臂1伸出') {
    controlArm(timeLine, m4, m5, 'extend', duration, absolutetime )
  } else if (key === '机械臂1收回') {
    controlArm(timeLine, m4, m5, 'retract', duration, absolutetime)
  } else if (key === '机械臂2伸出') {
    controlArm(timeLine, m8, m7, 'extend', duration, absolutetime)
  } else if (key === '机械臂2收回') {
    controlArm(timeLine, m8, m7, 'retract', duration, absolutetime)
  }
}

// 机械臂2伸缩
function onArm2Change(key, { duration = 1, absolutetime = null }) {
  const m10 = scene.getObjectByName('hand_A05');
  const m11 = scene.getObjectByName('hand_A00');
  const m13 = scene.getObjectByName('hand_A02');
  const m14 = scene.getObjectByName('hand_A03');
  
  if (key === '机械臂1伸出') {
    controlArm(timeLine, m10, m11, 'extend', duration, absolutetime)
  } else if (key === '机械臂1收回') {
    controlArm(timeLine, m10, m11, 'retract', duration, absolutetime)
  } else if (key === '机械臂2伸出') {
    controlArm(timeLine, m14, m13, 'extend', duration, absolutetime)
  } else if (key === '机械臂2收回') {
    controlArm(timeLine, m14, m13, 'retract', duration, absolutetime)
  }
}

// 移动
function moveM2To(targetVec3, duration = 1, absolutetime = null) {
  if (!m2Ref || !targetVec3) return
  console.log(`${absolutetime}: move`, duration)
  timeLine.to(m2Ref.position, {
    x: targetVec3.x,
    y: targetVec3.y,
    z: targetVec3.z,
    duration: duration,
    ease: 'power1.inOut',
  }, absolutetime)
}

// 旋转
function gsapRotation(timeLine, model, target, duration = 1, absolutetime = null) {
  console.log(`${absolutetime}: rot`, duration)
  timeLine.to(model.rotation, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: duration,
    ease: 'none',
  }, absolutetime)
}

// 机械臂控制
function controlArm(timeLine, arm1, arm2, action, duration = 1, absolutetime = null) {
  let roatateY1 = 0
  let roatateY2 = 0
  if (action === 'extend') {
    roatateY1 = -Math.PI/2
    roatateY2 = Math.PI/2
  }
  gsapRotation(timeLine, arm1, { x: 0, y: roatateY1, z: 0 }, duration, absolutetime)
  gsapRotation(timeLine, arm2, { x: 0, y: roatateY2, z: 0 }, duration, absolutetime)
}

// 机械臂控制
function onArmChange(key, { duration = 1, absolutetime = null }) {
  const time2 = absolutetime + duration
  const time3 = time2 + duration
  const time4 = time3 + duration
  if (key === 1) {
    onArm1Change('机械臂1伸出', { duration, absolutetime }) // 机械臂伸出
    onArm1Change('机械臂1收回', { duration, absolutetime: time2}) // 机械臂收回
    onArm1Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    onArm1Change('机械臂2收回', { duration, absolutetime: time4 }) // 机械臂收回
  }
  if (key === 2) {
    onArm1Change('机械臂1伸出', { duration, absolutetime }) // 机械臂伸出
    onArm1Change('机械臂1收回', { duration, absolutetime: time2 }) // 机械臂收回
    // onArm1Change('机械臂1伸出') // 机械臂伸出
    // onArm1Change('机械臂1收回') // 机械臂收回
    // onArm1Change('机械臂2伸出') // 机械臂伸出
    // onArm1Change('机械臂2收回') // 机械臂收回
    onArm1Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    onArm1Change('机械臂2收回', { duration, absolutetime: time4 }) // 机械臂收回
  }
  if (key === 3) {
    onArm2Change('机械臂1伸出', { duration, absolutetime }) // 机械臂伸出
    onArm2Change('机械臂1收回', { duration, absolutetime: time2 }) // 机械臂收回
    onArm2Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    onArm2Change('机械臂2收回', { duration, absolutetime: time4 }) // 机械臂收回
  }
}

function formatNumber(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  if (num === 0) return '0.00';
  if (Math.abs(num) >= 1000) return num.toFixed(0);
  if (Math.abs(num) < 0.01) return num.toExponential(2);
  return num.toFixed(2);
}

function toSeconds(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return 0;
  return Number((num * SIM_TIME_UNIT).toFixed(3));
}

function formatTimestamp(date) {
  if (!(date instanceof Date)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function normalizeNode(node) {
  if (!node) return '';
  return String(node).replace(/^root\\./, '');
}

function formatEventLabel(item) {
  if (!item) return '事件';
  const parts = [];
  if (item.system_type) parts.push(item.system_type);
  if (item.type) parts.push(item.type);
  if (!parts.length && item.event_type) parts.push(item.event_type);
  return parts.length ? parts.join(' · ') : '事件';
}

function buildEventPath(item) {
  if (!item) return '';
  if (item.event_path) return item.event_path;
  if (item.path) return item.path;
  const from = normalizeNode(item.from);
  const to = normalizeNode(item.to);
  if (from || to) {
    const left = from || '未知';
    const right = to || '未知';
    return `${left} → ${right}`;
  }
  if (item.description) return item.description;
  if (item.name) return item.name;
  return '---';
}

function badgeStatusFor(item) {
  const type = item && item.type;
  if (type === 'transfer_start') return 'processing';
  if (type === 'transfer_end') return 'success';
  if (type === 'alarm' || type === 'error') return 'error';
  if (type === 'warning') return 'warning';
  return 'default';
}

function buildRow(item, key) {
  const simSeconds = toSeconds(item?.sim_time);
  const durationSeconds = item?.duration_estimate != null ? toSeconds(item.duration_estimate) : null;
  return {
    key,
    label: formatEventLabel(item),
    path: buildEventPath(item),
    badgeStatus: badgeStatusFor(item),
    simSeconds,
    durationSeconds,
    simTimeDisplay: formatNumber(simSeconds),
    durationDisplay: durationSeconds != null ? formatNumber(durationSeconds) : '--',
    raw: item || {},
  };
}

function recalcMetrics() {
  if (!eventRows.value.length) {
    eventSummary.totalSimTime = 0;
    eventSummary.eventCount = 0;
    eventSummary.avgDuration = 0;
    eventSummary.throughput = 0;
    eventSummary.runDuration = 0;
    if (helpersParams.simStatus !== 'finished') eventSummary.progress = 0;
    return;
  }
  const sorted = [...eventRows.value].sort((a, b) => a.simSeconds - b.simSeconds);
  const last = sorted[sorted.length - 1];
  const durations = sorted
    .map((row) => row.durationSeconds)
    .filter((num) => Number.isFinite(num) && num > 0);
  const sumDuration = durations.reduce((acc, cur) => acc + cur, 0);
  eventSummary.totalSimTime = last.simSeconds;
  eventSummary.eventCount = sorted.length;
  eventSummary.avgDuration = durations.length ? sumDuration / durations.length : 0;
  eventSummary.throughput = eventSummary.totalSimTime > 0 ? eventSummary.eventCount / eventSummary.totalSimTime : 0;
  eventSummary.runDuration = last.simSeconds;
  if (helpersParams.simStatus === 'finished') {
    eventSummary.progress = 100;
  } else {
    const denom = simConfig.simulation_time ? simConfig.simulation_time * SIM_TIME_UNIT : 0;
    const ratio = denom ? (last.simSeconds / denom) * 100 : 0;
    eventSummary.progress = Math.max(0, Math.min(100, Math.round(ratio)));
  }
}

function resetEventLog() {
  eventRows.value = [];
  eventKeySet.clear();
  eventSummary.totalSimTime = 0;
  eventSummary.eventCount = 0;
  eventSummary.avgDuration = 0;
  eventSummary.throughput = 0;
  eventSummary.runDuration = 0;
  if (helpersParams.simStatus !== 'finished') {
    eventSummary.progress = 0;
  }
  eventSummary.lastUpdate = '';
}

function appendEvents(list = []) {
  if (!Array.isArray(list) || !list.length) return;
  const appended = [];
  list.forEach((item) => {
    if (!item) return;
    const rowKey = item.id != null ? item.id : `${item.type || 'event'}-${item.sim_time}-${item.from || ''}-${item.to || ''}`;
    if (eventKeySet.has(rowKey)) return;
    eventKeySet.add(rowKey);
    appended.push(buildRow(item, rowKey));
  });
  if (!appended.length) return;
  const merged = [...eventRows.value, ...appended]
    .sort((a, b) => a.simSeconds - b.simSeconds)
    .map((row, idx) => ({ ...row, index: idx + 1 }));
  eventRows.value = merged;
  eventSummary.lastUpdate = formatTimestamp(new Date());
  recalcMetrics();
}

async function handleSimStart() {
  if (simOperationState.starting || helpersParams.isStart) return;
  simOperationState.starting = true;
  resetEventLog();
  helpersParams.isStart = true;
  try {
    await onSimStartChange();
  } catch (error) {
    console.error('Failed to start simulation', error);
    helpersParams.isStart = false;
  } finally {
    simOperationState.starting = false;
  }
}

async function handleSimStop() {
  if (!helpersParams.isStart) return;
  helpersParams.isStart = false;
  try {
    await onSimStartChange();
  } catch (error) {
    console.error('Failed to stop simulation', error);
  }
}

async function handleAnimationToggle() {
  if (helpersParams.isAnimation) {
    handleTimelinePause();
    helpersParams.isAnimation = false;
    return;
  }
  helpersParams.isAnimation = true;
  await onSimAnimationChange();
}

function handleTimelinePlay() {
  if (!helpersParams.isAnimation) return;
  onPlay();
}

function handleTimelinePause() {
  if (!helpersParams.isAnimation) return;
  onPause();
}

function handleTimelineRestart() {
  if (!helpersParams.isAnimation) return;
  onRestart();
}

// 仿真开始关闭
async function onSimStartChange() {
  if (helpersParams.isStart) {
    eventState.sinceId = 0;
    // 深拷贝以移除 reactive proxy
    const payload = JSON.parse(JSON.stringify(simConfig));
    const startRes = await start(payload);
    if (startRes.ok) {
      const simId = startRes.id || 0;
      simConfig.simId = simId;
      timer = setInterval(async () => {
        const res = await events(simConfig.simId, eventState.sinceId, 200);
        if (res && res.events) {
          appendEvents(res.events);
          const maxIdClient = res.events.reduce((m, e) => Math.max(m, e && e.id ? e.id : 0), eventState.sinceId);
          eventState.sinceId = Math.max(eventState.sinceId, (res.last_event_id != null ? res.last_event_id : maxIdClient));
        }

        const res2 = await status(simConfig.simId);
        if (res2 && res2.status) {
          helpersParams.simStatus = res2.status;
          if (res2.status === 'finished') {
            clearInterval(timer);
            timer = null;
          }
        }
      }, 1000);
    }
  } else {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
    helpersParams.simStatus = '';
  }
}

// 仿真动画开启关闭
async function onSimAnimationChange() {
  if (helpersParams.isAnimation) {
    clearInterval(timer);
    timer = null;
    const res = await events(simConfig.simId, 0, 2000);
    if (res && res.events) { appendEvents(res.events); simAnimation(res.events); }
  }
}

// 仿真动画
function simAnimation(data) {
  // 基于事件构建可控时间线
  if (timeLine) {
    try { timeLine.kill(); } catch(e) {}
  }
  timeLine = gsap.timeline({ paused: true });
  let lastSimTime = 0;

  const sorted = [...data].sort((a, b) => a.sim_time - b.sim_time);
  sorted.forEach(item => {
    const type = item.type
    const system_type = item.system_type
    const sim_time = Number(Number(item.sim_time * SIM_TIME_UNIT || 0).toFixed(2))
    const duration_estimate = Number(Number(item.duration_estimate * SIM_TIME_UNIT || 0).toFixed(2))

    // 在时间线上插入与仿真时间差对应的空白段
    // const gap = Math.max(0, sim_time - lastSimTime)
    // if (gap > 0) {
    //   timeLine.to({}, { duration: gap })
    // }

    if (type === 'transfer_start' && system_type === 'atmospheric') {
      const from = item.from || ''
      const to = item.to || ''
      if (to === "WaferAligner" && from.includes("Cassette")) {
        const pos = from.split(':')[0].split('Cassette ')[1]
        const duration1 = (duration_estimate - 4) / 2  // 将动作总时间分成各个步骤所需的时间
        onPresetChange(`A${pos}`, { duration: duration1, absolutetime: sim_time })
        onArmChange(1, { duration: 0.5, absolutetime: sim_time + duration1 })
        onFixedClick({ duration: duration1, absolutetime: sim_time + duration1 + 2 })
        onArmChange(2, { duration: 0.5, absolutetime: sim_time + duration_estimate - 2 })
      }
      if (to === "LoadLock") {
        const duration2 = duration_estimate - 2
        onSampleClick({ duration: duration2, absolutetime: sim_time })
        onArmChange(1, { duration: 0.5, absolutetime: sim_time + duration2 })
      }
      if (to.includes("Cassette")) {
        const duration3 = (duration_estimate - 4) / 2  // 将动作总时间分成各个步骤所需的时间
        onSampleClick({ duration: duration3, absolutetime: sim_time })
        onArmChange(1, { duration: 0.5, absolutetime: sim_time + duration3 })
        const pos = to.split(':')[0].split('Cassette ')[1]
        onPresetChange(`A${pos}`, { duration: duration3, absolutetime: sim_time + duration3 + 2 })
        onArmChange(1, { duration: 0.5, absolutetime: sim_time + duration3 - 2 })
      }
    }

    if (type === 'transfer_start' && system_type === 'vacuum') {
      const from = item.from || ''
      const to = item.to || ''
      if (from === "LoadLock" && to === "TransferChamber") {
        const duration4 = duration_estimate - 2
        onWorkChange(`E0`, { duration: duration4, absolutetime: sim_time })
        onArmChange(3, { duration: 0.5, absolutetime: sim_time + duration4 })
      }
      if (from.includes("EtchingChamber") && to === "TransferChamber") {
        const pos = from.split('EtchingChamber ')[1]
        const duration5 = duration_estimate - 2
        onWorkChange(`E${pos}`, { duration: duration5, absolutetime: sim_time })
        onArmChange(3, { duration: 0.5, absolutetime: sim_time + duration5 })
      }
      if (from.includes("CleaningChamber")) {
        const pos = from.split('CleaningChamber ')[1]
        const duration6 = (duration_estimate - 4) / 2
        onWorkChange(`F${pos}`, { duration: duration6, absolutetime: sim_time })
        onArmChange(3, { duration: 0.5, absolutetime: sim_time + duration6 })
        onWorkChange(`E0`, { duration: duration6, absolutetime: sim_time + duration6 + 2 })
        onArmChange(3, { duration: 0.5, absolutetime: sim_time + duration6 - 2 })
      }
      if (to.includes("EtchingChamber")) {
        const pos = to.split('EtchingChamber ')[1]
        const duration7 = duration_estimate - 2
        onWorkChange(`E${pos}`, { duration: duration7, absolutetime: sim_time })
        onArmChange(3, { duration: 0.5, absolutetime: sim_time + duration7 })
      }
      if (to.includes("CleaningChamber")) {
        const pos = to.split('CleaningChamber ')[1]
        const duration8 = duration_estimate - 2
        onWorkChange(`F${pos}`, { duration: duration8, absolutetime: sim_time })
        onArmChange(3, { duration: 0.5, absolutetime: sim_time + duration8 })
      }
    }

    lastSimTime = sim_time
  })

  // 初始化时间线状态
  timelineState.current = 0
  timelineState.duration = timeLine.duration()
  timelineState.isPlaying = false
  timeLine.timeScale(timelineState.speed || 1)
}

// 播放
function onPlay() {
  if (!timeLine) return
  timeLine.play()
  timelineState.isPlaying = true
}

// 暂停
function onPause() {
  if (!timeLine) return
  timeLine.pause()
  timelineState.isPlaying = false
}

// 重置
function onRestart() {
  if (!timeLine) return
  timeLine.pause(0)
  timelineState.current = 0
  timelineState.isPlaying = false
}

// 拖拽
function onScrub(val) {
  if (!timeLine) return
  const t = Array.isArray(val) ? val[0] : val
  timeLine.pause()
  timeLine.time(Math.max(0, Math.min(t, timeLine.duration())), false)
  timelineState.isPlaying = false
}

// 速度
function onSpeedChange(val) {
  const v = Number(val) || 1
  timelineState.speed = v
  if (timeLine) timeLine.timeScale(v)
}

onBeforeUnmount(() => {
  if (renderer && renderer.domElement) {
    renderer.domElement.removeEventListener('click', onPointerClick)
  }
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (logTypingTimer) {
    clearInterval(logTypingTimer)
    logTypingTimer = null
  }
})
</script>

<style scoped>
.simulation-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}

.three-container {
  flex: 1;
  overflow: hidden;
  border-top: 1px solid #f0f0f0;
}

.control-panel {
  position: fixed;
  top: 8rem;
  left: 1rem;
  width: 320px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.config-panel {
  position: fixed;
  top: 8rem;
  right: 26rem;
  width: 360px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.insight-panel {
  width: 420px;
  z-index: 1000;
  pointer-events: auto;
}

.panel-card {
  height: 100%;
  border-radius: 0px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 12px 32px rgba(31, 41, 55, 0.18);
  backdrop-filter: blur(16px);
}

.panel-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.panel-title-left {
  display: flex;
  gap: 16px;
}

.panel-clock {
  font-size: 18px;
  color: #1A1A1A;
}

.panel-subtitle {
  font-size: 16px;
  color: #1A1A1A;
}

.panel-controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.panel-controls-left {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-right: 12px;
}

.panel-controls-left .ant-btn {
  padding: 0 10px;
}

.panel-table {
  margin-bottom: 16px;
}

.panel-table :deep(.ant-table) {
  background: transparent;
}

.panel-table :deep(.ant-table-thead > tr > th) {
  background: transparent;
  font-size: 11px;
  color: #6b7280;
  border-bottom: 1px solid #f3f4f6;
}

.panel-table :deep(.ant-table-tbody > tr > td) {
  padding: 6px 8px;
  font-size: 12px;
  color: #1f2937;
}

.panel-table :deep(.ant-table-tbody > tr:hover > td) {
  background: rgba(24, 144, 255, 0.08);
}

.event-label-text {
  font-size: 12px;
  color: #111827;
}

.event-path {
  display: inline-block;
  max-width: 160px;
  font-size: 11px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-number {
  font-size: 11px;
  color: #111827;
  font-variant-numeric: tabular-nums;
}

.panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.footer-stats {
  /* flex: 1; */
  display: flex;
  /* grid-template-columns: repeat(2, minmax(0, 1fr)); */
  gap: 10px 12px;
  padding: 0px 6px;
}

.stat-item {
  display: flex;
  /* flex-direction: column;
  gap: 2px; */
}

.stat-label {
  font-size: 12px;
  color: #666666;
  margin-right: 6px;
}

.stat-value {
  font-size: 12px;
  color: #1f2937;
  font-variant-numeric: tabular-nums;
}

.progress-caption {
  font-size: 12px;
  color: #6b7280;
}

.control-section {
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.control-section:last-child {
  margin-bottom: 0;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.control-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.control-item:last-child {
  border-bottom: none;
}

.control-item label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin: 0;
  min-width: 80px;
  flex-shrink: 0;
  text-align: left;
}

.control-item .ant-slider {
  margin: 0;
  flex: 1;
  min-width: 100px;
}

.control-item .ant-select,
.control-item .ant-input {
  flex: 1;
  min-width: 120px;
}

.control-item .ant-switch {
  flex-shrink: 0;
}

.control-item .ant-btn {
  margin-right: 6px;
  margin-bottom: 0;
}

.control-item .ant-btn:last-child {
  margin-right: 0;
}

.value-display {
  font-size: 11px;
  color: #999;
  min-width: 30px;
  text-align: right;
  flex-shrink: 0;
}

.subsection-title {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin: 16px 0 8px 0;
  padding-bottom: 4px;
  border-bottom: 1px solid #f0f0f0;
}

.simulation-button {
  width: 100%;
  height: 36px;
  font-weight: 600;
  margin-bottom: 8px;
}

.button-container {
  display: flex;
  gap: 6px;
  flex: 1;
}

.button-container .ant-btn {
  flex: 1;
  font-size: 11px;
  height: 28px;
  margin: 0;
}

/* 自定义卡片样式 */
:deep(.ant-card-head) {
  min-height: 40px;
  padding: 0 16px;
  border-top: 1px solid #f0f0f0;
}

:deep(.ant-card-head-title) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.ant-card-body) {
  padding: 0px;
  height: calc(100% - 90px);
}

/* 自定义滑块样式 */
:deep(.ant-slider-track) {
  background: #1890ff;
}

:deep(.ant-slider-handle) {
  border: 2px solid #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 自定义选择框样式 */
:deep(.ant-select-selector) {
  border-radius: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-panel {
    position: relative;
    width: 100%;
    max-height: none;
    margin: 0;
    border-radius: 0;
    background: white;
  }

  .simulation-container {
    flex-direction: column;
  }

  .three-container {
    height: 60vh;
  }

  .config-panel,
  .insight-panel {
    position: relative;
    top: auto;
    right: auto;
    width: 100%;
    max-height: none;
    margin-top: 16px;
  }

  .panel-card {
    box-shadow: none;
    border-radius: 12px;
  }
}

/* 时间线面板样式 */
.timeline-panel {
  position: fixed;
  left: 30%;
  top: 100px;
  width: 600px;
  height: 48px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 12px 4px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-readout {
  margin-left: 8px;
  font-size: 12px;
  color: #666;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  width: 80px;
}

.timeline-slider {
  padding: 0 4px;
  width: 160px;
}
</style>