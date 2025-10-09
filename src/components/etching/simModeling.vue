<template>
  <div class="simModeling-container">
    <div ref="container" class="simModeling-map"></div>
    <aside v-if="etchStore.drawerVisible" class="simModeling-panel">
      <a-tabs v-model:activeKey="activeTab" type="card" size="small" class="panel-tabs">
        <a-tab-pane key="system" tab="系统配置">
          <div style="margin-top: 16px;" class="panel-stack">
            <div class="panel-card__block">
              <a-button @click="addData" style="width: 320px;border: 1px solid #2484FA;color: #2484FA;" :icon="h(PlusCircleOutlined)">创建</a-button>
            </div>
            <div class="panel-card__tags">
              <a-tag v-for="opt in experimentOptions" :key="opt.value" :class="[clickedTag === opt.value && 'tags-selected']" @click="handleTag(opt.value)" @close="delData(opt.value)" closable>{{ opt.label }}</a-tag>
            </div>
            <FormNumberField
              label="到达间隔"
              v-model="parameterState.arrivalInterval"
              :wrapper-style="{ marginBottom: '5px' }"
              :min="0"
              :step="1"
              unit="秒"
            />
            <FormNumberField
              label="仿真时间"
              v-model="parameterState.simulationTime"
              :min="0"
              :step="100"
              unit="秒"
            />

            <a-collapse v-model:activeKey="systemCollapseKeys" expand-icon-position="end" class="panel-collapse-group">
              <a-collapse-panel key="strategy" header="资源调度参数">
                <a-space direction="vertical" class="panel-space">
                  <div class="panel-block">
                    <div style="margin-bottom: 8px;" class="panel-block__label">机械臂任务分配策略</div>
                    <a-radio-group v-model:value="parameterState.armStrategy">
                      <a-radio value="distance">最短路径优先</a-radio>
                      <a-radio value="balance">负载均衡</a-radio>
                    </a-radio-group>
                  </div>
                  <div>
                    <div style="margin-bottom: 8px;" class="panel-block__label">腔室选择策略</div>
                    <a-radio-group v-model:value="parameterState.chamberStrategy" style="height: 68px;display: flex;flex-direction: column;justify-content: space-around;">
                      <a-radio value="optimized">优先使用最近空闲腔室</a-radio>
                      <a-radio value="process">按工艺参数匹配腔室选择</a-radio>
                    </a-radio-group>
                  </div>
                </a-space>
              </a-collapse-panel>
              <a-collapse-panel key="capacity" header="容量参数">
                <a-space direction="vertical" :size="16" class="panel-space">
                  <div>
                    <div class="panel-caption">
                      <div class="panel-block__label">设备故障重试</div>
                      <a-input-number
                        v-model:value="parameterState.faultRetryLimit"
                        :min="0"
                        addon-after="次"
                        class="panel-input-number"
                      />
                    </div>
                    <div class="panel-hint">如机械臂取片失败后重试 2 次</div>
                  </div>
                  <div>
                    <div class="panel-caption">
                      <div class="panel-block__label">超时阈值</div>
                      <a-input-number
                        v-model:value="parameterState.timeoutThreshold"
                        :min="0"
                        :step="1"
                        class="panel-input-number"
                        addon-after="秒"
                      />
                    </div>
                    <div class="panel-hint">如腔室长时间未响应则切换空闲腔室</div>
                  </div>
                </a-space>
              </a-collapse-panel>
              <a-collapse-panel key="alerts" header="异常检测阈值">
                <div class="panel-caption">
                  <div class="panel-block__label">阈值</div>
                  <a-input-number
                    v-model:value="parameterState.particleAlertThreshold"
                    :min="0"
                    addon-after="个"
                    class="panel-input-number"
                  />
                </div>
                <div class="panel-hint">如 particle 数量超过 5 个/片则抛出异常</div>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </a-tab-pane>

        <a-tab-pane key="parameter" tab="参数控制">
          <div class="panel-stack">
            <a-collapse v-model:activeKey="parameterCollapseKeys" expand-icon-position="end" class="panel-collapse-group">
              <a-collapse-panel key="cassette" header="晶圆盒系统（Cassette）">
                <a-space direction="vertical" :size="16" class="panel-space">
                  <FormNumberField
                    label="晶圆盒数量"
                    v-model="parameterState.waferCassetteCount"
                    :min="0"
                    unit="盒"
                  />
                  <FormNumberField
                    label="晶圆盒容量"
                    v-model="parameterState.waferCassetteCapacity"
                    :min="0"
                    unit="片"
                  />
                  <a-checkbox style="margin-left: 120px;" v-model:checked="parameterState.unlimitedWaferSupply">晶圆原料无限供应</a-checkbox>
                </a-space>
              </a-collapse-panel>

              <a-collapse-panel key="transfer" header="传输机械臂系统（Transfer Robot）">
                <a-space direction="vertical" :size="8" class="panel-space">
                  <div class="card-header">大气机械臂</div>
                  <div class="line"></div>
                  <FormNumberField
                    label="数量"
                    v-model="parameterState.atmosphereArmCount"
                    :min="0"
                    unit="个"
                  />
                  <a-radio-group style="margin-left: 114px;" v-model:value="parameterState.atmosphereArmMode">
                    <a-radio value="single">单臂</a-radio>
                    <a-radio value="dual">双臂</a-radio>
                  </a-radio-group>
                  <FormRangeField
                    label="传输时间"
                    v-model="parameterState.atmosphereTransferTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />

                  <div class="card-header">真空机械臂</div>
                  <div class="line"></div>
                  <FormNumberField
                    label="数量"
                    v-model="parameterState.vacuumArmCount"
                    :min="0"
                    unit="个"
                  />
                  <a-radio-group style="margin-left: 114px;" v-model:value="parameterState.vacuumArmMode">
                    <a-radio value="single">单臂</a-radio>
                    <a-radio value="dual">双臂</a-radio>
                  </a-radio-group>
                  <FormRangeField
                    label="传输时间"
                    v-model="parameterState.vacuumTransferTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                </a-space>
              </a-collapse-panel>

              <a-collapse-panel key="edge" header="晶圆寻边器（Edge Detector）">
                <a-space direction="vertical" :size="8" class="panel-space">
                  <FormRangeField
                    label="单晶圆寻边耗时"
                    v-model="parameterState.edgeSeekTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                  <FormNumberField
                    label="连续工作次数"
                    v-model="parameterState.edgeContinuousRunCount"
                    :min="0"
                    unit="片"
                  />
                  <FormRangeField
                    label="校准耗时"
                    v-model="parameterState.edgeCalibrationTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                </a-space>
              </a-collapse-panel>

              <a-collapse-panel key="load" header="真空过渡腔（Load Lock）">
                <a-space direction="vertical" :size="8" class="panel-space">
                  <div class="card-header">工艺时间</div>
                  <div class="line"></div>
                  <FormRangeField
                    label="抽真空时间"
                    v-model="parameterState.loadLockPumpDownTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                  <FormRangeField
                    label="充气时间"
                    v-model="parameterState.loadLockVentTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />

                  <div class="card-header">真空参数</div>
                  <div class="line"></div>
                  <FormNumberField
                    label="极限真空度"
                    v-model="parameterState.loadLockUltimateVacuum"
                    :min="0"
                    unit="Torr 级别"
                  />
                  <FormNumberField
                    label="抽真空速率"
                    v-model="parameterState.loadLockPumpSpeed"
                    :min="0"
                    unit="秒"
                  />
                  <div class="panel-hint">如从大气压到 10⁻³ Torr 需 30~60秒</div>
                  <FormNumberField
                    label="保压性能"
                    v-model="parameterState.dryCleanCycleCount"
                    :min="0"
                    unit="个"
                  />
                  <div class="panel-hint">气体如 O₂、N₂/H₂混合气体</div>

                  <div class="card-header">干燥参数</div>
                  <div class="line"></div>
                  <FormRangeField
                    label="干燥时间"
                    v-model="parameterState.dryingTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                  <FormRangeField
                    label="干燥气体压力"
                    v-model="parameterState.dryingGasPressureRange"
                    unit="MPa"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                </a-space>
              </a-collapse-panel>

              <a-collapse-panel key="etch" header="蚀刻腔室（Etching Chamber）">
                <a-space direction="vertical" :size="8" class="panel-space">
                  <FormNumberField
                    label="蚀刻腔室数量"
                    v-model="parameterState.etchChamberCount"
                    :min="0"
                    unit="台"
                  />
                  <div class="card-header">工艺时间（单次蚀刻时长）</div>
                  <div class="line"></div>
                  <FormRangeField
                    label="A腔室"
                    v-model="parameterState.etchChamberATimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="120"
                  />
                  <FormRangeField
                    label="B腔室"
                    v-model="parameterState.etchChamberBTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="120"
                  />
                  <FormRangeField
                    label="C腔室"
                    v-model="parameterState.etchChamberCTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="120"
                  />
                  <FormRangeField
                    label="D腔室"
                    v-model="parameterState.etchChamberDTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="120"
                  />
                  <FormRangeField
                    label="E腔室"
                    v-model="parameterState.etchChamberETimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="120"
                  />
                  <FormRangeField
                    label="F腔室"
                    v-model="parameterState.etchChamberFTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="120"
                  />

                  <div class="card-header">真空参数</div>
                  <div class="line"></div>
                  <FormRangeField
                    label="工作真空度"
                    v-model="parameterState.etchWorkingVacuumRange"
                    unit="mTorr"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                  <FormRangeField
                    label="抽气系统抽速"
                    v-model="parameterState.etchPumpSpeedRange"
                    unit="L/s"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />

                  <div class="card-header">等离子参数</div>
                  <div class="line"></div>
                  <FormRangeField
                    label="RF功率"
                    v-model="parameterState.rfPowerRange"
                    unit="W"
                    :min="0"
                    :slider-min="1"
                    :slider-max="1000"
                  />
                  <FormNumberField
                    label="频率"
                    v-model="parameterState.rfFrequency"
                    :min="0"
                    unit="MHz"
                  />
                  <FormRangeField
                    label="偏压功率"
                    v-model="parameterState.biasPowerRange"
                    unit="W"
                    :min="0"
                    :slider-min="1"
                    :slider-max="1000"
                  />

                  <div class="card-header">气体参数</div>
                  <div class="line"></div>
                  <FormNumberField
                    label="蚀刻气体种类"
                    v-model="parameterState.etchGasTypeCount"
                    :min="0"
                    unit="种"
                  />
                  <FormNumberField
                    label="气体流量控制精度"
                    v-model="parameterState.gasFlowControlAccuracy"
                    :min="0"
                    unit="sccm"
                  />
                  <FormNumberField
                    label="气体混合比例"
                    v-model="parameterState.gasMixRatio"
                    :min="0"
                    unit="%"
                  />

                  <div class="card-header">温度参数</div>
                  <div class="line"></div>
                  <FormRangeField
                    label="晶圆台温度"
                    v-model="parameterState.waferChuckTemperatureRange"
                    unit="℃"
                    :min="0"
                    :slider-min="1"
                    :slider-max="300"
                  />
                  <FormRangeField
                    label="腔室壁温"
                    v-model="parameterState.chamberWallTemperatureRange"
                    unit="℃"
                    :min="0"
                    :slider-min="1"
                    :slider-max="300"
                  />
                </a-space>
              </a-collapse-panel>

              <a-collapse-panel key="clean" header="清洗腔室（Cleaning Chamber）">
                <a-space direction="vertical" :size="16" class="panel-space">
                  <FormNumberField
                    label="清洗腔室数量"
                    v-model="parameterState.cleaningChamberCount"
                    :min="0"
                    unit="台"
                  />
                  <div class="card-header">清洗参数</div>
                  <div class="line"></div>
                  <FormRangeField
                    label="清洗时间"
                    v-model="parameterState.cleaningTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                  <FormRangeField
                    label="清洗功率"
                    v-model="parameterState.cleaningPowerRange"
                    unit="W"
                    :min="0"
                    :slider-min="1"
                    :slider-max="1000"
                  />
                  <FormRangeField
                    label="气体流量"
                    v-model="parameterState.cleaningGasFlowRange"
                    unit="sc"
                    :min="0"
                    :slider-min="1"
                    :slider-max="1000"
                  />

                  <div class="card-header">清洗方式</div>
                  <div class="line"></div>
                  <div class="panel-caption">
                    <div class="panel-block__label">干法清洗</div>
                    <a-input-number
                      v-model:value="parameterState.dryCleanCycleCount"
                      :min="0"
                      addon-after="次"
                      class="panel-input-number"
                    />
                  </div>
                  <div class="panel-hint">常用 O₂、N₂/H₂ 混合气体</div>

                  <div class="card-header">干燥参数</div>
                  <div class="line"></div>
                  <FormRangeField
                    label="干燥时间"
                    v-model="parameterState.dryingTimeRange"
                    unit="秒"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                  <FormRangeField
                    label="干燥气体压力"
                    v-model="parameterState.dryingGasPressureRange"
                    unit="MPa"
                    :min="0"
                    :slider-min="1"
                    :slider-max="30"
                  />
                </a-space>
              </a-collapse-panel>
            </a-collapse>
          </div>
        </a-tab-pane>
      </a-tabs>
    </aside>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { onMounted, onBeforeUnmount, ref, reactive, watch, h } from "vue";
