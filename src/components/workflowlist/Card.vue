<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, defineProps, defineEmits } from 'vue';
import { Row, Col, InputSearch, Dropdown, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Upload, message } from "ant-design-vue";
import { PlusOutlined } from '@ant-design/icons-vue';
import itemimg from '@/assets/images/10.png';
import CreateModal from '@/components/workflowlist/CreateWorkFlowModal.vue';
import ListBtn from '@/components/workflowlist/ListBtn.vue';

defineProps<{
  workFlowList: any
}>()

const emit = defineEmits(['updataWorkflow', 'changeIscreate']);

</script>

<template>
  <div class="content_box">
    <div class="item_box">
      <Button class="create_btn item_btn" @click="emit('changeIscreate', 'create')">
        <PlusOutlined class="item_btn_icon" />
        <div class="item_btn_text">新建</div>
      </Button>
    </div>
    <!--  -->
    <div v-for="(item, index) in workFlowList" :key="index">
      <div class="item_box" @click.prevent>
        <ListBtn list-type="card" :item="toRaw(item)" @updata-workflow="()=>emit('updataWorkflow')" />
        <!-- <div class="item_image" :style="{ backgroundImage: 'url(' + itemimg + ')' }">
          <div class="item_hover_box">
              <div>
                  <div>3</div> <div>构建仿真</div>
              </div>
              <div>
                  <div>4</div> <div>仿真训练</div>
              </div>
              <div>
                  <div>1</div> <div>运行仿真</div>
              </div>
          </div>
        </div> -->
        <div class="item_cont">
          <div>{{ item.name }}</div>
          <div>{{ item.description }}</div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.create_btn {
  margin-left: 2.14rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6.57rem;
  height: 2.28rem;
  line-height: 2.28rem;
  background: #2484FA;
  border: 0;
  border-radius: 100rem;
}

.create_btn_icon {
  margin-right: 0.42rem;
  font-size: 1rem;
  color: #fff;
}

.create_btn_test {
  font-size: 1rem;
  color: #fff;
}
.content_box {
  margin: 0 0 0 2.14rem;
  display: flex;
  flex-wrap: wrap;
}

.item_box {
  margin: 0 2.14rem 2.85rem 0;
  width: 16.14rem;
  height: 19rem;
  background: #fff;
  border-radius: 0.28rem;
  border: 0.071rem solid #D5DBE0;
  display: flex;
  flex-direction: column;
  user-select: none;
  cursor: pointer;
}
.item_box:hover{
    box-shadow: 0 0.14rem 0.8rem 0 rgba(0,0,0,0.15);
}

.item_image {
  width: 100%;
  height: 12rem;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
}

.item_cont {
  padding: 0.82rem 0.85rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item_cont>div:nth-child(1) {
  font-size: 1.14rem;
  font-weight: 600;
  color: #1A1A1A;
}

.item_cont>div:nth-child(2) {
  font-size: 1rem;
  color: #333;
  height: 3.14rem;
  line-height: 1.57rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.item_btn {
  margin: 8.35rem auto 0;
  background: #fff !important;
  border: 0.07rem solid #D5DBE0;
}

.item_btn_icon {
  margin-right: 0.34rem;
  color: #666 !important;
}

.item_btn_text {
  color: #666 !important;
}

.item_hover_box{
    opacity: 0;
    transition: all .3s;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(0.9rem);
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.item_box:hover .item_hover_box  {
    opacity: 1;
}
.item_hover_box>div{
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.item_hover_box>div>div:nth-child(1){
    font-size: 1.42rem;
}
.item_hover_box>div>div:nth-child(2){
    font-size: 1rem;
    color: #333;
}
.item_hover_box>div:nth-child(1)>div:nth-child(1){
    color: #0CC7D8;
}
.item_hover_box>div:nth-child(2)>div:nth-child(1){
    color: #2484FA;
}
.item_hover_box>div:nth-child(3)>div:nth-child(1){
    color: #FF38A0;
}
</style>
