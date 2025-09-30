<template>
  <div class="sidebar-box">
    <!-- {{ nodeData.children }} -->
    <Input
      v-model:value="searchValue"
      style="margin-bottom: 8px"
      placeholder="Search"
    >
      <template #prefix>
        <img :src="searchimg" class="search_icon" />
      </template>
    </Input>
    <Tree
      :tree-data="gData"
      blockNode
      :expandedKeys="expandedKeys"
      :autoExpandParent="autoExpandParent"
      :selectedKeys="[]"
      @expand="onExpand"
    >
      <template #switcherIcon="{ switcherCls }">
        <DownOutlined :class="[switcherCls, 'catalog_switcher']" />
      </template>
      <template #title="{ leaf, label, children, key, data }">
        <div
          class="catalog_item"
          @click="() => handleClick(key)"
          ref="draggableItem"
          :draggable="leaf"
          @dragstart="onDragStart(data.data)"
          @dragend="onDragEnd"
        >
          <div class="catalog_licon">
            <FolderOutlined v-if="!leaf" class="folder_icon" />
            <div v-else class="catalog_node_icon"></div>
          </div>

          <div v-if="label.indexOf(searchValue) != -1" class="catalog_label">
            {{ label.substring(0, label.indexOf(searchValue)) }}
            <div style="color: #f50">{{ searchValue }}</div>

            <div v-if="!leaf">
              {{
                label.substring(label.indexOf(searchValue) + searchValue.length)
              }}
            </div>
            <div v-else>
              {{
                label.substring(label.indexOf(searchValue) + searchValue.length)
              }}
            </div>
            <div v-if="!leaf" class="catalog_num">
              {{ countLeafNodes({ children }) }}
            </div>
          </div>
          <div v-else class="catalog_label">
            {{ label }}
            <div v-if="!leaf" class="catalog_num">
              {{ countLeafNodes({ children }) }}
            </div>
          </div>
        </div>
      </template>
    </Tree>
    <NodeView
      :isOpen="isOpen"
      :closeModal="closeModal"
      :nodedata="nodedata"
    ></NodeView>
  </div>
</template>
<script setup lang="ts">
import { defineProps, onMounted, reactive, ref, toRaw, watch } from "vue";
import { Input, Tree, type TreeProps } from "ant-design-vue";
import {
  FileOutlined,
  FolderOutlined,
  DownOutlined,
  SearchOutlined,
} from "@ant-design/icons-vue";
import searchimg from "@/assets/images/23.png";
import foldimg from "@/assets/images/24.png";
// import { usePragmaticDraggable, usePragmaticDroppable } from "@/hooks/dndHooks";
// import { LGraph, LGraphCanvas, LiteGraph } from "litegraph.js";
// import "litegraph.js/css/litegraph.css";
import {
  LiteGraph,
  LGraph,
  LLink,
  LGraphNode,
  LGraphGroup,
  DragAndScale,
  LGraphCanvas,
  ContextMenu,
  LGraphBadge,
  CanvasPointer,
} from "@comfyorg/litegraph";
import { convertToLiteGraph } from "@/hooks/nodeInfo";
import NodeView from "./NodeView.vue";
const draggableItem = ref(null);
const props = defineProps<{
  nodeData: any;
}>();

let wind: any = window;
let genData: TreeProps["treeData"] = reactive([]);