import { PlusCircleOutlined } from '@ant-design/icons-vue';
import FormNumberField from '@/components/common/FormNumberField.vue';
import FormRangeField from '@/components/common/FormRangeField.vue';
import mapImage from "@/assets/images/map/map.png";
import Map from "ol/Map";
import View from "ol/View";
import ImageLayer from "ol/layer/Image";
import VectorLayer from "ol/layer/Vector";
import ImageStatic from "ol/source/ImageStatic";
import VectorSource from "ol/source/Vector";
import Overlay from "ol/Overlay";
import Feature from "ol/Feature";
import Polygon from "ol/geom/Polygon";
import Projection from "ol/proj/Projection";
import { unByKey } from "ol/Observable";
import Style from "ol/style/Style";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { getCenter } from "ol/extent";
import arm1 from "@/assets/images/map/arm1.png";
import arm2 from "@/assets/images/map/arm2.png";
import edge from "@/assets/images/map/edge.png";
import chamber from "@/assets/images/map/chamber.png";
import { message } from 'ant-design-vue';
import { createParameter, updateParameterById, getParameter, getParameterById, delParameterById } from '@/api/etching/parameter';
import { createRuns } from '@/api/etching/runs';
import { Etch } from '@/stores/etch';

const props = defineProps<{
  param_key: any
}>();
const etchStore = Etch()
const emit = defineEmits(["regionClick", "mapClick"]);

