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
          <!-- <div class="panel-controls-left">
            <CaretRightOutlined v-if="!helpersParams.isAnimation" @click="handleSimStart" />
            <PauseOutlined v-else @click="handleSimStop" />
            <StopOutlined @click="resetEventLog" />
          </div> -->
          <a-select
            v-model:value="selectedSim"
            :options="simOptions"
            size="small"
            style="min-width: 150px"
            @change="handleSimStart"
          />
        </div>
        <div class="panel-table" ref="panelTableRef">
          <a-table
            size="small"
            :columns="eventColumns"
            :data-source="eventRows"
            :pagination="false"
            :scroll="{ y: `calc(100vh - 220px)` }"
            row-key="key"
            :row-class-name="(_record, index) => (index < selectedAnimation ? 'table-end' : (index === selectedAnimation ? 'table-doing' : null))"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'index'">
                <span class="event-index">{{ index }}</span>
              </template>
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
                <span class="stat-value">{{ formatNumber(eventSummary.totalSimTime, 0) }}秒</span>
              </div>
              <div class="stat-item">
                <a-progress type="circle" :percent="progressPercent" :size="20" />
                <span class="stat-value">{{ progressPercent }}%</span>
              </div>
            </div>
          </div>
        </template>
      </a-card>
    </div>

    <div v-if="helpersParams.isAnimation" class="timeline-panel">
      <div class="timeline-controls">
        <CaretRightOutlined @click="onPlay" v-if="!timelineState.isPlaying" />
        <PauseOutlined @click="onPause" v-else />
        <StopOutlined @click="onRestart"/>
        
        <MinusCircleOutlined @click="onSpeedChange(timelineState.speed - 1)" />
        <div class="speed-control">
          <a-input-number addon-before="x" v-model:value="timelineState.speed" :min="1" :max="20" :step="1" @change="onSpeedChange" />
        </div>
        <PlusCircleOutlined @click="onSpeedChange(timelineState.speed + 1)" />

        <ForwardOutlined @click="onScrub(timelineState.current + 10)" />
      </div>
      <div class="timeline-slider">
        <a-slider :min="0" :max="Math.max(0.001, timelineState.duration)" :step="0.001" v-model:value="timelineState.current" @change="onScrub" />
      </div>
      <a-select
        v-model:value="selectedScene"
        :options="sceneOptions"
        @change="handleSceneChange"
        size="small"
        style="min-width: 120px"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive, nextTick, computed, watch } from "vue";
import { CaretRightOutlined, PauseOutlined, PlusCircleOutlined, MinusCircleOutlined, ForwardOutlined, StopOutlined } from "@ant-design/icons-vue";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { GLTFLoader } from "three-stdlib";
import { gsap } from "gsap";
import { getLatestByParameterSetId } from '@/utils/utils';
import { getParameter } from '@/api/etching/parameter';
import { createRuns, getRuns, getRunsById, cancelRunsById } from '@/api/etching/runs';

const container = ref(null);
const simOptions = ref([]);
const selectedSim = ref(null);
const selectedAnimation = ref(-1);

let renderer, scene, camera, controls, target;
let model = null;
let resizeObserver = null;
let handleResize = null;

let raycaster, mouse, groundPlane, clickMarker;
let m2Ref = null;
let timeLine = null;
let timer = null;
let logTypingTimer = null;

// 时间线与播放状态
const timelineState = reactive({
  isPlaying: false,
  current: 0,
  duration: 0,
  speed: 1,
});

// 将仿真分钟映射为秒（例如 1 分钟 -> 6 秒）
const SIM_TIME_UNIT = 15;

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
  isAnimation: false,
  simLog: ''
});

// 日志容器引用与增量状态
const eventState = reactive({ sinceId: 0, nextSinceId: -1 });

const sceneOptions = [
  { label: '全景视图', value: 1 },
  { label: '透明视图', value: 2 },
  { label: '内景视图', value: 3 },
];
const selectedScene = ref(1);

const eventSummary = reactive({
  totalSimTime: 0,
  eventCount: 0,
  avgDuration: 1,
  throughput: 0,
  runDuration: 2,
  lastUpdate: '',
  progress: 0
});

const eventColumns = [
  { title: '', dataIndex: 'index', key: 'index', width: 52, align: 'center' },
  { title: '事件预订通过:', dataIndex: 'label', key: 'label', ellipsis: true },
  { title: '剩余时间', dataIndex: 'durationDisplay', key: 'durationDisplay', width: 110, align: 'right' },
];

const eventRows = ref([]);
const panelTableRef = ref(null);
const animateRows = ref([]);

const simOperationState = reactive({ starting: false });

const totalSimTimeDisplay = computed(() => `${formatNumber(eventSummary.totalSimTime)} 秒`);
const avgDurationDisplay = computed(() => {
  if (!eventSummary.eventCount) return '--';
  return `${formatNumber(eventSummary.avgDuration, 0)} 秒`;
});
const throughputDisplay = computed(() => {
  if (!eventSummary.eventCount) return '--';
  return `${formatNumber(eventSummary.throughput, 0)}`;
});
const lastUpdateDisplay = computed(() => eventSummary.lastUpdate || '--');
const progressPercent = computed(() => Math.max(0, Math.min(100, Math.round(eventSummary.progress))));

