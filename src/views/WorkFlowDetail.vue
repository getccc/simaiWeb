<template>
  <div class="page_box">
    <!-- <div class="header_view">
      <div class="header_left">
        <div @click="() => (typeVal = 'visualization')" :class="['header_radio_item', typeVal == 'visualization' && 'header_left_ac',]" >可视化</div>
        <div @click="() => (typeVal = 'editnode')" :class="['header_radio_item', typeVal == 'editnode' && 'header_left_ac',]" >节点编辑</div>
        <div @click="() => (typeVal = 'config')" :class="['header_radio_item', typeVal == 'config' && 'header_left_ac',]" >配置</div>
      </div>
      <div>
        <Tooltip placement="bottom"
          ><template #title>训练</template>
          <div @click="performTraining">
            <img :src="imga" class="image_view" /></div
        ></Tooltip>
      </div>
    </div> -->
    <div class="cont_box" @mousemove="handleMouseMove">
      <!-- <litegraphNode
        v-if="typeVal === 'editnode'"
        :nodeData="toRaw(nodeData)"
        :nodeRawData="toRaw(nodeRawData)"
      /> -->
      <simModeling v-if="store.menuName === 'simModeling'" />
      <simAnalysis v-if="store.menuName === 'simAnalysis'" />
      <threeDSim   v-if="store.menuName === '3DSim'" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, onMounted } from "vue";
import { Row, Col, Menu, MenuItem, Button, message, Tooltip, RadioGroup, RadioButton, } from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";
import litegraphNode from "@/components/litegraphNode/index.vue";
import { LGraphCanvas, LGraph, LGraphNode, LiteGraph, LGraphEventMode, } from "@comfyorg/litegraph";
import { registerNodeDef, transformOutputSpec, ComfyInputsSpec, buildTree, } from "@/utils/registerNode";
import imga from "@/assets/images/17.png";
import simModeling from "@/components/etching/simModeling.vue";
import simAnalysis from "@/components/etching/simAnalysis.vue";
import threeDSim from "@/components/etching/threeDSim.vue";
import { getNodeLibrary, postPrompt } from "@/api/litegraph/index";
import { graphToPrompt } from "@/utils/pomptUitl";
import { Etch } from '@/stores/etch';

const route = useRoute();
const store = Etch()

let wind: any = window;

let typeVal = ref<string>("visualization");
let nodeData = ref<any>(null);
let nodeRawData = ref<any>(null);
let nodeRecords = ref<any>([])

const getLGraphNode = async () => {
  let res = await getNodeLibrary();
  if (res) {
    nodeRawData.value = Object.values(res);
    let nodeDefs: any = Object.values(res);
    for (let i = 0; i < nodeDefs.length; i++) {
      let n: any = nodeDefs[i];
      n.nodePath = (n.category ? n.category + "/" : "") + n.name;
      n.deprecated = n.deprecated ?? n.category === "";
      n.experimental = n.experimental ?? n.category.startsWith("_for_testing");
      n.inputs = new ComfyInputsSpec(n.input ?? {});
      n.outputs = transformOutputSpec(n);
      // 注册节点信息
      registerNodeDef(n.name, n);
    }
    // 反向编译
    wind["graph"].configure(JSON.parse(route.query.json as any))
    nodeData.value = buildTree(nodeDefs, (n: any) => n?.nodePath?.split("/"));
  }
};

const monitoringAction = () => {
  let graph = wind["graph"] || {}
  let nr:any = toRaw(nodeRecords.value)

  wind.addEventListener('keyup', (e:any) => {
    if(e.key=='Backspace'){
      if(graph?.nodes?.filter((v:any)=>v.selected==true).length>0){
        // 删除当前选中节点
        graph.remove(graph?.nodes[graph?.nodes?.findIndex((v:any)=>v.selected==true)]);
      }
    }
    if(e.ctrlKey&&(e.key=='z'||e.key=='Z')){
      console.log('Z')
      console.log(nr)
    }
  })
}

const handleMouseMove = (e:any) => {
  let graph = wind["graph"] || {}
  if(graph){
    let nr:any = toRaw(nodeRecords.value)
    if(nr.length<=0){
      nodeRecords.value.push(graph.serialize())
    }else{
      if(JSON.stringify(nr[nr.length-1])!=JSON.stringify(graph.serialize())) nodeRecords.value.push(graph.serialize())
    }
  }
}

onMounted(() => {
  store.saveSimName('etch')
  wind["graph"] = new LGraph();
  // 获取节点库数据
  getLGraphNode();
  // 监控行动-绑定删除事件和撤回事件
  monitoringAction()
});

// 执行训练
const performTraining = async () => {
  let list: any = wind["graph"];
  // console.log(list, "工作流");
  let res = await graphToPrompt(list);
  // console.log(res, "工作流");
  let obj = {
    apply_id: route.query.id,
    client_id: "066c15b0e02242c5ae29397e4dd90947",
    extra_data: {
      extra_pnginfo: {
        format_workflow: res.workflow,
        workflow: wind["graph"].serialize()
      },
    },
    prompt: res.output,
  };
  // console.log(obj);
  postPrompt(obj).then((res: any) => {
    message.success(res.prompt_id);
  });
};
</script>
<style scoped>
.page_box {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.cont_box {
  flex: 1;
  overflow-y: auto;
}
.header_view {
  height: 2.57rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f0f2f5;
  user-select: none;
}
.header_view > div:nth-child(2) {
  flex: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  border-bottom: 0.07rem solid #d5dbe0;
}
.header_left {
  display: flex;
  align-items: center;
}
.header_left > div {
  width: 5.85rem;
  height: 2.57rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: #1a1a1a;
  border-top: 0.14rem solid #f0f2f5;
  border-bottom: 0.14rem solid #d5dbe0;
  border-right: 0.14rem solid #d5dbe0;
  cursor: pointer;
}
.header_left_ac {
  color: #2484fa !important;
  background: #fff;
  border-top: 0.14rem solid #2484fa !important;
  border-bottom: 0.14rem solid #fff !important;
}
.header_view > div:nth-child(2) > div {
  margin-right: 1.42rem;
  width: 1.14rem;
  height: 1.14rem;
  cursor: pointer;
}
</style>