const container = ref(null);
const mapInstance = ref(null);
const experimentOptions = ref([]);
const parameterCollapseKeys = ref([]);
const clickedCom = ref(null);
const clickedTag = ref(null);

const overlays = [];
let pointerMoveListenerKey = null;
let lastHoveredFeature = null;

const vectorSource = new VectorSource();
const regionStyle = new Style({
  fill: new Fill({ color: "rgba(30, 144, 255, 0.25)" }),
  stroke: new Stroke({ color: "#1e90ff", width: 2 })
});
const defaultStyle = new Style({
  fill: new Fill({ color: "rgba(30, 144, 255, 0)" })
});
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: regionStyle
});

const DEFAULT_PADDING = 120;
const INITIAL_ZOOM_OUT_STEPS = 3;
const MIN_ZOOM = -1;
const EXTENT_EXPANSION_RATIO = 1;

const activeTab = ref("system");
const systemCollapseKeys = ref(['strategy', 'capacity', 'alerts']);

const parameterState = reactive({
  arrivalInterval: 10,
  simulationTime: 10000,
  armStrategy: "distance",
  chamberStrategy: "optimized",
  faultRetryLimit: 2,
  timeoutThreshold: 10,
  particleAlertThreshold: 5,
  waferCassetteCount: 4,
  waferCassetteCapacity: 1000,
  unlimitedWaferSupply: true,
  atmosphereArmCount: 1,
  atmosphereArmMode: "single",
  atmosphereTransferTimeRange: [10, 15],
  vacuumArmCount: 1,
  vacuumArmMode: "single",
  vacuumTransferTimeRange: [12, 18],
  edgeSeekTimeRange: [6, 9],
  edgeContinuousRunCount: 5,
  edgeCalibrationTimeRange: [4, 6],
  loadLockPumpDownTimeRange: [8, 12],
  loadLockVentTimeRange: [6, 9],
  loadLockUltimateVacuum: 5,
  loadLockPumpSpeed: 45,
  loadLockPressureHold: "",
  loadLockVentSpeed: 35,
  etchChamberCount: 6,
  etchChamberATimeRange: [60, 75],
  etchChamberBTimeRange: [60, 75],
  etchChamberCTimeRange: [60, 75],
  etchChamberDTimeRange: [60, 75],
  etchChamberETimeRange: [60, 75],
  etchChamberFTimeRange: [60, 75],
  etchWorkingVacuumRange: [3, 5],
  etchPumpSpeedRange: [500, 600],
  rfPowerRange: [500, 700],
  rfFrequency: 13,
  biasPowerRange: [100, 150],
  etchGasTypeCount: 3,
  gasFlowControlAccuracy: 1,
  gasMixRatio: 50,
  waferChuckTemperatureRange: [180, 220],
  chamberWallTemperatureRange: [120, 150],
  cleaningChamberCount: 2,
  cleaningTimeRange: [20, 25],
  cleaningPowerRange: [500, 600],
  cleaningGasFlowRange: [50, 80],
  dryCleanCycleCount: 3,
  dryingTimeRange: [15, 20],
  dryingGasPressureRange: [1, 2]
});

