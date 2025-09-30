<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw } from 'vue';
import { Row, Col, InputSearch, Dropdown, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Upload, message } from "ant-design-vue";
import {
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined
} from '@ant-design/icons-vue';
import itemimg from '@/assets/images/10.png';

let searchVal = ref<string>('');

const onSearch = (searchValue: string) => {
  // console.log('use value', searchValue);
};

</script>

<template>
  <div class="header_box">
    <div>
      <div>案例中心</div>
      <div>
        <InputSearch v-model:value="searchVal" placeholder="搜索案例" enter-button="搜索" @search="onSearch"
          class="search_input" />
      </div>
    </div>
  </div>

  <div class="content_box">
    <!--  -->
    <div v-for="(item, index) in 26" :key="index">
      <Dropdown :trigger="['contextmenu']">
        <div class="item_box" @click.prevent>
          <div class="item_image" :style="{ backgroundImage: 'url(' + itemimg + ')' }"></div>
          <div class="item_cont">
            <div>溅射靶材原子模拟</div>
            <div>利用蒙特卡洛方法模拟气体分子的碰撞和输运过程利用蒙特卡洛方法模拟气体分子的碰撞和输运过程</div>
          </div>
        </div>
        <template #overlay>
          <Menu>
            <MenuItem>
            <div class="item_action">
              <AppstoreOutlined class="item_action_icon" />应用
            </div>
            </MenuItem>
            <MenuItem>
            <div class="item_action">
              <EditOutlined class="item_action_icon" />编辑
            </div>
            </MenuItem>
            <MenuItem>
            <div class="item_action">
              <DeleteOutlined class="item_action_icon" />删除
            </div>
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>
    </div>
  </div>
</template>

<style scoped>
.header_box {
  padding: 1.57rem 2.14rem 1.66rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header_box>div {
  display: flex;
  align-items: center;
}

.header_box>div:nth-child(1)>div:nth-child(1) {
  margin-right: 1.42rem;
  font-size: 1.42rem;
  color: #1A1A1A;
  user-select: none;
}

::v-deep .search_input .ant-input-group .ant-input {
  width: 16.71rem;
  height: 2.28rem;
  font-size: 1rem;
  border-radius: 0 !important;
}

::v-deep .search_input .ant-input-group .ant-input-group-addon .ant-input-search-button {
  padding: 0;
  width: 4rem;
  height: 2.28rem;
  line-height: 2.28rem;
  border-radius: 0 !important;
  background: #2484FA;
}

::v-deep .search_input .ant-input-group .ant-input-group-addon .ant-input-search-button span {
  padding: 0;
  height: 2.28rem;
  line-height: 2.28rem;
  font-size: 1rem !important;
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
  line-clamp: 2;
  overflow: hidden;
}

.item_action {
  width: 7.01rem;
  height: 2.07rem;
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item_action_icon {
  margin-left: -0.78rem;
  margin-right: 0.78rem;
}

.item_action:hover {
  color: #2484FA;
}
</style>
