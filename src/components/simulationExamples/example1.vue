<template>
  <div class="simulation-container">
    <div ref="container" class="three-container"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
      <a-card title="工具" class="control-section">
        <div class="control-group">
          <div class="control-item">
            <label>透明</label>
            <a-switch v-model:checked="helpersParams.isTransparent" @change="onTransparentChange" />
          </div>
          <div class="control-item">
            <label>显隐</label>
            <a-switch v-model:checked="helpersParams.isShow" @change="onVisibilityChange" />
          </div>
          <div class="control-item">
            <label>取样点A</label>
            <a-select v-model:value="helpersParams.preset" @change="onPresetChange" style="width: 100%">
              <a-select-option value="A1">A1</a-select-option>
              <a-select-option value="A2">A2</a-select-option>
              <a-select-option value="A3">A3</a-select-option>
              <a-select-option value="A4">A4</a-select-option>
            </a-select>
          </div>
          <div class="control-item">
            <label>加工点</label>
            <a-select v-model:value="helpersParams.work" @change="onWorkChange" style="width: 100%">
              <a-select-option value="E0">E0</a-select-option>
              <a-select-option value="E1">E1</a-select-option>
              <a-select-option value="E2">E2</a-select-option>
              <a-select-option value="E3">E3</a-select-option>
              <a-select-option value="E4">E4</a-select-option>
              <a-select-option value="E5">E5</a-select-option>
              <a-select-option value="E6">E6</a-select-option>
            </a-select>
          </div>
          <div class="control-item">
            <label>清洗点</label>
            <a-select v-model:value="helpersParams.clean" @change="onWorkChange" style="width: 100%">
              <a-select-option value="F1">F1</a-select-option>
              <a-select-option value="F2">F2</a-select-option>
            </a-select>
          </div>
          <div class="control-item button-group">
            <label>控制</label>
            <div class="button-container">
              <a-button @click="onOriginClick">原点B</a-button>
              <a-button @click="onFixedClick">固定点</a-button>
              <a-button @click="onSampleClick">送样点C</a-button>
            </div>
          </div>
          <div class="control-item">
            <label>arm1伸缩</label>
            <a-select v-model:value="helpersParams.arm1" @change="onArm1Change" style="width: 100%">
              <a-select-option value="机械臂1伸出">机械臂1伸出</a-select-option>
              <a-select-option value="机械臂1收回">机械臂1收回</a-select-option>
              <a-select-option value="机械臂2伸出">机械臂2伸出</a-select-option>
              <a-select-option value="机械臂2收回">机械臂2收回</a-select-option>
            </a-select>
          </div>
          <div class="control-item">
            <label>arm2伸缩</label>
            <a-select v-model:value="helpersParams.arm2" @change="onArm2Change" style="width: 100%">
              <a-select-option value="机械臂1伸出">机械臂1伸出</a-select-option>
              <a-select-option value="机械臂1收回">机械臂1收回</a-select-option>
              <a-select-option value="机械臂2伸出">机械臂2伸出</a-select-option>
              <a-select-option value="机械臂2收回">机械臂2收回</a-select-option>
            </a-select>
          </div>
        </div>
      </a-card>
    </div>
    <div class="sim-panel">
      <a-card title="仿真配置" class="control-section">
        <a-collapse :bordered="false" :default-active-key="[]">
          <a-collapse-panel key="base" header="晶圆盒">
            <div class="control-group">
              <div class="control-item">
                <label>晶圆盒数量</label>
                <a-input-number v-model:value="simConfig.cassettes.count" :min="1" :max="4" />
              </div>
              <div class="control-item">
                <label>每盒层数</label>
                <a-input-number v-model:value="simConfig.cassettes.layers" :min="1" :max="100000" />
              </div>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="robots" header="机械臂">
            <div class="control-group">
              <div class="control-item">
                <label>大气臂数量</label>
                <a-input-number v-model:value="simConfig.robot_systems.atmospheric_arm_count" :min="0" :max="4" />
              </div>
              <div class="control-item">
                <label>真空臂数量</label>
                <a-input-number v-model:value="simConfig.robot_systems.vacuum_arm_count" :min="0" :max="4" />
              </div>
              <div class="control-item">
                <label>大气臂转移(分)</label>
                <a-slider v-model:value="simConfig.robot_systems.atmospheric_transfer_time" range :step="0.1" :min="0" :max="5" />
              </div>
              <div class="control-item">
                <label>真空臂转移(分)</label>
                <a-slider v-model:value="simConfig.robot_systems.vacuum_transfer_time" range :step="0.1" :min="0" :max="5" />
              </div>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="align" header="寻边与真空">
            <div class="control-group">
              <div class="control-item">
                <label>寻边时间(分)</label>
                <a-slider v-model:value="simConfig.wafer_aligner.align_time" range :step="0.1" :min="0" :max="10" />
              </div>
              <div class="control-item">
                <label>抽真空(分)</label>
                <a-slider v-model:value="simConfig.load_lock.pump_down_time" range :step="0.1" :min="0" :max="10" />
              </div>
              <div class="control-item">
                <label>充气(分)</label>
                <a-slider v-model:value="simConfig.load_lock.vent_time" range :step="0.1" :min="0" :max="10" />
              </div>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="chambers" header="蚀刻与清洗">
            <div class="control-group">
              <div class="control-item">
                <label>刻蚀腔室数量</label>
                <a-input-number v-model:value="simConfig.etching_chambers.count" :min="0" :max="12" />
              </div>
              <div class="control-item">
                <label>刻蚀时间(分)</label>
                <a-slider v-model:value="simConfig.etching_chambers.etch_time" range :step="0.1" :min="0" :max="20" />
              </div>
              <div class="control-item">
                <label>清洗腔室数量</label>
                <a-input-number v-model:value="simConfig.cleaning_chambers.count" :min="0" :max="8" />
              </div>
              <div class="control-item">
                <label>清洗时间(分)</label>
                <a-slider v-model:value="simConfig.cleaning_chambers.clean_time" range :step="0.1" :min="0" :max="20" />
              </div>
            </div>
          </a-collapse-panel>
          <a-collapse-panel key="arrival" header="到达与总时长">
            <div class="control-group">
              <div class="control-item">
                <label>到达间隔(分)</label>
                <a-slider v-model:value="simConfig.wafer_arrival.interval_range" range :step="0.1" :min="0" :max="10" />
              </div>
              <div class="control-item">
                <label>仿真时间(分)</label>
                <a-input-number v-model:value="simConfig.simulation_time" :min="1" :max="100000" />
              </div>
            </div>
          </a-collapse-panel>
        </a-collapse>
        <div class="control-item">
          <label>开始仿真</label>
          <a-switch v-model:checked="helpersParams.isStart" @change="onSimStartChange" />
        </div>
        <div v-if="helpersParams.isStart" class="control-item">
          <label>仿真状态</label>
          {{ helpersParams.simStatus }}
        </div>
        <div v-if="helpersParams.simStatus === 'finished'" class="control-item">
          <label>仿真动画</label>
          <a-switch v-model:checked="helpersParams.isAnimation" @change="onSimAnimationChange" />
        </div>
        <div v-if="helpersParams.isStart" class="control-item">
          <label>仿真日志</label>
          <pre ref="logRef" style="background: #181c20; color: #00ff90; padding: 16px; border-radius: 8px; height: 200px; font-size: 14px; font-family: 'Fira Mono, monospace'; margin-bottom: 16px; overflow-x: hidden; white-space: pre-line;">{{ helpersParams.simLog }}</pre>
        </div>
      </a-card>
    </div>
    <div v-if="helpersParams.isAnimation" class="timeline-panel">
      <div class="timeline-controls">
        <a-button size="small" type="primary" @click="onPlay" :disabled="timelineState.isPlaying">播放</a-button>
        <a-button size="small" @click="onPause" :disabled="!timelineState.isPlaying">暂停</a-button>
        <a-button size="small" @click="onRestart">重置</a-button>
        <div class="time-readout">{{ timelineState.current.toFixed(2) }} / {{ timelineState.duration.toFixed(2) }} min</div>
        <div class="speed-control">
          <span>速度</span>
          <a-input-number v-model:value="timelineState.speed" :min="0.1" :max="10" :step="0.1" @change="onSpeedChange" />
          <span>x</span>
        </div>
      </div>
      <div class="timeline-slider">
        <a-slider :min="0" :max="Math.max(0.001, timelineState.duration)" :step="0.001" v-model:value="timelineState.current" @change="onScrub" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive, nextTick } from "vue";