const parameterObj = [
  { key: "cassette.count", value: 'waferCassetteCount' },
  { key: "cassette.capacity", value: 'waferCassetteCapacity' },
  { key: "cassette.change_time", value: 'arrivalInterval' },
  { key: "atmo_robot.count", value: 'atmosphereArmCount' },
  { key: "atmo_robot.transfer_time", value: 'atmosphereTransferTimeRange' },
  { key: "vac_robot.count", value: 'vacuumArmCount' },
  { key: "vac_robot.transfer_time", value: 'vacuumTransferTimeRange' },
  { key: "load_lock.vacuum_time", value: 'loadLockPumpDownTimeRange' },
  { key: "load_lock.vent_time", value: 'loadLockVentTimeRange' },
  { key: "edge_detector.align_time", value: 'edgeSeekTimeRange' },
  { key: "edge_detector.calibration_time", value: 'edgeCalibrationTimeRange' },
  { key: "edge_detector.max_batch", value: 'edgeContinuousRunCount' },
  { key: "etch.count", value: 'etchChamberCount' },
  { key: "etch.time_A", value: 'etchChamberATimeRange' },
  { key: "etch.time_B", value: 'etchChamberBTimeRange' },
  { key: "etch.time_C", value: 'etchChamberCTimeRange' },
  { key: "etch.time_D", value: 'etchChamberDTimeRange' },
  { key: "etch.time_E", value: 'etchChamberETimeRange' },
  { key: "etch.time_F", value: 'etchChamberFTimeRange' },
  { key: "clean.count", value: 'cleaningChamberCount' },
  { key: "clean.time", value: 'cleaningTimeRange' },
  { key: "clean.dry_time", value: 'dryingTimeRange' },
  { key: "simulation.duration", value: 'simulationTime' },
]