const currNode = ref<any>(null); //节点信息
const onDragStart = (event: any) => {
  currNode.value = event;
  // event.dataTransfer.setData("text", event.target.innerText);
  // usePragmaticDraggable(draggableItem.value, {
  //   onDragStart: (e) => {
  //     console.log("Drag started:", e);
  //   },
  // });
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
const mousePosition = ref(); // 存储鼠标位置
const onDragEnd = (event: any) => {
  let graph = wind["graph"];
  let canvas = wind["canvas"];

  const canvasRect = canvas.canvas.getBoundingClientRect();
  const offsetX = event.clientX - canvasRect.left;
  const offsetY = event.clientY - canvasRect.top;
  const scale = canvas.ds.scale; // 获取缩放比例
  const offset = canvas.ds.offset; // 获取画布的位移
  const x = offsetX / scale - offset[0];
  const y = offsetY / scale - offset[1];

  const curnode: any = toRaw(currNode.value);
  const node: any = LiteGraph.createNode(curnode.name, curnode.display_name, {
    pos: [x, y],
  });
  node.color = "#00c9da"; // 设置为绿色
  node.onDblClick = function () {
    console.log("双击的节点:", node);
    openModal(node);
    // 你可以在这里添加更多的操作，比如打开侧边栏、显示节点详情等
  };
  graph.add(node);
};

// --------------------------节点库数据--------------------------
const dataList: TreeProps["treeData"] = [];
const generateList = (data: TreeProps["treeData"] | any) => {
  for (let i = 0; i < data?.length; i++) {
    const node = data[i];
    const key = node.key;
    dataList.push({ key, title: key });
    if (node.children) {
      generateList(node.children);
    }
  }
};
generateList(genData);

const getParentKey = (
  key: string | number,
  tree: TreeProps["treeData"] | any
): string | number | undefined => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some((item: any) => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};
const expandedKeys: any = ref<(string | number)[]>([]);
const searchValue = ref<string>("");
const autoExpandParent = ref<boolean>(true);
const gData = ref<TreeProps["treeData"]>(genData);

const onExpand: any = (keys: string[]) => {
  expandedKeys.value = keys;
  autoExpandParent.value = false;
};
const handleClick = (val: any) => {
  let arr: any = toRaw(expandedKeys.value) || [];
  if (arr.indexOf(val) == -1) {
    arr.push(val);
  } else {
    arr.splice(arr.indexOf(val), 1);
  }
  expandedKeys.value = [...arr];
  autoExpandParent.value = false;
};

const countLeafNodes: any = (node: any) => {
  let leafCount = 0;
  if (node.leaf === true) {
    leafCount += 1;
  }
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach((child: any) => {
      leafCount += countLeafNodes(child);
    });
  }
  return leafCount;
};

watch(searchValue, (value) => {
  // TreeProps["treeData"][number]
  const expanded = dataList
    .map((item: any) => {
      if (item.title.indexOf(value) > -1) {
        return getParentKey(item.key, gData.value);
      }
      return null;
    })
    .filter((item, i, self) => item && self.indexOf(item) === i);

  expandedKeys.value = expanded;
  searchValue.value = value;
  autoExpandParent.value = true;
  if (!searchValue.value.trim()) {
    expandedKeys.value = [];
  }
});
// ------------------------------------------------------------

onMounted(() => {
  gData.value = genData = props?.nodeData?.children;
  generateList(genData);
});
</script>
<style scoped lang="less">
.sidebar-box {
  position: absolute;
  top: 0rem;
  left: 0rem;
  z-index: 11;
  min-width: 26.71rem;
  height: 100%;
  background: #fff;
  padding: 1.42rem;
  overflow-y: auto; /* 仅显示纵向滚动条 */
  overflow-x: hidden; /* 隐藏横向滚动条 */
  box-shadow: 0 0.14rem 0.85rem 0 rgba(0, 0, 0, 0.1);
} /* 美化纵向滚动条 */
.sidebar-box::-webkit-scrollbar {
  width: 0.28rem; /* 设置滚动条宽度 */
}

/* 滚动条轨道（背景） */
.sidebar-box::-webkit-scrollbar-track {
  background: #f1f1f1; /* 设置轨道背景颜色 */
  border-radius: 0.71rem; /* 设置轨道圆角 */
}

/* 滚动条滑块 */
.sidebar-box::-webkit-scrollbar-thumb {
  background: #d6d2d2; /* 设置滑块颜色 */
  border-radius: 0.71rem; /* 设置滑块圆角 */
}

/* 滑块悬停时的样式 */
.sidebar-box::-webkit-scrollbar-thumb:hover {
  background: #ada9a9; /* 设置悬停时的滑块颜色 */
}

.catalog_item {
  width: 100%;
  height: 2.85rem;
  display: flex;
  align-items: center;
}
::v-deep .ant-tree-switcher {
  width: auto !important;
  height: 2.85rem !important;
  display: flex;
  align-items: center;
}
.catalog_switcher {
  margin-right: 0.28rem;
  font-size: 0.85rem !important;
  color: #666 !important;
}
.catalog_licon {
  font-size: 1.42rem;
  color: #666;
  margin-right: 0.42rem;
}
.catalog_label {
  flex: 1;
  display: flex;
  align-items: center;
  font-size: 1.28rem;
  color: #333;
}
.catalog_num {
  margin-left: 0.71rem;
  width: 1.71rem;
  height: 1.71rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100rem;
  font-size: 0.75rem;
  color: #333;
  background: #f1f1f1;
}
.catalog_node_icon {
  margin-right: 0.28rem;
  width: 1.14rem;
  height: 1.14rem;
  border-radius: 100rem;
  background: #ddd;
}
.search_icon {
  margin-right: 0.28rem;
  width: 1.14rem;
  height: 1.14rem;
  -webkit-user-drag: none;
  user-select: none;
}
.folder_icon {
  margin-right: 0.28rem;
  font-size: 1.28rem;
  color: #777;
}
</style>