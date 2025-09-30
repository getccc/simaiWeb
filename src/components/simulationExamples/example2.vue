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
                <a-input-number v-model:value="simConfig.cassettes.count" :min="1" :max="20" />
              </div>
              <div class="control-item">
                <label>每盒层数</label>
                <a-input-number v-model:value="simConfig.cassettes.layers" :min="1" :max="50" />
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
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, reactive } from "vue";
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
import { start, events } from "@/api/sim";

const container = ref(null);

let renderer, scene, camera, controls, target;
let model = null;

let raycaster, mouse, groundPlane, clickMarker;
let m2Ref = null;
let timeLine = null;

// 响应式数据
const viewParams = reactive({
  resolutionX: 1.0,
  resolutionY: 1.0,
  resolutionZ: 1.0,
  viewMode: 'render',
  geometry: '',
  pointCount: ''
});

const waterTankParams = reactive({
  nuNavierSto: 1.0,
  inletVel: 1.0,
  runOnCPU: false
});

const helpersParams = reactive({
  isTransparent: false,
  isShow: true,
  preset: 'A4',
  work: 'E0',
  clean: '',
  arm1: '',
  arm2: '',
  isStart: false
});

// 仿真配置
const simConfig = reactive({
  cassettes: {
    count: 4,
    layers: 10
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
  // camera.position.set(8, 8, 8);

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
function onPresetChange(key) {
  const target = presetTargets[key]
  const m3 = scene.getObjectByName('ICP12964');
  if (target && m3) {
    moveM2To(target)
    gsapRotation(timeLine, m3, { x: 0, y: -Math.PI/2, z: 0 }, 1)
  }
}

// 加工点
function onWorkChange(key, duration = 1, delay = 0) {
  const target = presetTargets[key]
  const m22 = scene.getObjectByName('hand_A022');
  if (target && m22) {
    gsapRotation(timeLine, m22, { x: target.x, y: target.y, z: target.z }, duration, delay)
  }
}

// 原点B
function onOriginClick() {
  moveM2To(new THREE.Vector3(0.96, -0.2, 0.39))
}

// 固定点
function onFixedClick() {
  const m3 = scene.getObjectByName('ICP12964');
  moveM2To(new THREE.Vector3(0.96, -0.2, 0.5))
  if (m3) {
    gsapRotation(timeLine, m3, { x: 0, y: -Math.PI, z: 0 }, 1)
  }
}

// 送样点C
function onSampleClick() {
  const m3 = scene.getObjectByName('ICP12964');
  moveM2To(new THREE.Vector3(0.96, -0.2, -0.3))
  if (m3) {
    gsapRotation(timeLine, m3, { x: 0, y: -Math.PI* 3/2, z: 0 }, 1)
  }
}

// 机械臂1伸缩
function onArm1Change(key) {
  const m4 = scene.getObjectByName('ICP13071');
  const m5 = scene.getObjectByName('ICP13072');
  const m7 = scene.getObjectByName('ICP13075');
  const m8 = scene.getObjectByName('ICP13076');
  
  if (key === '机械臂1伸出') {
    controlArm(timeLine, m4, m5, 'extend')
  } else if (key === '机械臂1收回') {
    controlArm(timeLine, m4, m5, 'retract')
  } else if (key === '机械臂2伸出') {
    controlArm(timeLine, m8, m7, 'extend')
  } else if (key === '机械臂2收回') {
    controlArm(timeLine, m8, m7, 'retract')
  }
}

// 机械臂2伸缩
function onArm2Change(key, duration = 1, delay = 0) {
  const m10 = scene.getObjectByName('hand_A020');
  const m11 = scene.getObjectByName('hand_A016');
  const m13 = scene.getObjectByName('hand_A021');
  const m14 = scene.getObjectByName('hand_A018');
  
  if (key === '机械臂1伸出') {
    controlArm(timeLine, m10, m11, 'extend', duration, delay)
  } else if (key === '机械臂1收回') {
    controlArm(timeLine, m10, m11, 'retract', duration, delay)
  } else if (key === '机械臂2伸出') {
    controlArm(timeLine, m14, m13, 'extend', duration, delay)
  } else if (key === '机械臂2收回') {
    controlArm(timeLine, m14, m13, 'retract', duration, delay)
  }
}

// 移动
function moveM2To(targetVec3) {
  if (!m2Ref || !targetVec3) return
  timeLine.to(m2Ref.position, {
    x: targetVec3.x,
    y: targetVec3.y,
    z: targetVec3.z,
    duration: 1,
    ease: 'power1.inOut',
  })
}

// 旋转
function gsapRotation(timeLine, model, target, duration = 1, delay = 0, onComplete = () => { }, vars) {
  timeLine.to(model.rotation, {
    x: target.x,
    y: target.y,
    z: target.z,
    duration: duration,
    delay: delay,
    ease: 'none',
    onComplete: () => {
      onComplete && onComplete()
    },
  }, vars)
}

// 机械臂控制
function controlArm(timeLine, arm1, arm2, action, duration = 1, delay = 0) {
  let roatateY1 = 0
  let roatateY2 = 0
  if (action === 'extend') {
    roatateY1 = -Math.PI/2
    roatateY2 = Math.PI/2
  }
  gsapRotation(timeLine, arm1, { x: 0, y: roatateY1, z: 0 }, duration, delay)
  gsapRotation(timeLine, arm2, { x: 0, y: roatateY2, z: 0 }, duration, delay, null, `-=${duration}`)
}

function onArmChange(key) {
  if (key === 1) {
    onArm1Change('机械臂1伸出') // 机械臂伸出
    onArm1Change('机械臂1收回') // 机械臂收回
    onArm1Change('机械臂2伸出') // 机械臂伸出
    onArm1Change('机械臂2收回') // 机械臂收回
  }
  if (key === 2) {
    onArm1Change('机械臂1伸出') // 机械臂伸出
    onArm1Change('机械臂1收回') // 机械臂收回
    // onArm1Change('机械臂1伸出') // 机械臂伸出
    // onArm1Change('机械臂1收回') // 机械臂收回
    // onArm1Change('机械臂2伸出') // 机械臂伸出
    // onArm1Change('机械臂2收回') // 机械臂收回
    onArm1Change('机械臂2伸出') // 机械臂伸出
    onArm1Change('机械臂2收回') // 机械臂收回
  }
  if (key === 3) {
    onArm2Change('机械臂1伸出') // 机械臂伸出
    onArm2Change('机械臂1收回') // 机械臂收回
    onArm2Change('机械臂2伸出') // 机械臂伸出
    onArm2Change('机械臂2收回') // 机械臂收回
  }
}

async function onSimStartChange() {
  if (helpersParams.isStart) {
    // 深拷贝以移除 reactive proxy
    const payload = JSON.parse(JSON.stringify(simConfig));
    const startRes = await start(payload);
    if (startRes.ok) {
      const simId = startRes.id || 0;
      const res = await events(simId, 0, 2000);
      if (res && res.events) simAnimation(res.events);
    }
  }
}

function simAnimation(data) {
  data.forEach(item => {
    const type = item.type
    const equipment = item.equipment
    const system_type = item.system_type
    const sim_time = item.sim_time

    if (type === 'transfer_start' && system_type === 'atmospheric') {
      const from = item.from
      const to = item.to
      
      if (to === "WaferAligner" && from.includes("Cassette")) {  // 寻边
        // 取基片
        const pos = from.split(':')[0].split('Cassette ')[1]
        onPresetChange(`A${pos}`)
        onArmChange(1)
        
        // 寻边点校正
        onFixedClick() // 移动
        onArmChange(2)
        console.log('arm1取基片、寻边', `A${pos}`, sim_time)
      }

      if (to === "LoadLock") {   // 真空腔室
        onSampleClick() // 移动
        onArmChange(1)
        console.log('arm1运送真空腔室', sim_time)
      }

      if (to.includes("Cassette")) {  // 返回基片
          onSampleClick() // 移动
          onArmChange(1)

          const pos = to.split(':')[0].split('Cassette ')[1]
          onPresetChange(`A${pos}`)
          onArmChange(1)
          console.log('arm1取回加工后的片', `A${pos}`, sim_time)
      }
    } 


    if (type === 'transfer_start' && system_type === 'vacuum') {
      const from = item.from
      const to = item.to

      if (from === "LoadLock" && to === "TransferChamber") {  // 从真空腔室 取出
        onWorkChange(`E0`)
        onArmChange(3)
        console.log('arm2从真空腔室到加工腔室', sim_time)
      }

      if (from.includes("EtchingChamber") && to === "TransferChamber") {  // 从蚀刻腔室 到 真空腔室
        const pos = from.split('EtchingChamber ')[1]
        onWorkChange(`E${pos}`)
        onArmChange(3)
        console.log(`arm2从蚀刻腔室E${pos}到加工腔室`, sim_time)
      }

      if (from.includes("CleaningChamber")) {  // 清洗腔室 到 真空腔室
        const pos = from.split('CleaningChamber ')[1]
        onWorkChange(`F${pos}`)
        onArmChange(3)
        onWorkChange(`E0`)
        onArmChange(3)
        console.log(`arm2从清洗腔室F${pos}到真空腔室`, sim_time)
      }

      if (to.includes("EtchingChamber")) {  // 从 加工腔室 到 蚀刻腔室
        const pos = to.split('EtchingChamber ')[1]
        onWorkChange(`E${pos}`)
        onArmChange(3)
        console.log(`arm2从加工腔室到蚀刻腔室E${pos}`, sim_time)
      }

      if (to.includes("CleaningChamber")) {  // 从 加工腔室 到 清洗腔室
        const pos = to.split('CleaningChamber ')[1]
        onWorkChange(`F${pos}`)
        onArmChange(3)
        console.log(`arm2从加工腔室到清洗腔室F${pos}`, sim_time)
      }

    }
  })
}

onBeforeUnmount(() => {
  if (renderer && renderer.domElement) {
    renderer.domElement.removeEventListener('click', onPointerClick)
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
  width: 320px;
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
</style>