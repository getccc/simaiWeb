<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw } from 'vue';
import { Row, Col, InputSearch, Dropdown, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Upload, message } from "ant-design-vue";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    AppstoreOutlined
} from '@ant-design/icons-vue';
import itemimg from '@/assets/images/11.png';

let searchVal = ref<string>('');

const onSearch = (searchValue: string) => {
  // console.log('use value', searchValue);
};

</script>

<template>
  <div class="header_box">
    <div>
      <div>仿真工作室</div>
      <div>
        <InputSearch v-model:value="searchVal" placeholder="搜索仿真" enter-button="搜索" @search="onSearch"
          class="search_input" />
      </div>
    </div>
    <div>
        <Button class="create_btn">
            <PlusOutlined class="create_btn_icon" />
            <div class="create_btn_test">新建</div>
        </Button>
    </div>
  </div>

  <div class="content_box">
    <div class="item_box">
      <Button class="create_btn item_btn">
        <PlusOutlined class="item_btn_icon" />
        <div class="item_btn_text">新建</div>
      </Button>
    </div>
    <!--  -->
  <div v-for="(item, index) in 26" :key="index">
      <div class="item_box" @click.prevent>
        <div class="item_image" :style="{ backgroundImage: 'url(' + itemimg + ')' }"></div>
        <div class="item_cont">
          <div>溅射靶材原子模拟</div>
          <div></div>
        </div>
      </div>
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