const comPos = [
  {
    id: 'cassette1',
    name: '晶圆盒',
    key: 'cassette',
    position: [[430, 180],[430, 32],[1150, 32],[1150, 180]],
    bgImage: chamber,
    bgImageSize: [60, 60],
    bgImageCoor: [[528, 110], [697, 110], [866, 110], [1041, 110]],
    bgOverlay: null
  },
  {
    id: 'arm1',
    name: '大气机械臂1',
    key: 'transfer',
    position: [[520, 400],[520, 230],[720, 230],[720, 400]],
    bgImage: arm1,
    bgImageSize: [60, 60],
    bgImageCoor: [[610, 340]],
    bgOverlay: null
  },
  {
    id: 'edge1',
    name: '晶圆寻边器',
    key: 'edge',
    position: [[300, 400],[300, 285],[440, 285],[440, 400]],
    bgImage: edge,
    bgImageSize: [60, 60],
    bgImageCoor: [[378, 352]],
    bgOverlay: null
  },
  {
    id: 'load1',
    name: '真空过渡腔',
    key: 'load',
    position: [[690, 668],[690, 490],[872, 490],[872, 668]],
    bgImage: chamber,
    bgImageSize: [60, 60],
    bgImageCoor: [[785, 580]],
    bgOverlay: null
  },
  {
    id: 'arm2',
    name: '真空机械臂',
    key: 'transfer',
    position: [[600, 1090],[600, 730],[970, 730],[970, 1090]],
    bgImage: arm2,
    bgImageSize: [115, 115],
    bgImageCoor: [[780, 910]],
    bgOverlay: null
  },
  {
    id: 'clean1',
    name: '清洗腔室1',
    key: 'clean',
    position: [[525, 668],[525, 490],[690, 490],[690, 668]],
    bgImage: edge,
    bgImageSize: [60, 60],
    bgImageCoor: [[611, 588]],
    bgOverlay: null
  },
  {
    id: 'clean2',
    name: '清洗腔室2',
    key: 'clean',
    position: [[872, 668],[872, 490],[1050, 490],[1050, 668]],
    bgImage: edge,
    bgImageSize: [60, 60],
    bgImageCoor: [[958, 588]],
    bgOverlay: null
  },
  {
    id: 'etch1',
    name: '蚀刻腔室1',
    key: 'etch',
    position: [[333, 1135],[333, 702],[555, 702],[555, 1135]],
    bgImage: chamber,
    bgImageSize: [90, 90],
    bgImageCoor: [[440, 800], [440, 1020]],
    bgOverlay: null
  },
  {
    id: 'etch2',
    name: '蚀刻腔室2',
    key: 'etch',
    position: [[560, 1350],[560, 1140],[1000, 1140],[1000, 1350]],
    bgImage: chamber,
    bgImageSize: [90, 90],
    bgImageCoor: [[675, 1235], [895, 1235]],
    bgOverlay: null
  },
  {
    id: 'etch3',
    name: '蚀刻腔室3',
    key: 'etch',
    position: [[1000, 1135],[1000, 700],[1225, 700],[1225, 1135]],
    bgImage: chamber,
    bgImageSize: [90, 90],
    bgImageCoor: [[1120, 800], [1120, 1020]],
    bgOverlay: null
  },
]

const loadImageExtent = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve([0, 0, img.width, img.height]);
    };
    img.onerror = reject;
    img.src = src;
  });
};

