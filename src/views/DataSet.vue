<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw } from 'vue';
import { Row, Col, Tooltip, Table, InputSearch, Progress, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Dropdown, message } from "ant-design-vue";
import {
  DownOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  ClockCircleOutlined,
  FolderOpenOutlined,
  StarOutlined,
  LoadingOutlined,
  AppstoreOutlined,
  BarsOutlined,
  ReadOutlined,
} from '@ant-design/icons-vue';
import imga from '@/assets/images/14.png';

let listType = ref<string>('myfiles');

let dataSource = ref<any>([
    { key: '1', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '2', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '3', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '4', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '5', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '6', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '7', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '8', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '9', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '10', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '11', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '12', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '13', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '14', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '15', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '16', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '17', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '18', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '19', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '20', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '21', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '22', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '23', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '24', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '25', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '26', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '27', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '28', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '29', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
    { key: '30', name: '等离子体刻蚀设备仿真', format: 'csv', size: '36.1kb', lastmodified: '2021-05-22', public: '是的', owner: '周博士' },
]);

const columns = [
    { title: '仿真名称', key: 'name', dataIndex: 'name', width: '25%', ellipsis: true },
    { title: '格式', key: 'format', dataIndex: 'format', width: '10%', ellipsis: true },
    { title: '尺寸', key: 'size', dataIndex: 'size', width: '14%', ellipsis: true },
    { title: '上次修改时间', key: 'lastmodified', dataIndex: 'lastmodified', width: '15%', ellipsis: true },
    { title: '公共', key: 'public', dataIndex: 'public', width: '10%', ellipsis: true },
    { title: '所有者', key: 'owner', dataIndex: 'owner', width: '10%', ellipsis: true },
    { title: '操作', key: 'action', width: '16%' }
]

</script>

<template>
  <div class="header_box">
    <div>
      <div>数据集</div>
      <div class="header_text">
        <div>Parameterized water tank</div>
        <div>GPU 1</div>
      </div>
    </div>
  </div>

  <div class="cont_box">
    <div class="left_box">
        <div>
            <div>
                <Button class="create_btn">
                    <PlusOutlined class="create_btn_icon" />
                    <div class="create_btn_test">创建数据集</div>
                </Button>
            </div>
            <div class="left_catalog">
                <div :class="[listType=='myfiles'&&'left_catalog_ac']" @click="()=>listType='myfiles'"><FolderOpenOutlined class="left_catalog_icon" />我的文件</div>
                <div :class="[listType=='recently'&&'left_catalog_ac']" @click="()=>listType='recently'"><ClockCircleOutlined class="left_catalog_icon" />最近的</div>
                <div :class="[listType=='asterisk'&&'left_catalog_ac']" @click="()=>listType='asterisk'"><StarOutlined class="left_catalog_icon" />已加星标</div>
                <div :class="[listType=='deleted'&&'left_catalog_ac']" @click="()=>listType='deleted'"><DeleteOutlined class="left_catalog_icon" />已删除文件</div>
            </div>
        </div>
        <div class="left_bottom">
            <div>储存</div>
            <div><Progress :percent="56" strokeColor="#2484FA" :showInfo="false" class="progress_view"></Progress></div>
            <div>已使用36.3kB(0.0%), 共50GB</div>
        </div>
    </div>

    <div class="right_box">
        <div class="table_box">
            <Table :dataSource="dataSource" :columns="columns" :pagination="{pageSize: 20}">
                <template v-slot:bodyCell="{ record, column }">
                    <template v-if="column.key === 'action'">
                        <Tooltip><template #title>编辑</template><Button type="text" class="btn_view"><EditOutlined class="item_action_list_icon" /></Button></Tooltip>
                        <Tooltip><template #title>复制</template><Button type="text" class="btn_view"><CopyOutlined class="item_action_list_icon" /></Button></Tooltip>
                        <Tooltip><template #title>删除</template><Button type="text" class="btn_view"><DeleteOutlined class="item_action_list_icon" /></Button></Tooltip>
                        <Tooltip><template #title>案例</template><Button type="text" class="btn_view"><ReadOutlined class="item_action_list_icon" /></Button></Tooltip>
                    </template>
                </template>
            </Table>
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
.header_text{
    display: flex;
    align-items: center;
}
.header_text>div:nth-child(1){
    margin-right: 0.71rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 13.42rem;
    height: 2.28rem;
    font-size: 1rem;
    color: #2484FA;
    background: #E3EEFB;
    border-radius: 0.28rem;
}
.header_text>div:nth-child(2){
    font-size: 1rem;
    color: #666;
}

.cont_box{
    margin: 0 2.14rem 2.14rem;
    height: calc(100% - 8.14rem);
    display: flex;
}

.left_box{
    margin-right: 2.14rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 23.57rem;
    height: 100%;
    background: #fff;
    border-radius: 0.28rem;
    user-select: none;
}

.right_box{
    flex: 1;
    height: 100%;
    background: #fff;
    border-radius: 0.28rem;
}

.create_btn {
  margin: 1.42rem 1.42rem 1.42rem 1.42rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 9.57rem;
  height: 2.28rem;
  line-height: 2.28rem;
  background: linear-gradient( 90deg, #245CF8 0%, #23ABFB 100%);
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

.left_catalog{
    margin: 0 1.42rem;
}
.left_catalog>div{
    margin-bottom: 0.14rem;
    padding: 0 1.42rem;
    display: flex;
    align-items: center;
    height: 2.71rem;
    font-size: 1rem;
    color: #1A1A1A;
    border-radius: 0.28rem;
    cursor: pointer;
}
.left_catalog>div:hover{
    color: #3f95ff !important;
    background: #f1f6fd !important;
}
.left_catalog_icon{
    margin-right: 0.71rem;
    font-size: 1.14rem;
}
.left_catalog_ac{
    color: #2484FA !important;
    background: #e7f2ff !important;
}

.left_bottom{
    margin: 0 1.42rem;
    padding: 1.42rem 0;
    border-top: 0.07rem solid #D5DBE0;
}
.left_bottom>div:nth-child(1){
    font-size: 1rem;
    color: #333;
}
.progress_view{
    margin: 0.14rem 0 0;
}
.left_bottom>div:nth-child(3){
    font-size: 0.85rem;
    color: #999;
}

.table_box{
    margin: 0.28rem 2.14rem 0;
    height: 100%;
    background: #fff;
}
::v-deep .ant-table{
    height: calc(100vh - 18rem);
    font-size: 1rem;
    color: #333;
    overflow-y: auto;
}
::v-deep .ant-table-thead >tr>th{
    background: #fff;
    font-weight: 500;
    color: #666;
}
::v-deep .ant-table-cell::before{
    background-color: #fff !important;
}

.item_action_list_icon{
    font-size: 1rem;
    color: #666;
}
.btn_view{
    padding: 0 0.54rem
}
</style>