// 仿真配置
const simConfig = reactive({
  simId: 0
});

const presetTargets = {
  A0: new THREE.Vector3(149, 54, 83),
  A1: new THREE.Vector3(149, 54, 83),
  A2: new THREE.Vector3(149, 54, 32),
  A3: new THREE.Vector3(149, 54, -18),
  A4: new THREE.Vector3(149, 54, -70),  
  E0: new THREE.Vector3(0, 0, 0),
  E1: new THREE.Vector3(0, -Math.PI*0.4, 0),
  E2: new THREE.Vector3(0, -Math.PI*0.6, 0),
  E3: new THREE.Vector3(0, -Math.PI*0.9, 0),
  E4: new THREE.Vector3(0, -Math.PI*1.1, 0),
  E5: new THREE.Vector3(0, -Math.PI*1.4, 0),
  E6: new THREE.Vector3(0, -Math.PI*1.6, 0),
  F1: new THREE.Vector3(0, -Math.PI*0.15, 0),
  F2: new THREE.Vector3(0, -Math.PI*1.85, 0),
}
const locateMap = {
  'arm1-1': {
    name: 'ICP374',
    offset: { x: 149, y: 91.6, z: 27}
  },
  'arm1-2': {
    name: 'ICP370',
    offset: { x: 149, y: 90.2, z: 27}
  },
  'arm2-1': {
    name: '对象103',
    offset: { x: 66, y: 0, z: 0}
  },
  'arm2-2': {
    name: '对象104',
    offset: { x: 66, y: 2, z: 0}
  },
  'aligner': {
    name: 'ICP313',
    offset: { x: 0, y: 8, z: -5}
  },
  'loadLock': {
    name: '对齐002',
    offset: { x: 0, y: 2, z: 0}
  },
  'etch1': {
    name: 'glass',
    offset: { x: 0, y: -10, z: 0}
  },
  'etch2': {
    name: 'glass001',
    offset: { x: 0, y: -10, z: 0}
  },
  'etch3': {
    name: 'glass002',
    offset: { x: 0, y: -10, z: 0}
  },
  'etch4': {
    name: 'glass003',
    offset: { x: 0, y: -10, z: 0}
  },
  'etch5': {
    name: 'glass004',
    offset: { x: 0, y: -10, z: 0}
  },
  'etch6': {
    name: 'glass005',
    offset: { x: 0, y: -10, z: 0}
  },
  'clean1': {
    name: '对齐001',
    offset: { x: 0, y: 2, z: 0}
  },
  'clean2': {
    name: '对齐',
    offset: { x: 0, y: 2, z: 0}
  },
  'waferBox': {
    name: '对象016',
    offset: { x: 205, y: 111, z: 35}
  },
}
let modelArr = ['Group012', 'Group015', 'Group018', '组003', '组004', '组022', '组007', '组025', 'a', 'b', 'c', 'ICP34', 'ICP363', 'ICP347', 'ICP359', 'ICP343', 'ICP361', 'ICP360', 'ICP351', 'ICP350', 'ICP315', 'ICP362', 'ICP332', 'ICP353'];
let transArr = [ 
{ name: 'ICP05', transparent: 0.8 }, 
{ name: 'ICP805', transparent: 0.8 },
{ name: 'ICP827', transparent: 0.8 },
{ name: 'ICP849', transparent: 0.8 },
{ name: 'ICP250', transparent: 0.2 },
{ name: 'glass', transparent: 0.2 },
{ name: 'glass001', transparent: 0.2 },
{ name: 'glass002', transparent: 0.2 },
{ name: 'glass003', transparent: 0.2 },
{ name: 'glass004', transparent: 0.2 },
{ name: 'glass005', transparent: 0.2 },
{ name: 'ICP294', transparent: 0.6 },
{ name: 'ICP357', transparent: 0.6 },
{ name: 'ICP312', transparent: 0.6 },
{ name: 'ICP316', transparent: 0.6 },
{ name: 'ICP348', transparent: 0.6 },
{ name: 'ICP295', transparent: 0.6 }]

let wafer = 'ICP992';
let waferModel = null;
let wafersMap = {};
const skins = {
  pre:   '/img/wafer/pre.png',
  etch:  '/img/wafer/etch.png',
  ready: '/img/wafer/ready.png'
};

// Clean API to change wafer skin at runtime
function changeWaferSkin(key) {
  if (!waferModel) {
    console.warn('[changeWaferSkin] waferModel not available yet');
    return;
  }
  const url = skins[key];
  if (!url) {
    console.warn('[changeWaferSkin] unknown skin key:', key);
    return;
  }
  setSkin(waferModel, url);
}