import { 
  Card as ACard, 
  Select as ASelect, 
  SelectOption as ASelectOption, 
  Button as AButton, 
  Switch as ASwitch, 
  Slider as ASlider,
  InputNumber as AInputNumber,
  Collapse as ACollapse,
  CollapsePanel as ACollapsePanel,
} from "ant-design-vue";
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
  isAnimation: false,
  simLog: ''
});

// 日志容器引用与增量状态
const logRef = ref(null);
const eventState = reactive({ sinceId: 0 });

// 打字机渲染状态
const logQueue = [];
const typingState = reactive({ currentLine: '', charIndex: 0, isActive: false });

function resetLogs() {
  helpersParams.simLog = '';
  logQueue.length = 0;
  typingState.currentLine = '';
  typingState.charIndex = 0;
  typingState.isActive = false;
  if (logTypingTimer) {
    clearInterval(logTypingTimer);
    logTypingTimer = null;
  }
}

function pushLogLines(lines) {
  const filtered = (lines || []).filter(Boolean);
  if (filtered.length === 0) return;
  logQueue.push(...filtered);
  startLogTyping();
}

function startLogTyping() {
  if (typingState.isActive) return;
  typingState.isActive = true;
  if (!logTypingTimer) {
    logTypingTimer = setInterval(typeTick, 120);
  }
}