const expandExtent = (extent, ratio = 0.2) => {
  const [minX, minY, maxX, maxY] = extent;
  const width = maxX - minX;
  const height = maxY - minY;
  const paddingX = width * ratio;
  const paddingY = height * ratio;
  return [minX - paddingX, minY - paddingY, maxX + paddingX, maxY + paddingY];
};

const handleMapClick = (event) => {
  const map = mapInstance.value;
  if (!map) return;

  const coordinate = Array.isArray(event.coordinate) ? [...event.coordinate] : null;
  const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
  emit("mapClick", { feature: feature ?? null, coordinate });

  if (!feature) {
    console.log("Map clicked at", coordinate ? coordinate.join(", ") : "unknown coordinate");
  } else {
    const id = feature.getId();
    clickedCom.value = id;
    activeTab.value = "parameter";
    handleComOVerlay(id, 1);
    const item = comPos.find(i => i.id === id);
    parameterCollapseKeys.value = item ? [item.key] : [];
    emit("regionClick", { feature, coordinate });
  }
};

const handlePointerMove = (event) => {
  const map = mapInstance.value;
  if (!map) return;

  const feature = map.forEachFeatureAtPixel(event.pixel, (feat) => feat);
  if (feature !== lastHoveredFeature) {
    if (feature) {
      const id = feature.getId();
      id !== clickedCom.value && handleComOVerlay(id, 0.5);
    } else {
      handleComOVerlay(clickedCom.value, 1);
    }
    lastHoveredFeature = feature || null;
  }
};

const handleComOVerlay = (id, opacity) => {
  const com1 = comPos.find(t => t.id === id);
  const com2 = comPos.find(t => t.id === clickedCom.value);
  comPos.forEach(item => {
    const value = item.key === com2?.key ? 1 : (com1?.key === item.key ? opacity : 0);
    if (item.bgOverlay) {
      item.bgOverlay.forEach(overlay => {
        const bgImg = overlay.element.querySelectorAll('img')[0];
        if (bgImg)
        bgImg.style.opacity = value;
      });
    }
  });
}

const initializeMap = async () => {
  if (!container.value) return;

  try {
    const extent = await loadImageExtent(mapImage);
    const expandedExtent = expandExtent(extent, EXTENT_EXPANSION_RATIO);

    const projection = new Projection({
      code: "sim-modeling-image",
      units: "pixels",
      extent: expandedExtent
    });

    const view = new View({
      projection,
      center: getCenter(extent),
      zoom: 2,
      minZoom: MIN_ZOOM,
      maxZoom: 3,
      extent: expandedExtent
    });

    mapInstance.value = new Map({
      target: container.value,
      layers: [
        new ImageLayer({
          source: new ImageStatic({
            url: mapImage,
            imageExtent: extent,
            projection
          })
        }),
        vectorLayer
      ],
      view,
      controls: []
    });

    const size = mapInstance.value.getSize() ?? [
      container.value.clientWidth || 0,
      container.value.clientHeight || 0
    ];

    view.fit(extent, {
      size,
      padding: [DEFAULT_PADDING, DEFAULT_PADDING, DEFAULT_PADDING, DEFAULT_PADDING]
    });

    const currentZoom = view.getZoom();
    if (typeof currentZoom === "number") {
      view.setZoom(Math.max(MIN_ZOOM, currentZoom - INITIAL_ZOOM_OUT_STEPS));
    }

    mapInstance.value.on("singleclick", handleMapClick);
    pointerMoveListenerKey = mapInstance.value.on("pointermove", handlePointerMove);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize OpenLayers map", error);
  }
};

const disposeMap = () => {
  if (!mapInstance.value) return;

  mapInstance.value.un("singleclick", handleMapClick);

  overlays.forEach((overlay) => {
    mapInstance.value.removeOverlay(overlay);
  });
  overlays.length = 0;

  if (pointerMoveListenerKey) {
    unByKey(pointerMoveListenerKey);
    pointerMoveListenerKey = null;
    lastHoveredFeature = null;
  }

  mapInstance.value.setTarget(undefined);
  mapInstance.value = null;
};