// Optional: expose a convenience function in development for quick switching
if (typeof window !== 'undefined') window.changeWaferSkin = changeWaferSkin;

// ----------------------------------------------- 接口调用 -------------------------------------------------------
const getData = async () => {
  const data = await getParameter();
  const run = await getRuns()
  const items = getLatestByParameterSetId(run.items);
  let arr = [];
  data.forEach(t => {
    const obj = items.find(v => v.parameter_set_id === t.id);
    if(obj) {
      arr.push({ ...obj, name: t.name });
    }
  })
  simOptions.value = arr.map(t => { return { label: t.name, value: t.id } })
  selectedSim.value = arr[0].id;
  handleSimStart()
}

onMounted(async () => {
  getData();
  init();
  // await loadModel('/model/AMEC10/AMEC.gltf')
  await loadModel('/model/icp/icp.gltf')
  await loadModel('/model/yuanpian/yuanpian1.gltf')
  initializeControls()
  animate();
});

// 自动滚动表格以高亮当前选中的动画行
watch(selectedAnimation, async (newIndex) => {
  // 当没有选中或索引为 -1 时不滚动
  if (typeof newIndex !== 'number' || newIndex < 0) return;
  // 等待 DOM 更新后查找行元素
  await nextTick();
  try {
    const containerEl = panelTableRef.value || document.querySelector('.panel-table');
    if (!containerEl) return;

    // Ant Design Vue 的可滚动表体通常在 .ant-table-body 内
    const body = containerEl.querySelector('.ant-table-body') || containerEl.querySelector('tbody');
    if (!body) return;

    // 查找所有行（tr）并定位到索引位置
    const rows = body.querySelectorAll('tr');
    if (!rows || rows.length === 0) return;

    // Clamp index
    const idx = Math.max(0, Math.min(rows.length - 1, newIndex));
    const targetRow = rows[idx];
    if (!targetRow) return;

    // 平滑滚动目标行进入视口中央
    targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (e) {
    // 容忍任何错误
    console.warn('[panel scroll] failed', e);
  }
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
  // Use the container size (not the full window) so the canvas fits the layout
  const rect = container.value ? container.value.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
  const width = Math.max(1, Math.floor(rect.width));
  const height = Math.max(1, Math.floor(rect.height));
  renderer.setSize(width, height);
  // Respect devicePixelRatio but cap it for performance
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  // 色彩与色调映射设置
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 2
  container.value.appendChild(renderer.domElement);

  // Ensure renderer and camera use the correct size if the container is resized
  handleResize = function () {
    if (!container.value || !renderer || !camera) return;
    const r = container.value.getBoundingClientRect();
    const w = Math.max(1, Math.floor(r.width));
    const h = Math.max(1, Math.floor(r.height));
    // compare element CSS size (clientWidth/Height) to avoid unnecessary updates
    const el = renderer.domElement;
    if (el.clientWidth === w && el.clientHeight === h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };

  // Initial size adjustment (in case CSS/layout changed after mount)
  // Use nextTick to be safe when called from onMounted
  try { handleResize(); } catch (e) { /* ignore */ }

  // Use ResizeObserver for the container (more reliable for layout changes)
  if (typeof ResizeObserver !== 'undefined' && container.value) {
    resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container.value);
  }

  // Fallback: listen to window resize as well
  window.addEventListener('resize', handleResize, { passive: true });

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
function setSkin(model, url) {
  if (!model) {
    console.warn('[setSkin] model is null or undefined for url:', url);
    return;
  }

  const loader = new THREE.TextureLoader();
  loader.load(
    url,
    (tex) => {
      try {
        // Support both older (encoding) and newer (colorSpace) APIs
        if (typeof tex.encoding !== 'undefined' && typeof THREE.sRGBEncoding !== 'undefined') {
          tex.encoding = THREE.sRGBEncoding;
        } else if (typeof tex.colorSpace !== 'undefined' && typeof THREE.SRGBColorSpace !== 'undefined') {
          tex.colorSpace = THREE.SRGBColorSpace;
        }
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(1, 1);
        const maxAniso = renderer?.capabilities?.getMaxAnisotropy?.() ?? 1;
        if (typeof tex.anisotropy !== 'undefined') tex.anisotropy = maxAniso;

        let updated = 0;
        model.traverse((o) => {
          if (o.isMesh && o.material) {
            // Ensure mesh has its own material instance to avoid shared-material side effects
            try { ensureUniqueMaterial(o); } catch (e) { /* ignore */ }

            const geomHasUV = !!(o.geometry && o.geometry.attributes && o.geometry.attributes.uv);
            const mats = Array.isArray(o.material) ? o.material : [o.material];
            mats.forEach((m) => {
              try {
                m.map = tex;
                // Make sure albedo map is visible: reset color and PBR params if present
                try {
                  if (m.color && typeof m.color.setHex === 'function') m.color.setHex(0xffffff);
                  if (typeof m.metalness !== 'undefined') m.metalness = 0;
                  if (typeof m.roughness !== 'undefined') m.roughness = 1;
                } catch (e) {
                  // ignore
                }
                m.needsUpdate = true;
                updated++;
              } catch (e) {
                console.warn('[setSkin] failed to set map on material', e, m);
              }
            });
          }
        });
        console.log(`[setSkin] applied texture ${url} to ${updated} material(s) on model`, model.name || model);
      } catch (e) {
        console.error('[setSkin] error applying texture', e);
      }
    },
    undefined,
    (err) => {
      console.error('[setSkin] texture load error for', url, err);
    }
  );
}

// Try to locate wafer object in scene by several heuristics when exact name fails
function findWaferInScene() {
  if (!scene) return null;
  let obj = scene.getObjectByName(wafer);
  if (obj) return obj;
  let found = null;
  scene.traverse((o) => {
    if (found) return;
    if (o.name && /wafer/i.test(o.name)) found = o;
    if (!found && o.name && wafer && o.name.includes(wafer)) found = o;
    if (!found && o.name && /^ICP\d{2,}/i.test(o.name)) found = o;
  });
  if (found) console.warn('[findWaferInScene] wafer found by heuristic:', found.name);
  else console.warn('[findWaferInScene] wafer not found in scene with heuristics');
  return found;
}

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
  const m2 = scene.getObjectByName('ICP375');
  m2Ref = m2
  waferModel = scene.getObjectByName(wafer);
  if (!waferModel) {
    console.warn('[initializeControls] waferModel not found by name:', wafer, '— trying heuristics');
    waferModel = findWaferInScene();
  }
  if (!waferModel) {
    console.warn('[initializeControls] waferModel still not found; skipping setSkin');
  } else {
    waferModel.visible = false;
    setSkin(waferModel, skins.pre);
  }

  transArr.forEach(t => {
    const tranModel = scene.getObjectByName(t.name);
    tranModel.traverse(child => {
      if (child.isMesh && child.material) {
        applyMaterialTransparency(child.material, true, t.transparent)
      }
    })
  })
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

function handleSceneChange(val) {
   switch (val) {
      case 1:
        onVisibilityChange(true)
        onTransparentChange(false)
        break
      case 2:
        onVisibilityChange(true)
        onTransparentChange(true)
        break
      case 3:
        onVisibilityChange(false)
        break
      default:
        break
    }
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
    gsapRotation(timeLine, m3, { x: 0, y: -Math.PI / 2, z: 0 }, duration * 0.2, absolutetime + dur)
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
  moveM2To(new THREE.Vector3(149, 54, 83), dur, absolutetime)
  if (m3) {
    gsapRotation(timeLine, m3, { x: 0, y: Math.PI, z: 0 }, duration * 0.2, absolutetime + dur)
  }
}

// 送样点C
function onSampleClick({ duration = 1, absolutetime = null }) {
  const m3 = scene.getObjectByName('ICP375');
  const dur = duration * 0.8
  moveM2To(new THREE.Vector3(149, 54, 8), dur, absolutetime)
  if (m3) {
    gsapRotation(timeLine, m3, { x: 0, y: Math.PI / 2, z: 0 }, duration * 0.2, absolutetime + dur)
  }
}

// 机械臂1伸缩
function onArm1Change(key, { duration = 1, absolutetime = null, onComplete = null }, wafer_id) {
  const m4 = scene.getObjectByName('ICP372');
  const m5 = scene.getObjectByName('ICP371');
  const m7 = scene.getObjectByName('ICP368');
  const m8 = scene.getObjectByName('ICP367');

  const arm_pos = scene.getObjectByName('ICP375');
  const arm4 = scene.getObjectByName('ICP374');
  const arm5 = scene.getObjectByName('ICP370');
  const aligner = scene.getObjectByName('ICP313');
  const loadLock = scene.getObjectByName('对齐002');
  // wafer_id && console.log(key, wafer_id)
  
  if (key === '机械臂1伸出') {
    controlArm(timeLine, m4, m5, 'extend', duration, absolutetime, onComplete)
  } else if (key === '机械臂1伸出带货') {
    controlArm(timeLine, m4, m5, 'extend', duration, absolutetime, () => {
      const model = waferModel.clone();
      model.name = `wafer-${wafer_id}`;
      wafersMap[wafer_id] = model;
      const pos = locateMap['arm1-1'].offset;
      addWafer(model, arm4, pos.x, pos.y, pos.z);
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出放定位点') {
    controlArm(timeLine, m4, m5, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      attachPreserveWorld(model, arm4, 'aligner');
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出定位点取货') {
    controlArm(timeLine, m4, m5, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      attachPreserveWorld(model, aligner, 'arm1-1');
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出放真空仓') {
    controlArm(timeLine, m4, m5, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      attachPreserveWorld(model, arm4, 'loadLock');
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出真空仓取') {
    controlArm(timeLine, m4, m5, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      attachPreserveWorld(model, loadLock, 'arm1-1');
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出晶圆仓放货') {
    controlArm(timeLine, m4, m5, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      attachPreserveWorld(model, arm4, 'waferBox');
      onComplete && onComplete();
    })
  } else if (key === '机械臂1收回') {
    controlArm(timeLine, m4, m5, 'retract', duration, absolutetime, onComplete)
  } else if (key === '机械臂2伸出') {
    controlArm(timeLine, m8, m7, 'extend', duration, absolutetime, onComplete)
  } else if (key === '机械臂2伸出带货') {
    controlArm(timeLine, m8, m7, 'extend', duration, absolutetime, () => {
      const pos = arm_pos.position;
      const model = waferModel.clone();
      model.name = `wafer-${wafer_id}`;
      wafersMap[wafer_id] = model;
      addWafer(model, arm5, 0 + pos.x, 36.2  + pos.y, -5  + pos.z);
      onComplete && onComplete();
    })
  } else if (key === '机械臂2收回') {
    controlArm(timeLine, m8, m7, 'retract', duration, absolutetime, onComplete)
  }
}

// 机械臂2伸缩
function onArm2Change(key, { duration = 1, absolutetime = null, onComplete = null }, wafer_id, each_id) {
  const m10 = scene.getObjectByName('hand_A05');
  const m11 = scene.getObjectByName('hand_A00');
  const m13 = scene.getObjectByName('hand_A02');
  const m14 = scene.getObjectByName('hand_A03');

  const armL = scene.getObjectByName('对象103');
  const armR = scene.getObjectByName('对象104');

  const loadLock = scene.getObjectByName('对齐002');
  wafer_id && console.log(key, wafer_id, `etch${each_id}`)
  
  if (key === '机械臂1伸出') {
    controlArm(timeLine, m10, m11, 'extend', duration, absolutetime)
  } else if (key === '机械臂1伸出真空仓取货') {
    controlArm(timeLine, m10, m11, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      setSkin(model, skins.etch);
      attachPreserveWorld(model, loadLock, 'arm2-1');
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出蚀刻室放货') {
    controlArm(timeLine, m10, m11, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      attachPreserveWorld(model, armL, `etch${each_id}`);
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出蚀刻室取货') {
    controlArm(timeLine, m10, m11, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      setSkin(model, skins.ready);
      const obj = locateMap[`etch${each_id}`]
      const eachModel = scene.getObjectByName(obj.name)
      attachPreserveWorld(model, eachModel, 'arm2-1');
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出清洗仓放货') {
    controlArm(timeLine, m10, m11, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      attachPreserveWorld(model, armL, `clean${each_id}`);
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出清洗仓取货') {
    controlArm(timeLine, m10, m11, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      const obj = locateMap[`clean${each_id}`]
      const cleanModel = scene.getObjectByName(obj.name)
      attachPreserveWorld(model, cleanModel, 'arm2-1');
      onComplete && onComplete();
    })
  } else if (key === '机械臂1伸出真空仓放货') {
    controlArm(timeLine, m10, m11, 'extend', duration, absolutetime, () => {
      model = wafersMap[wafer_id];
      attachPreserveWorld(model, armL, 'loadLock');
      onComplete && onComplete();
    })
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
  // console.log(`${absolutetime}: move`, duration)
  timeLine.to(m2Ref.position, {
    x: targetVec3.x,
    y: targetVec3.y,
    z: targetVec3.z,
    duration: duration,
    ease: 'power1.inOut',
  }, absolutetime)
}

// 旋转
function gsapRotation(timeLine, model, target, duration = 1, absolutetime = null, onComplete = null) {
  // console.log(`${absolutetime}: rot`, duration)
  timeLine.to(model.rotation, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: duration,
    ease: 'none',
    onComplete: () => {
      onComplete && onComplete()
    }
  }, absolutetime)
}

// 机械臂控制
function controlArm(timeLine, arm1, arm2, action, duration = 1, absolutetime = null, onComplete = null) {
  let roatateY1 = 0
  let roatateY2 = 0
  if (action === 'extend') {
    roatateY1 = -Math.PI/2
    roatateY2 = Math.PI/2
  }
  gsapRotation(timeLine, arm1, { x: arm1.rotation.x, y: roatateY1, z: arm1.rotation.z }, duration, absolutetime)
  gsapRotation(timeLine, arm2, { x: arm2.rotation.x, y: roatateY2, z: arm2.rotation.z }, duration, absolutetime, onComplete)
}

function addWafer(child, newParent, offsetX, offsetY, offsetZ) {
  const pos = child.position;
  const modelPos = { x: pos.x + offsetX, y: pos.y + offsetY, z: pos.z + offsetZ };
  newParent.add(child);
  child.position.set(modelPos.x, modelPos.y, modelPos.z);
  child.visible = true;
}

function attachPreserveWorld(child, newParent, locateId) {
  const obj = locateMap[locateId];
  const box = scene.getObjectByName(obj.name);
  newParent.remove(child);
  child.position.set(0,0,0)
  const pos = obj.offset;
  addWafer(child, box, pos.x, pos.y, pos.z);
}

// 机械臂控制
function onArmChange(key, { duration = 1, absolutetime = null, onComplete = null }, wafer_id = null, each_id = null) {
  const time2 = absolutetime + duration
  const time3 = time2 + duration
  const time4 = time3 + duration
  const time5 = time4 + duration
  const time6 = time5 + duration
  const time7 = time6 + duration
  const time8 = time7 + duration
  if (key === 1) { // 晶圆盒取货
    onArm1Change('机械臂1伸出带货', { duration, absolutetime }, wafer_id) // 机械臂伸出
    onArm1Change('机械臂1收回', { duration, absolutetime: time2}) // 机械臂收回
    // onArm1Change('机械臂2伸出带货', { duration, absolutetime: time3 }, `${wafer_id}-1`) // 机械臂伸出
    // onArm1Change('机械臂2收回', { duration, absolutetime: time4, onComplete }) // 机械臂收回
  }
  if (key === 2) { // 定位点
    onArm1Change('机械臂1伸出放定位点', { duration, absolutetime }, wafer_id) // 机械臂伸出
    onArm1Change('机械臂1收回', { duration, absolutetime: time2, onComplete }) // 机械臂收回
    onArm1Change('机械臂1伸出定位点取货', { duration, absolutetime: time3 }, wafer_id) // 机械臂伸出
    onArm1Change('机械臂1收回', { duration, absolutetime: time4 }) // 机械臂收回

    // onArm1Change('机械臂2伸出', { duration, absolutetime: time5 }, wafer_id) // 机械臂伸出
    // onArm1Change('机械臂2收回', { duration, absolutetime: time6 }) // 机械臂收回
    // onArm1Change('机械臂2伸出', { duration, absolutetime: time7 }) // 机械臂伸出
    // onArm1Change('机械臂2收回', { duration, absolutetime: time8, onComplete }) // 机械臂收回
  }
  if (key === 3) { // 真空机械臂 真空仓取货
    onArm2Change('机械臂1伸出真空仓取货', { duration, absolutetime }, wafer_id) // 机械臂伸出
    onArm2Change('机械臂1收回', { duration, absolutetime: time2 }) // 机械臂收回
    // onArm2Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    // onArm2Change('机械臂2收回', { duration, absolutetime: time4, onComplete }) // 机械臂收回
  }
  if (key === 4) { // 真空仓放货
    onArm1Change('机械臂1伸出放真空仓', { duration, absolutetime }, wafer_id) // 机械臂伸出
    onArm1Change('机械臂1收回', { duration, absolutetime: time2, onComplete }) // 机械臂收回
    // onArm1Change('机械臂2伸出', { duration, absolutetime: time4 }) // 机械臂伸出
    // onArm1Change('机械臂2收回', { duration, absolutetime: time5, onComplete }) // 机械臂收回
  }
  if (key === 5) { // 真空机械臂 蚀刻室放货
    onArm2Change('机械臂1伸出蚀刻室放货', { duration, absolutetime }, wafer_id, each_id) // 机械臂伸出
    onArm2Change('机械臂1收回', { duration, absolutetime: time2 }) // 机械臂收回
    // onArm2Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    // onArm2Change('机械臂2收回', { duration, absolutetime: time4, onComplete }) // 机械臂收回
  }
  if (key === 6) { // 真空机械臂 蚀刻室取货
    onArm2Change('机械臂1伸出蚀刻室取货', { duration, absolutetime }, wafer_id, each_id) // 机械臂伸出
    onArm2Change('机械臂1收回', { duration, absolutetime: time2 }) // 机械臂收回
    // onArm2Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    // onArm2Change('机械臂2收回', { duration, absolutetime: time4, onComplete }) // 机械臂收回
  }
  if (key === 7) { // 真空机械臂 清洗仓放货
    onArm2Change('机械臂1伸出清洗仓放货', { duration, absolutetime }, wafer_id, each_id) // 机械臂伸出
    onArm2Change('机械臂1收回', { duration, absolutetime: time2 }) // 机械臂收回
    // onArm2Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    // onArm2Change('机械臂2收回', { duration, absolutetime: time4, onComplete }) // 机械臂收回
  }
   if (key === 8) { // 真空机械臂 清洗仓取货
    onArm2Change('机械臂1伸出清洗仓取货', { duration, absolutetime }, wafer_id, each_id) // 机械臂伸出
    onArm2Change('机械臂1收回', { duration, absolutetime: time2 }) // 机械臂收回
    // onArm2Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    // onArm2Change('机械臂2收回', { duration, absolutetime: time4, onComplete }) // 机械臂收回
  }
   if (key === 9) { // 真空机械臂 真空室放货
    onArm2Change('机械臂1伸出真空仓放货', { duration, absolutetime }, wafer_id, each_id) // 机械臂伸出
    onArm2Change('机械臂1收回', { duration, absolutetime: time2 }) // 机械臂收回
    // onArm2Change('机械臂2伸出', { duration, absolutetime: time3 }) // 机械臂伸出
    // onArm2Change('机械臂2收回', { duration, absolutetime: time4, onComplete }) // 机械臂收回
  }
  if (key === 10) { // 大气机械臂 真空仓取货
    onArm1Change('机械臂1伸出真空仓取', { duration, absolutetime }, wafer_id) // 机械臂伸出
    onArm1Change('机械臂1收回', { duration, absolutetime: time2, onComplete }) // 机械臂收回
    // onArm1Change('机械臂2伸出', { duration, absolutetime: time4 }) // 机械臂伸出
    // onArm1Change('机械臂2收回', { duration, absolutetime: time5, onComplete }) // 机械臂收回
  }
  if (key === 11) { // 大气机械臂 真空仓取货
    onArm1Change('机械臂1伸出晶圆仓放货', { duration, absolutetime }, wafer_id) // 机械臂伸出
    onArm1Change('机械臂1收回', { duration, absolutetime: time2, onComplete }) // 机械臂收回
    // onArm1Change('机械臂2伸出', { duration, absolutetime: time4 }) // 机械臂伸出
    // onArm1Change('机械臂2收回', { duration, absolutetime: time5, onComplete }) // 机械臂收回
  }
}

function formatNumber(value, fixed = 2) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  if (num === 0) return '0.00';
  if (Math.abs(num) >= 1000) return num.toFixed(0);
  if (Math.abs(num) < 0.01) return num.toExponential(2);
  return num.toFixed(fixed);
}

function toSeconds(val) {
  const num = Number(val);
  if (!Number.isFinite(num)) return 0;
  // return Number((num * SIM_TIME_UNIT).toFixed(2));
  return Number((num).toFixed(2));
}

function resetEventLog() {
  eventRows.value = [];
  eventSummary.totalSimTime = 0;
  eventSummary.eventCount = 0;
  eventSummary.avgDuration = 0;
  eventSummary.throughput = 0;
  eventSummary.runDuration = 0;
  if (helpersParams.simStatus !== 'finished') {
    eventSummary.progress = 0;
  }
  eventSummary.lastUpdate = '';
  helpersParams.isAnimation = false;
}

function randTwoDigitGreaterThan(n) {
  if (n >= 99) return 100;
  const min = Math.max(10, Math.floor(n) + 1); 
  const max = 99;
  return min + Math.floor(Math.random() * (max - min + 1));
}

function appendEvents(list = []) {
  if (!Array.isArray(list) || !list.length) return;
  const appended = [];
  list.forEach((item) => {
    if (!item) return;
    const rowKey = `${item.event_type || 'event'}-${toSeconds(item?.sim_time)}-${item.from_location || ''}-${item.to_location || ''}`;
    appended.push({ label: rowKey, durationDisplay: toSeconds(item?.duration_estimate) });
  });

  eventRows.value = [...eventRows.value, ...appended];
  animateRows.value = [...animateRows.value, ...list];

  const lastEvent = list[list.length-1];
  eventSummary.totalSimTime = toSeconds(lastEvent.payload_json?.sim_time);
  eventSummary.eventCount = eventRows.value.length || 0;
  eventSummary.avgDuration = toSeconds(lastEvent.payload_json?.avg_process_time);
  eventSummary.throughput = lastEvent.payload_json?.wafer_id;
  eventSummary.progress = randTwoDigitGreaterThan(eventSummary.progress);
  eventSummary.lastUpdate = lastEvent?.wall_time;
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

function endEventLog() {
  clearInterval(timer);
  timer = null;
  helpersParams.isStart = false;
  eventSummary.progress = 100;
  simAnimation(animateRows.value);
}

// 仿真开始
async function onSimStartChange() {
  if (helpersParams.isStart && selectedSim.value) {
    eventState.sinceId = 0;
    eventState.nextSinceId = -1;
    simConfig.simId = selectedSim.value || 0;

    timer = setInterval(async () => {
      if (eventState.sinceId === eventState.nextSinceId) return;
      eventState.nextSinceId = eventState.sinceId;
      const res = await getRunsById(simConfig.simId, eventState.nextSinceId, 200);
      if (res && res.items) {
        appendEvents(res.items);
        eventState.sinceId = res.next_since_id;

        if (!res.next_since_id) {
          endEventLog();
        }
      }
    }, 1000);
  }
}

// 仿真动画
function simAnimation(data) {
  helpersParams.isAnimation = true;
  // 基于事件构建可控时间线
  if (timeLine) {
    try { timeLine.kill(); } catch(e) {}
  }
  timeLine = gsap.timeline({ paused: true });
  let lastSimTime = 0;

  const sorted = [...data].sort((a, b) => a.sim_time - b.sim_time);
  sorted.forEach((item, index) => {
    const type = item.event_type;
    const system_type = item.system_type
    const wafer_id = item.wafer_id;
    const sim_time = Number(Number(item.sim_time * SIM_TIME_UNIT || 0).toFixed(2))
    const duration_estimate = Number(Number(item.duration_estimate * SIM_TIME_UNIT || 0).toFixed(2))

    if (type === 'transfer_start' && system_type === 'atmospheric') {
      const from = item.from_location || ''
      const to = item.to_location || ''
      if (to === "WaferAligner" && from.includes("Cassette")) {
        const pos = from.split(':')[0].split('Cassette ')[1]
        const duration1 = (duration_estimate - 4) / 2  // 将动作总时间分成各个步骤所需的时间
        onPresetChange(`A${pos}`, { duration: duration1, absolutetime: sim_time })
        onArmChange(1, { duration: 0.5, absolutetime: sim_time + duration1 }, wafer_id)
        onFixedClick({ duration: duration1, absolutetime: sim_time + duration1 + 2 })
        onArmChange(2, { duration: 0.5, absolutetime: sim_time + duration_estimate - 2, onComplete: () => { selectedAnimation.value = index } }, wafer_id)
      }
      if (to === "LoadLock") {
        const duration2 = duration_estimate - 2
        onSampleClick({ duration: duration2, absolutetime: sim_time })
        onArmChange(4, { duration: 0.5, absolutetime: sim_time + duration2, onComplete: () => { selectedAnimation.value = index } }, wafer_id)
      }
      if (to.includes("Cassette")) {
        const duration3 = (duration_estimate - 4) / 2  // 将动作总时间分成各个步骤所需的时间
        onSampleClick({ duration: duration3, absolutetime: sim_time })
        onArmChange(10, { duration: 0.5, absolutetime: sim_time + duration3 }, wafer_id)
        const pos = to.split(':')[0].split('Cassette ')[1]
        onPresetChange(`A${pos}`, { duration: duration3, absolutetime: sim_time + duration3 + 2 })
        onArmChange(11, { duration: 0.5, absolutetime: sim_time + duration3 - 2, onComplete: () => { selectedAnimation.value = index } }, wafer_id)
      }
    }

    if (type === 'transfer_start' && system_type === 'vacuum') {
       const from = item.from_location || ''
      const to = item.to_location || ''
      if (from === "LoadLock" && to === "TransferChamber") {
        const duration4 = duration_estimate - 2
        onWorkChange(`E0`, { duration: duration4, absolutetime: sim_time })
        onArmChange(3, { duration: 0.5, absolutetime: sim_time + duration4, onComplete: () => { selectedAnimation.value = index } }, wafer_id)
      }
      if (to.includes("EtchingChamber")) {
        const pos = to.split('EtchingChamber ')[1]
        const duration7 = duration_estimate - 2
        onWorkChange(`E${pos}`, { duration: duration7, absolutetime: sim_time })
        onArmChange(5, { duration: 0.5, absolutetime: sim_time + duration7, onComplete: () => { selectedAnimation.value = index } }, wafer_id, pos)
      }
      if (from.includes("EtchingChamber") && to === "TransferChamber") {
        const pos = from.split('EtchingChamber ')[1]
        const duration5 = duration_estimate - 2
        onWorkChange(`E${pos}`, { duration: duration5, absolutetime: sim_time })
        onArmChange(6, { duration: 0.5, absolutetime: sim_time + duration5, onComplete: () => { selectedAnimation.value = index } }, wafer_id, pos)
      }
      if (to.includes("CleaningChamber")) {
        const pos = to.split('CleaningChamber ')[1]
        const duration8 = duration_estimate - 2
        onWorkChange(`F${pos}`, { duration: duration8, absolutetime: sim_time })
        onArmChange(7, { duration: 0.5, absolutetime: sim_time + duration8, onComplete: () => { selectedAnimation.value = index } }, wafer_id, pos)
      }
      if (from.includes("CleaningChamber")) {
        const pos = from.split('CleaningChamber ')[1]
        const duration6 = (duration_estimate - 4) / 2
        onWorkChange(`F${pos}`, { duration: duration6, absolutetime: sim_time })
        onArmChange(8, { duration: 0.5, absolutetime: sim_time + duration6 }, wafer_id, pos)
        onWorkChange(`E0`, { duration: duration6, absolutetime: sim_time + duration6 + 2 })
        onArmChange(9, { duration: 0.5, absolutetime: sim_time + duration6 - 2, onComplete: () => { selectedAnimation.value = index } }, wafer_id)
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
  const v = Number(val) || 1;
  if (v < 0) return
  timelineState.speed = v
  if (timeLine) timeLine.timeScale(v)
}

onBeforeUnmount(() => {
  if (renderer && renderer.domElement) {
    renderer.domElement.removeEventListener('click', onPointerClick)
  }
  if (resizeObserver && container.value) {
    try { resizeObserver.unobserve(container.value); } catch (e) { /* ignore */ }
    try { resizeObserver.disconnect(); } catch (e) { /* ignore */ }
    resizeObserver = null;
  }
  if (handleResize) {
    window.removeEventListener('resize', handleResize);
    handleResize = null;
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

.panel-table :deep(.table-end) td {
  background-color: #f3f3f3;
}

.panel-table :deep(.table-doing) td {
  background-color: #d9d9d9;
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