function typeTick() {
  if (logQueue.length === 0) {
    typingState.isActive = false;
    clearInterval(logTypingTimer);
    logTypingTimer = null;
    return;
  }
  const line = (logQueue.shift() || '') + '\n';
  helpersParams.simLog += line;
  if (logRef.value) {
    // 自动滚动到底部
    logRef.value.scrollTop = logRef.value.scrollHeight;
  }
}

function ms(min) { return typeof min === 'number' ? Number(min).toFixed(2) + 'm' : '-'; }
function cnSystemType(v) { return v === 'vacuum' ? '真空' : v === 'atmospheric' ? '大气' : (v || '-'); }
function cnType(t) {
  const map = {
    wafer_arrival: '晶圆到达',
    process_start: '流程开始',
    process_complete: '流程完成',
    transfer_start: '搬运开始',
    transfer_complete: '搬运完成',
    align_start: '寻边开始',
    align_complete: '寻边完成',
    pump_down_start: '抽真空开始',
    pump_down_complete: '抽真空完成',
    vent_start: '充气开始',
    vent_complete: '充气完成',
    etching_start: '刻蚀开始',
    etching_complete: '刻蚀完成',
    cleaning_start: '清洗开始',
    cleaning_complete: '清洗完成',
  };
  return map[t] || (t || '-');
}

