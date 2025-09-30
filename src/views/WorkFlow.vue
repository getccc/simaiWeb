<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, onMounted } from 'vue';
import { Row, Col, InputSearch, RadioButton, RadioGroup, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Dropdown, message } from "ant-design-vue";
import { DownOutlined,  PlusOutlined, EditOutlined,  DeleteOutlined, LoadingOutlined, AppstoreOutlined, BarsOutlined } from '@ant-design/icons-vue';
import imga from '@/assets/images/14.png';
import imgb from '@/assets/images/15.png';
import imgc from '@/assets/images/16.png';

import workflowCard from '@/components/workflowlist/Card.vue';
import workflowList from '@/components/workflowlist/List.vue';
import CreateModal from '@/components/workflowlist/CreateWorkFlowModal.vue';

import { Login } from "@/stores/user";
import { getProgectList } from "@/api/projects/index.ts";
import { getWorkFlowList } from "@/api/workFlow/index.ts";

let searchVal = ref<string>('');
let listType = ref<string>('card');
let iscreate = ref<string>('');

const onSearch = (searchValue: string) => {
  getWorkFlowFun()
};

const store = Login();
let projectsList: any = ref<any>([]);
let workFlowList: any = ref([
  {
    name: '蚀刻机仿真',
    type: '1',
    project_name: '蚀刻机仿真项目',
    description: '基于蚀刻机的离散事件仿真',
    creator_name: '1',
    created_at: '2025-01-01'
  }
]);

// 获取项目列表
const getProgectFunc = () => {
  let params = { user_id: store.userId };
  getProgectList(params).then((res: any) => {
    projectsList.value = res.data;
  });
};

// 获取工作流列表
const getWorkFlowFun = () => {
  let params:any = {
    project_id: '',
    search_term: searchVal.value
  };
  getWorkFlowList(params).then((res: any) => {
    workFlowList.value = res.data;
  });
};

onMounted(() => {
  getProgectFunc()
  getWorkFlowFun();
});

</script>

<template>
  <div class="header_box">
    <div>
      <div>工作流管理</div>
      <div>
        <InputSearch v-model:value="searchVal" placeholder="搜索工作流" enter-button="搜索" @search="onSearch"
          class="search_input" />
      </div>
    </div>
    <div>
      <div class="header_select">
        <Dropdown trigger="click">
          <div @click.prevent>全部类型
            <DownOutlined class="header_select_icon" />
          </div>
          <template #overlay>
            <Menu>
              <MenuItem>1</MenuItem>
              <MenuItem>2</MenuItem>
            </Menu>
          </template>
        </Dropdown>
      </div>
      <div>
        <RadioGroup v-model:value="listType" button-style="solid" class="header_radio">
            <RadioButton value="card" class="header_radio_item" ><AppstoreOutlined class="header_radio_icon" /></RadioButton>
            <RadioButton value="list" class="header_radio_item"><BarsOutlined class="header_radio_icon" /></RadioButton>
        </RadioGroup>
      </div>
      <div>
        <Button class="create_btn" @click="iscreate = 'create'">
          <PlusOutlined class="create_btn_icon" />
          <div class="create_btn_test">新建</div>
        </Button>
      </div>
    </div>
  </div>

  <div class="number_box">
    <div>
        <div>
            <div>7</div>
            <div>构建仿真</div>
            <div>数据可视化</div>
        </div>
        <div><img :src="imga" class="image_view" /></div>
    </div>
    <div>
        <div>
            <div>15</div>
            <div>仿真训练</div>
            <div>工业数字孪生</div>
        </div>
        <div><img :src="imgb" class="image_view" /></div>
    </div>
    <div>
        <div>
            <div>23</div>
            <div>运行仿真</div>
            <div>工业组态</div>
        </div>
        <div><img :src="imgc" class="image_view" /></div>
    </div>
  </div>

  <workflowCard v-if="listType=='card'" :workFlowList="workFlowList" @updata-workflow="()=>getWorkFlowFun()" @change-iscreate="(e:any)=>iscreate = e" />
  <workflowList v-if="listType=='list'" :workFlowList="workFlowList" @updata-workflow="()=>getWorkFlowFun()" />

  <CreateModal :iscreate="iscreate" :projectsList="toRaw(projectsList)" @updata-workflow="()=>getWorkFlowFun()" @change-iscreate="(e:any)=>iscreate = e" />
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

.header_select {
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  user-select: none;
}

.header_select_icon {
  margin-left: 0.42rem;
  font-size: 0.96rem;
  color: #666;
}

.header_radio{
    margin-left: 2.14rem;
}
.header_radio .ant-radio-button-wrapper-checked{
    background: linear-gradient( 90deg, #245CF8 0%, #23ABFB 100%);
}
.header_radio_item{
    padding: 0;
    width: 2.72rem;
    height: 2.28rem;
    line-height: 2.28rem;
    text-align: center;
}
.header_radio_icon{
    font-size: 1.14rem;
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

.number_box{
    margin: 0 2.14rem 1.42rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    user-select: none;
}
.number_box>div{
    margin-left: 2.14rem;
    padding: 0 0 0 1.42rem;
    flex: 1;
    height: 8.71rem;
    background: #fff;
    border-radius: 0.28rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}
.number_box>div:nth-child(1){
    margin-left: 0 !important;
}
.number_box>div>div:nth-child(1){
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 100%;
}
.number_box>div>div:nth-child(1)>div:nth-child(1){
    margin: 0 0 0.46rem;
    font-size: 2rem;
    color: #2484FA;
}
.number_box>div>div:nth-child(1)>div:nth-child(2){
    margin: 0 0 0.14rem;
    font-size: 1rem;
    color: #333;
}
.number_box>div>div:nth-child(1)>div:nth-child(3){
    font-size: 0.85rem;
    color: #999;
}
.number_box>div>div:nth-child(2){
    margin: 0.86rem 0.46rem 0 0;
    width: 6.16rem;
    height: 6.46rem;
}
</style>