const drawRegionOnBasemap = (options = {}) => {
  const map = mapInstance.value;
  if (!map) return null;

  const {
    id,
    type = "Polygon",
    points = [],
    style = regionStyle,
    clearExisting = true,
    onComplete
  } = options;

  if (!Array.isArray(points) || points.length < 3) {
    console.warn('drawRegionOnBasemap requires at least three points to form a polygon.');
    return null;
  }

  const normalizedPoints = points
    .map((coordinate) => {
      if (Array.isArray(coordinate) && coordinate.length === 2) {
        const [x, y] = coordinate;
        const nx = Number(x);
        const ny = Number(y);
        if (!Number.isNaN(nx) && !Number.isNaN(ny)) {
          return [nx, ny];
        }
      }
      return null;
    })
    .filter(Boolean);

  if (normalizedPoints.length < 3) {
    console.warn('drawRegionOnBasemap received invalid points, unable to draw.');
    return null;
  }

  const [firstX, firstY] = normalizedPoints[0];
  const [lastX, lastY] = normalizedPoints[normalizedPoints.length - 1];
  if (firstX !== lastX || firstY !== lastY) {
    normalizedPoints.push([firstX, firstY]);
  }

  if (clearExisting) {
    vectorSource.clear();
  }

  if (type !== 'Polygon') {
    console.warn(`Unsupported geometry type "${type}". Only Polygon is supported.`);
  }

  const geometry = new Polygon([normalizedPoints]);
  const feature = new Feature({ geometry });
  feature.setStyle(style || regionStyle);
  feature.setId(id);
  vectorSource.addFeature(feature);

  if (typeof onComplete === 'function') {
    onComplete(feature);
  }

  map.render();

  return feature;
};

const addImageOverlay = ({ src, coordinate, size, opacity, positioning = "center-center" }) => {
  const map = mapInstance.value;
  if (!map || !Array.isArray(coordinate) || coordinate.length !== 2) return null;

  const element = document.createElement("img");
  element.src = src;
  element.alt = "overlay-image";
  element.className = "overlay-image";

  if (typeof opacity === "number" && opacity >= 0 && opacity <= 1) {
    element.style.opacity = opacity;
  }

  if (size && size.length === 2) {
    const [width, height] = size;
    if (width) element.style.width = `${width}px`;
    if (height) element.style.height = `${height}px`;
  }

  const overlay = new Overlay({
    element,
    position: coordinate,
    positioning,
    stopEvent: false
  });

  overlays.push(overlay);
  map.addOverlay(overlay);

  return overlay;
};

const handleTag = (val) => {
  clickedTag.value = val;
  getDataById(val);
}

// ----------------------------------------------- 接口调用 -----------------------------------------
const getData = async () => {
  const data = await getParameter('etching', 1);
  const newData = data.map(t => ({ label: t.name, value: t.id }));
  // replace the array to ensure reactivity with ref
  experimentOptions.value = newData;
  console.log('experimentOptions', experimentOptions.value);
}

const getDataById = async (id) => {
  const data = await getParameterById(id);
  if (data) {
    data.values.forEach(t => {
      const item = parameterObj.find(obj => obj.key === t.param_key);
      if(item) {
        parameterState[item.value] = t.value_json
      }
    })
  }
}

const addData = async () => {
  const arr = (experimentOptions.value || []).map(t => Number((t.label || '').split('实验室')[1]))
  const max = Math.max(...arr);
  let name = `实验室${isFinite(max) ? max + 1 : 1}`;
  const param = {
    template_id: 1,
    domain_key: "etching",
    name: name,
    description: "蚀刻机参数集",
    tags: ["etching"],
    values: {
      "cassette.count": parameterState.waferCassetteCount,
      "cassette.capacity": parameterState.waferCassetteCapacity,
      "cassette.change_time": parameterState.arrivalInterval,
      "atmo_robot.count": parameterState.atmosphereArmCount,
      "atmo_robot.transfer_time": parameterState.atmosphereTransferTimeRange,
      "vac_robot.count": parameterState.vacuumArmCount,
      "vac_robot.transfer_time": parameterState.vacuumTransferTimeRange,
      "load_lock.vacuum_time": parameterState.loadLockPumpDownTimeRange,
      "load_lock.vent_time": parameterState.loadLockVentTimeRange,
      "edge_detector.align_time": parameterState.edgeSeekTimeRange,
      "edge_detector.calibration_time": parameterState.edgeCalibrationTimeRange,
      "edge_detector.max_batch": parameterState.edgeContinuousRunCount,
      "etch.count": parameterState.etchChamberCount,
      "etch.time_A": parameterState.etchChamberATimeRange,
      "etch.time_B": parameterState.etchChamberBTimeRange,
      "etch.time_C": parameterState.etchChamberCTimeRange,
      "etch.time_D": parameterState.etchChamberDTimeRange,
      "etch.time_E": parameterState.etchChamberETimeRange,
      "etch.time_F": parameterState.etchChamberFTimeRange,
      "clean.count": parameterState.cleaningChamberCount,
      "clean.time": parameterState.cleaningTimeRange,
      "clean.dry_time": parameterState.dryingTimeRange,
      "simulation.duration": parameterState.simulationTime,
      "wafer.arrival_interval": [0, parameterState.arrivalInterval]
    }
  }
  let res = null;
    if (clickedTag.value) {
    name = (experimentOptions.value || []).find(t => t.value === clickedTag.value)?.label;
    param.name = name;
    res = await updateParameterById(clickedTag.value, param);
  } else {
    res = await createParameter(param);
  } 
  if (res) {
    await createRuns({
      domain_key: "etching",
      parameter_set_id: res.id,
      name: name
    });
    getData();
    message.success('保存成功！')
    console.log('保存' + name)
  }
}