function formatEventLog(item) {
  if (!item) return '';
  const sim = typeof item.sim_time === 'number' ? Number(item.sim_time).toFixed(2) + 'm' : '-';
  const head = `[${sim}] [${cnType(item.type)}]`;
  const wafer = item.wafer_id != null ? ` 晶圆#${item.wafer_id}` : '';
  const equip = item.equipment ? ` 设备:${item.equipment}` : '';
  const sys = item.system_type ? ` 系统:${cnSystemType(item.system_type)}` : '';
  const fromTo = item.from || item.to ? ` ${item.from ? '从 ' + item.from : ''}${item.to ? ' 到 ' + item.to : ''}` : '';
  const est = item.duration_estimate != null ? ` 预计:${ms(item.duration_estimate)}` : '';
  const dur = item.duration != null ? ` 实际:${ms(item.duration)}` : '';

  switch (item.type) {
    case 'wafer_arrival': {
      const cassette = item.cassette_id != null ? ` Cassette#${item.cassette_id}` : '';
      const layer = item.layer != null ? ` 层:${item.layer}` : '';
      return `${head}${wafer} 到达${cassette}${layer}`;
    }
    case 'process_start': {
      return `${head}${wafer} 流程启动`;
    }
    case 'process_complete': {
      const t = item.process_time != null ? ` 总时长:${ms(item.process_time)}` : '';
      const cnt = item.completed_count != null ? ` 已完成:${item.completed_count}` : '';
      const avg = item.avg_process_time != null ? ` 平均:${ms(item.avg_process_time)}` : '';
      return `${head}${wafer} 流程结束${t}${cnt}${avg}`;
    }
    case 'transfer_start':
    case 'transfer_complete': {
      return `${head}${wafer}${sys}${equip}${fromTo}${est}${dur}`;
    }
    case 'align_start':
    case 'align_complete':
    case 'pump_down_start':
    case 'pump_down_complete':
    case 'vent_start':
    case 'vent_complete':
    case 'etching_start':
    case 'etching_complete':
    case 'cleaning_start':
    case 'cleaning_complete': {
      return `${head}${wafer}${equip}${est}${dur}`;
    }
    default:
      return `${head}${wafer}${equip}${sys}${fromTo}${est}${dur}`;
  }
}

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
  A0: new THREE.Vector3(0.96, -0.2, -1.05),
  A1: new THREE.Vector3(0.96, -0.2, -1.05),
  A2: new THREE.Vector3(0.96, -0.2, -0.55),
  A3: new THREE.Vector3(0.96, -0.2, -0.05),
  A4: new THREE.Vector3(0.96, -0.2, 0.39),
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

let modelArr = ['ICP13106','ICP13110','ICP13163','ICP13240','ICP13368','ICP13405','ICP13020', 'ICP13021','ICP13022','ICP13026','ICP13052','ICP13055','ICP13056','ICP13058','ICP13064','ICP13065','ICP13066','ICP13067','ICP13068', 'Object074', 'Object075', 'Object076', 'Object101', 'Plane066',
'ICP12975','ICP12992', 'ICP12987', 'ICP12989', 'ICP12991', 'ICP13369', 'ICP13393', 'ICP13403', 'ICP13409', 'ICP12962', 'ICP12963', 'ICP13104', 'ICP13185', 'ICP13207', 'ICP13242', 'ICP13429', 'ICP13430', 'ICP13454', 'ICP13447', 'ICP13449', 'ICP13450', 
'ICP13464', 'ICP13466', 'ICP13470', 'ICP12976', 'ICP12977', 'ICP12978', 'ICP12979', 'ICP12980', 'ICP12981', 'ICP12982', 'ICP12983', 'ICP12984', 'ICP12985', 'ICP13047', 'ICP13386', 'ICP13388', 'ICP13389', 'Object111', 'Object113', 'Object114', 'Object117', 'Object118', 'Object112', '对象018', '对象026', '对象028', 'ICP13094', 'ICP13096', 'ICP13097', 'ICP12962',
'ICP13092', 'ICP13095', 'ICP13174', 'ICP13196', 'ICP13207', 'Plane067', 'Plane071', 'Plane072', '对象029', '对象030', 'Rectangle020', 'Rectangle022', 'Rectangle023', 'Object079', 'Object080', 'Object119', 'Object120','ICP13445','ICP13463','ICP13465','ICP13429','ICP13466','ICP13448',
'ICP13384','ICP13404','ICP13368','ICP13405','ICP13387','ICP13402','ICP13408','ICP13395','ICP13396','ICP13397','ICP13400','ICP13406','ICP13456','ICP13469','ICP13457','ICP13458','ICP13461','ICP13107','ICP13108','ICP13109','ICP13113','ICP13228','ICP13241','ICP13467'];

