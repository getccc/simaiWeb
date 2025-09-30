<script setup lang="ts">
import { watch, ref, defineProps } from 'vue';
import { Tooltip } from "ant-design-vue";
// import { LGraph, LGraphCanvas, LiteGraph } from "litegraph.js";
import {
  LiteGraph, LGraph, LLink, LGraphNode, LGraphGroup, DragAndScale, LGraphCanvas, ContextMenu, LGraphBadge, CanvasPointer
} from '@comfyorg/litegraph'
import {
    PlusOutlined,
    MinusOutlined,
    ExpandOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
} from '@ant-design/icons-vue';
import selectimg from '@/assets/images/25.png';
import panimg from '@/assets/images/26.png';

defineProps<{
}>()

const read_only:any = ref<any>(false);
const links_render_mode:any = ref<any>(2);

let wind: any = window;
let interval: number | null = null
const repeat = (fun: any) => {
    if (interval) return
    fun()
    interval = window.setInterval(fun, 100)
}
const stopRepeat = () => {
    if (interval) {
        clearInterval(interval)
        interval = null
    }
}

const toolFun = (type: any) => {
    let graph: any = wind['graph'];
    let canvas: any = wind['canvas'];
    let undoStack:any = wind["undoStack"];
    let undoWidge:any = wind["undoWidge"];

    if (type == 'ZoomIn') {
        repeat(() => {
            const ds = canvas.ds
            ds.changeScale(
                ds.scale * 1.1,
                ds.element ? [ds.element.width / 2, ds.element.height / 2] : undefined
            )
            canvas.setDirty(true, true)
        })
    }
    if (type == 'ZoomOut') {
        repeat(() => {
            const ds = canvas.ds
            ds.changeScale(
                ds.scale / 1.1,
                ds.element ? [ds.element.width / 2, ds.element.height / 2] : undefined
            )
            canvas.setDirty(true, true)
        })
    }
    if (type == 'FitView') {
        console.log(graph.serialize())
    }
    if (type == 'panMode') {
        read_only.value = !read_only.value
        canvas.read_only = !canvas.read_only
    }
    if (type == 'lineView') {
        links_render_mode.value = links_render_mode.value == 2 ? 3 : 2
        canvas.links_render_mode = canvas.links_render_mode == 2 ? 3 : 2
        canvas.setDirty(true, true)
    }

    if(type == 'undoDemo') {
        if (undoStack.length > 0) {
            undoStack.pop();
            graph.clear();  // 清空当前图

            if(undoStack.length > 0){
                wind['isundo'] = true
                let serializedGraph = undoStack[undoStack.length-1]
                // graph.links = serializedGraph.links
                // widgets
                // 手动恢复节点
                serializedGraph.nodes.forEach((nodeData:any) => {
                    const node:any = LiteGraph.createNode(nodeData.type);
                    // 恢复节点的其他属性
                    Object.keys(nodeData).forEach((key:any) => {
                        if (key !== "type") {
                            node[key] = nodeData[key];
                        }
                    });
                    if(undoWidge.findIndex((v:any)=>v.id==node.id)!=-1){
                        // 恢复节点的小部件信息
                        let nodeWidge:any = undoWidge[undoWidge.findIndex((v:any)=>v.id==node.id)]
                        Object.keys(nodeWidge).forEach((key:any) => {
                            if (key !== "id") {
                                node[key] = nodeWidge[key];
                            }
                        });
                    }
                    graph.add(node);
                });

                // 手动恢复连接
                // serializedGraph.links.forEach((linkData:any) => {
                //     const originNode = graph.getNodeById(linkData[1]);  // 获取起始节点 ID
                //     const targetNode = graph.getNodeById(linkData[3]);  // 获取目标节点 ID

                //     // 确保节点存在
                //     console.log(originNode , targetNode)
                //     if (originNode && targetNode) {
                //         // 恢复连接
                //         graph.connect(
                //             originNode, linkData[2],  // 起始节点和槽索引
                //             targetNode, linkData[4]   // 目标节点和槽索引
                //         );
                //     } else {
                //         console.error("无法找到连接的节点", linkData[0], linkData[2]);
                //     }
                // });

                wind['isundo'] = false
            }
            let graphState:any = graph.serialize();
            // console.log(undoStack)
            console.log(graph)
            console.log(graphState)
            // graph.deserialize(undoStack[undoStack.length-1]);
            // graph.configure(serializedGraph);  // 恢复撤回的状态
        }
    }
}
</script>

<template>
    <div class="tool_box">
        <Tooltip placement="left"><template #title>放大</template>
            <div @mousedown="toolFun('ZoomIn')" @mouseup="stopRepeat">
                <PlusOutlined class="tool_icon" />
            </div>
        </Tooltip>
        <Tooltip placement="left"><template #title>缩小</template>
            <div @mousedown="toolFun('ZoomOut')" @mouseup="stopRepeat">
                <MinusOutlined class="tool_icon" />
            </div>
        </Tooltip>
        <Tooltip placement="left"><template #title>适应视图</template>
            <div @click="toolFun('FitView')">
                <ExpandOutlined class="tool_icon" />
            </div>
        </Tooltip>
        <Tooltip placement="left"><template #title>{{ read_only ? '平移模式' : '选择模式' }}</template>
            <div @click="toolFun('panMode')">
                <img :src="read_only ? panimg : selectimg " class="tool_img">
            </div>
        </Tooltip>
        <Tooltip placement="left"><template #title>切换连线可见性</template>
            <div @click="toolFun('lineView')">
                <EyeOutlined v-if="links_render_mode==2" class="tool_icon" />
                <EyeInvisibleOutlined v-else class="tool_icon" />
            </div>
        </Tooltip>
    </div>
</template>

<style scoped>
.tool_box {
    position: absolute;
    bottom: 9.6rem;
    right: 5rem;
    z-index: 10;
    background: #fff;
    box-shadow: 0 0.14rem 0.8rem 0 rgba(0, 0, 0, 0.2);
    border-radius: 0.28rem;
}

.tool_icon {
    font-size: 1.2rem;
}
.tool_img{
    width: 1.3rem;
    height: 1.3rem;
    -webkit-user-drag: none;
    user-select: none;
}

.tool_box>div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.85rem;
    height: 2.85rem;
    cursor: pointer;
}
</style>
