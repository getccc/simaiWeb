<script setup lang="ts">
import dark from "@/assets/palettes/dark.json";
import {
  onMounted,
  onBeforeUnmount,
  ref,
  type UnwrapRef,
  reactive,
  toRaw,
  defineProps,
  watch,
  computed,
} from "vue";
import {
  Row,
  Col,
  InputSearch,
  Table,
  Menu,
  MenuItem,
  Button,
  Modal,
  Form,
  FormItem,
  Input,
  Select,
  SelectOption,
  Textarea,
  Upload,
  message,
  Tooltip,
} from "ant-design-vue";
import {
  PlusOutlined,
  MinusOutlined,
  ExpandOutlined,
  EyeOutlined,
} from "@ant-design/icons-vue";
import canvasControlBar from "@/components/litegraphNode/canvasControlBar.vue";
import litegraphNode from "@/components/litegraphNode/bottomView.vue";
// import canvasSidebar from "@/components/litegraphNode/canvasSidebar.vue";
import SidebarView from "@/components/litegraphNode/SidebarView.vue";

import {
  LiteGraph,
  LGraph,
  LGraphNode,
  LGraphGroup,
  DragAndScale,
  LGraphCanvas,
  ContextMenu,
  LGraphBadge,
  CanvasPointer,
} from "@comfyorg/litegraph";
// import "litegraph.js/css/litegraph.css";
import gridimg from "@/assets/images/22.png";
import { usePragmaticDroppable } from "@/hooks/dndHooks";

import { useKeybindingStore } from "@/stores/keybindingStore";
import NodeView from "./NodeView.vue";
const props = defineProps<{
  nodeData: any;
  nodeRawData: any;
}>();

let wind: any = window;
let graph: any;
let canvas: any = ref<HTMLCanvasElement | null>(null);

// -----------画布大小-------------
const myDiv: any = ref<any>(null);
const mycanvas: any = ref<any>(null);
const width = ref<any>(0);
const height = ref<any>(0);

const getDivSize = () => {
  const width_d = Math.max(window.innerWidth, 2180); // 确保宽度不小于 1920
  const height_d = Math.max(window.innerHeight, 1520); // 确保高度不小于 1080
  if (myDiv.value) {
    // width.value = myDiv.value.offsetWidth;
    // height.value = myDiv.value.offsetHeight;
    width.value = width_d;
    height.value = height_d;
  }
};
// --------------------------------

const setLGraphOnNode = () => {
  wind["undoStack"] = [];
  wind["undoWidge"] = [];

  function saveStateForUndo(node: any) {
    let graphState: any = graph.serialize();

    // 小部件
    let widge: any = {
      id: node.id,
      properties_info: node?.properties_info,
      widget: node?.widget,
      widgets: node?.widgets,
      widgets_up: node?.widgets_up,
      size: node?.size,
      inputs: node?.inputs,
      outputs: node?.outputs,
    };
    if (wind["undoWidge"]?.findIndex((v: any) => v.id == node.id) == -1) {
      wind["undoWidge"]?.push(widge);
    } else {
      wind["undoWidge"][
        graphState?.widgetInfo?.findIndex((v: any) => v.id == node.id)
      ] = widge;
    }

    // 连线
    graphState.links = graph.links;

    wind["undoStack"].push(JSON.parse(JSON.stringify(graphState)));
    // console.log(graph)
  }

  // 监听节点添加事件
  graph.onNodeAdded = function (node: any) {
    if (!wind["isundo"]) saveStateForUndo(node);
  };
  // 监听节点删除事件
  graph.onNodeRemoved = function (node: any) {
    if (!wind["isundo"]) saveStateForUndo(node);
  };
  // console.log(graph)
  graph.onResize = function (node: any) {
    console.log(12);
  };
};

const setLGraphConfig = () => {
  canvas.background_image = gridimg;
  canvas.clear_background_color = "#eee";
  canvas.render_canvas_border = false;
  canvas.connections_width = 2;
  // canvas.node_title_color = "#fff";
  canvas.render_connections_border = false;

  // console.log(canvas);
};

const nodeDataTypes = () => {
  const types = new Set<string>();
  for (let i = 0; i < props.nodeRawData.length; i++) {
    const n = props.nodeRawData[i];
    for (const input of n.inputs.all) {
      types.add(input.type);
    }
    for (const output of n.outputs.all) {
      types.add(output.type);
    }
  }
  return types;
};