onMounted(async () => {
  init();
  await loadModel('/model/ICP001/ICP001.gltf')
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
  let grid = new THREE.GridHelper(10, 200, '#E6E6E6', '#f3f3f3');
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
    camera.position.set( 0.426, 0.608, -0.008)
    controls.target.set( 0.106, 0.217, -0.0187)
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
  
  const m2 = scene.getObjectByName('ICP13078');
  m2Ref = m2

  const zhaozi = scene.getObjectByName('zhaozi001');
  if (zhaozi) setObjectTransparency(zhaozi, true, 0.5)
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
  const m3 = scene.getObjectByName('ICP12964');
  const dur = duration * 0.8
  if (target && m3) {
    moveM2To(target, dur, absolutetime)
    gsapRotation(timeLine, m3, { x: 0, y: -Math.PI/2, z: 0 }, duration * 0.2, absolutetime + dur)
  }
}

// 加工点
function onWorkChange(key, { duration = 1, absolutetime = null }) {
  const target = presetTargets[key]
  const m22 = scene.getObjectByName('hand_A022');
  if (target && m22) {
    gsapRotation(timeLine, m22, { x: target.x, y: target.y, z: target.z }, duration, absolutetime)
  }
}

// 原点B
function onOriginClick({ duration = 1, absolutetime = null }) {
  moveM2To(new THREE.Vector3(0.96, -0.2, 0.39), duration, absolutetime)
}

// 固定点
function onFixedClick({ duration = 1, absolutetime = null }) {
  const m3 = scene.getObjectByName('ICP12964');
  const dur = duration * 0.8
  moveM2To(new THREE.Vector3(0.96, -0.2, 0.5), dur, absolutetime)
  if (m3) {
    gsapRotation(timeLine, m3, { x: 0, y: -Math.PI, z: 0 }, duration * 0.2, absolutetime + dur)
  }
}

// 送样点C
function onSampleClick({ duration = 1, absolutetime = null }) {
  const m3 = scene.getObjectByName('ICP12964');
  const dur = duration * 0.8
  moveM2To(new THREE.Vector3(0.96, -0.2, -0.3), dur, absolutetime)
  if (m3) {
    gsapRotation(timeLine, m3, { x: 0, y: -Math.PI* 3/2, z: 0 }, duration * 0.2, absolutetime + dur)
  }
}

// 机械臂1伸缩
function onArm1Change(key, { duration = 1, absolutetime = null }) {
  const m4 = scene.getObjectByName('ICP13071');
  const m5 = scene.getObjectByName('ICP13072');
  const m7 = scene.getObjectByName('ICP13075');
  const m8 = scene.getObjectByName('ICP13076');
  
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
  const m10 = scene.getObjectByName('hand_A020');
  const m11 = scene.getObjectByName('hand_A016');
  const m13 = scene.getObjectByName('hand_A021');
  const m14 = scene.getObjectByName('hand_A018');
  
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

// 仿真开始关闭
async function onSimStartChange() {
  if (helpersParams.isStart) {
    resetLogs();
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
          const lines = res.events.map(formatEventLog);
          pushLogLines(lines);
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
    resetLogs();
    helpersParams.simStatus = '';
  }
}

// 仿真动画开启关闭
async function onSimAnimationChange() {
  if (helpersParams.isAnimation) {
    clearInterval(timer);
    timer = null;
    const res = await events(simConfig.simId, 0, 2000);
    if (res && res.events) simAnimation(res.events);
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

.sim-panel {
  position: fixed;
  top: 8rem;
  right: 1rem;
  width: 380px;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
}

:deep(.ant-card-head-title) {
  font-size: 14px;
  font-weight: 600;
}

:deep(.ant-card-body) {
  padding: 16px;
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
}

/* 时间线面板样式 */
.timeline-panel {
  position: fixed;
  left: 20%;
  /* right: 0; */
  bottom: 20px;
  width: 60%;
  height: 100px;
  padding: 10px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 0 12px 4px rgba(0, 0, 0, 0.1);
  z-index: 1001;
}

.timeline-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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
}

.timeline-slider {
  padding: 0 4px;
}
</style>