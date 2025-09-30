<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, defineProps, defineEmits } from 'vue';
import { Row, Col, InputSearch, Tooltip, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Dropdown, message } from "ant-design-vue";
import { useRouter, useRoute } from 'vue-router';
import { EditOutlined, DeleteOutlined, CopyOutlined, ReadOutlined, } from '@ant-design/icons-vue';
import itemimg from '@/assets/images/09.png';

import { deleteWorkFlow } from "@/api/workFlow/index.ts";

const props = defineProps<{
    listType: any;
    item: any;
}>()

const router = useRouter();
const emit = defineEmits(['updataWorkflow']);

const isDel = ref<any>(false);
const currVal = ref<any>({});

const editFun = ()=>{
    let itData = toRaw(props)
    router.push({path: '/WorkFlow/Detail', query: {id: itData.item.id,json: JSON.stringify(itData.item.workflow)}})
}

const openDelWorkFlowFun = () => {
    let itData = toRaw(props)
    isDel.value = true
    currVal.value = itData.item
}
const delWorkFlowFun = () => {
    let val:any = toRaw(currVal.value)
    deleteWorkFlow(val?.id).then((res: any) => {
        message.success("删除成功");
        isDel.value = false
        currVal.value = {}
        emit('updataWorkflow');
    }).catch(() => {
      message.error("删除失败");
    });
};

</script>

<template>
    <Dropdown v-if="listType=='card'" :trigger="['contextmenu']">
        <div class="item_image" :style="{ backgroundImage: 'url(' + itemimg + ')' }"></div>
        <template #overlay>
            <Menu>
                <MenuItem>
                <div class="item_action" @click="editFun()">
                    <EditOutlined class="item_action_icon" />编辑
                </div>
                </MenuItem>
                <MenuItem>
                <div class="item_action" @click="()=>openDelWorkFlowFun()">
                    <DeleteOutlined class="item_action_icon" />删除
                </div>
                </MenuItem>
                <MenuItem>
                <div class="item_action">
                    <CopyOutlined class="item_action_icon" />复制
                </div>
                </MenuItem>
                <MenuItem>
                <div class="item_action">
                    <ReadOutlined class="item_action_icon" />案例
                </div>
                </MenuItem>
            </Menu>
        </template>
    </Dropdown>
    <template v-if="listType=='list'">
        <Tooltip><template #title>编辑</template><Button type="text" class="btn_view" @click="editFun()"><EditOutlined class="item_action_list_icon" /></Button></Tooltip>
        <Tooltip><template #title>复制</template><Button type="text" class="btn_view"><CopyOutlined class="item_action_list_icon" /></Button></Tooltip>
        <Tooltip><template #title>删除</template><Button type="text" class="btn_view" @click="()=>openDelWorkFlowFun()"><DeleteOutlined class="item_action_list_icon" /></Button></Tooltip>
        <Tooltip><template #title>案例</template><Button type="text" class="btn_view"><ReadOutlined class="item_action_list_icon" /></Button></Tooltip>
    </template>
    
    <Modal v-model:open="isDel" @ok="delWorkFlowFun()" ok-text="确定" cancel-text="取消">
        <div style="margin-top: 1.43rem">确认要删除{{ currVal?.name }}吗？</div>
        <div>删除后数据将不复存在</div>
    </Modal>
</template>

<style scoped>
.item_action {
  width: 7.01rem;
  height: 2.07rem;
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item_action:hover {
  color: #2484FA;
}
.item_action_icon {
  margin-left: -0.78rem;
  margin-right: 0.78rem;
}
.item_action_list_icon{
    font-size: 1rem;
    color: #666;
}

.btn_view{
    padding: 0 0.54rem;
}

.item_image {
  width: 100%;
  height: 12rem;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
}

</style>