const delData = async (id) => {
  await delParameterById(id);
  getData();
  message.success('删除成功！')
  console.log('删除' + id)
}

onMounted(async () => {
  await initializeMap();
  getData()
  if (props.param_key) {
    handleTag(props.param_key)
  }
  
  
  comPos.forEach(item => {
    drawRegionOnBasemap({
      id: item.id,
      points: item.position,
      style: defaultStyle,
      clearExisting: false,
      onComplete: (feature) => {
        feature.set('info', item);
      }
    });
    if (Array.isArray(item.bgImageCoor)) {
      let bgOverlay = [];
      item.bgImageCoor.forEach(coor => {
        const overlay = addImageOverlay({ src: item.bgImage, coordinate: coor, size: item.bgImageSize, opacity: 0 });
        if (overlay) {
          bgOverlay.push(overlay);
        }
      });
      item.bgOverlay = bgOverlay;
    }
  });
});

onBeforeUnmount(() => {
  disposeMap();
});

defineExpose({
  drawRegionOnBasemap,
  addImageOverlay
});
</script>

<style scoped>
.simModeling-container {
  width: 100%;
  height: 100%;
  display: flex;
  border-top: 1px solid #e6e9ef;
}

.simModeling-map {
  flex: 1;
  min-height: 400px;
}

.simModeling-panel {
  width: 360px;
  background: #ffffff;
  border-left: 1px solid #e6e9ef;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  height: 100%;
  overflow: hidden;
}

.simModeling-panel :deep(.ant-tabs-nav) {
  margin: 0;
}

.simModeling-panel :deep(.ant-tabs-content-holder) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.simModeling-panel :deep(.ant-tabs-content) {
  flex: 1;
  height: calc(100vh - 7.5rem);
}

.simModeling-panel :deep(.ant-tabs-tabpane) {
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
}

.panel-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-stack {
  /* padding: 12px; */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-card {
  border-radius: 10px;
}

.panel-card__block {
  margin-left: 20px;
}

.panel-card__tags {
  padding-left: 20px;
  padding-bottom: 10px;
  border-bottom: solid 1px #e6e9ef;
}

.panel-card__tags :deep(.ant-tag) {
  height: 28px;
  line-height: 26px;
  border-radius: 15px;
  cursor: pointer;
}

.tags-selected {
  border: 1px solid rgb(36, 132, 250);
}

.panel-card :deep(.ant-card-head) {
  min-height: 36px;
}

.panel-card :deep(.ant-card-body) {
  padding-top: 12px;
}

.panel-collapse-group,
.panel-sub-collapse {
  background: #fff;
  border-radius: 0;
  border: 0;
  border-top: 1px solid #d9d9d9;
  overflow: hidden;
}

.panel-collapse-group :deep(.ant-collapse-content-box),
.panel-sub-collapse :deep(.ant-collapse-content-box) {
  padding: 15px;
}

.panel-transfer :deep(.ant-collapse-content-box) {
  padding: 0px;
}

.panel-sub-col :deep(.ant-collapse-content-box){
  padding: 15px;
}

.card-header {
  border-left: 2px solid #007BFF;
  font-size: 16px;
  color: #333;
  padding-left: 12px;
  line-height: 18px;
}

.line {
  height: 1px;
  background-color: #D5DBE0;
  margin-bottom: 8px;
}

.panel-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 15px;
}

.panel-field__label {
  color: #1f2a44;
  font-size: 13px;
  width: 100px;
}

.panel-input-number {
  width: 196px;
}

.panel-block {
  margin-bottom: 16px;
}

.panel-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-block__label {
  font-size: 13px;
  color: #4a5775;
}

.panel-hint {
  margin-top: 6px;
  color: #2484FA;
  font-size: 12px;
  margin-left: 120px;
}

.panel-space {
  width: 100%;
}

.panel-module-list {
  border-radius: 10px;
}

.panel-module-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-module-link {
  font-size: 12px;
}

.panel-click-info {
  margin: 8px 15px 0;
  padding: 6px 12px;
  background: #f5f7fb;
  border-radius: 6px;
  color: #4a5775;
  font-size: 12px;
}

.panel-click-info span {
  color: #2484FA;
  font-weight: 600;
}

.overlay-image {
  pointer-events: none;
}
</style>