const loadColorPalette = () => {
  const linkColorPalette = dark.colors.node_slot;
  const types = Object.fromEntries(
    Array.from(nodeDataTypes()).map((type) => [type, ""])
  );
  Object.assign(
    canvas.default_connection_color_byType,
    types,
    linkColorPalette
  );
  Object.assign(LGraphCanvas.link_type_colors, types, linkColorPalette);
};
const isOpen = ref(false);
const nodedata = ref();
const openModal = (node: any) => {
  isOpen.value = true;
  nodedata.value = node;
};
const closeModal = () => {
  isOpen.value = false;
};
onMounted(async () => {
  wind["canvas"] = new LGraphCanvas(mycanvas.value, wind["graph"]);
  wind["canvasContainer"] = document.querySelector(".graph-canvas-container");
  graph = wind["graph"];
  canvas = wind["canvas"];
  // 设置画布大小
  getDivSize();
  // 设置全局变量
  setLGraphConfig();
  // 设置连线颜色
  loadColorPalette();

  // setLGraphOnNode()

  try {
    useKeybindingStore().loadCoreKeybindings();
  } catch (e) {
    console.error("Failed to init ComfyUI frontend", e);
  }

  graph.onNodeAdded = function (node: any) {
    console.log("新增的节点:", node);
  };
  graph.onNodeRemoved = function (node: any) {
    console.log("删除的节点:", node);
  };
  graph._nodes.forEach(function (node: any) {
    node.onDblClick = function () {
      console.log("双击的节点:", node);
      openModal(node);
      // 你可以在这里添加更多的操作，比如打开侧边栏、显示节点详情等
    };
    // // 为节点的输入槽双击事件绑定处理函数
    // node.onInputDblClick = function () {
    //   console.log("双击的输入槽:", node);
    // };
    // // 为节点的输出槽双击事件绑定处理函数
    // node.onOutputDblClick = function () {
    //   console.log("双击的输出槽:", node);
    // };
    node.onConnectionsChange = function () {
      // 当连接发生变化时处理
      console.log("Connections changed", node);
    };
    node.color = "#00c9da"; // 设置为绿色
    // node.bgcolor = "#ffffff"; // 设置为白色
    // node.onDrawBackground = function (ctx: any) {
    //   // 设置填充颜色
    //   ctx.fillStyle = "#ffffff"; // 白色
    //   ctx.shadowColor = "#ffffff";

    //   // 绘制节点背景
    //   // ctx.fillRect(0, 0, this.size[0], this.size[1]);
    //   // 设置圆角
    //   const radius = 10; // 圆角半径，可以调整

    //   // 开始绘制路径
    //   ctx.beginPath();
    //   // 上边框 - 直线
    //   ctx.moveTo(0, 0);
    //   ctx.lineTo(this.size[0], 0);

    //   // 右边框 - 带圆角
    //   ctx.lineTo(this.size[0], this.size[1] - radius);
    //   ctx.quadraticCurveTo(
    //     this.size[0],
    //     this.size[1],
    //     this.size[0] - radius,
    //     this.size[1]
    //   );

    //   // 下边框 - 带圆角
    //   ctx.lineTo(radius, this.size[1]);
    //   ctx.quadraticCurveTo(0, this.size[1], 0, this.size[1] - radius);

    //   // 左边框 - 带圆角
    //   ctx.moveTo(0, 0);
    //   ctx.lineTo(this.size[0], 0);
    //   // ctx.lineTo(0, radius);
    //   // ctx.quadraticCurveTo(0, 0, radius, 0);

    //   ctx.closePath();

    //   // 填充背景
    //   ctx.fill();

    //   // 设置边框样式
    //   ctx.strokeStyle = "#cccccc"; // 边框颜色
    //   ctx.lineWidth = 1; // 边框宽度

    //   // 绘制边框
    //   ctx.stroke();
    // };
  });
});
</script>

<template>
  <div class="div_view">
    <SidebarView :nodeData="toRaw(nodeData)"></SidebarView>
    <div ref="myDiv" class="div_box graph-canvas-container">
      <!-- <canvasSidebar /> -->
      <canvas
        ref="mycanvas"
        id="graph-canvas"
        :width="width"
        :height="height"
      ></canvas>
      <litegraphNode />
      <canvasControlBar />
    </div>

    <!-- <div style="width: 500px"></div> -->
    <NodeView
      :isOpen="isOpen"
      :closeModal="closeModal"
      :nodedata="nodedata"
    ></NodeView>
  </div>
</template>

<style scoped lang="less">
.div_view {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}
.div_box {
  position: relative;
  flex: 1;
  margin-left: 26.71rem;
  height: 100%;
  overflow: hidden;
}
</style>
