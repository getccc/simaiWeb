<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, defineProps, defineEmits } from 'vue';
import { Row, Col, InputSearch, Table, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Upload, message } from "ant-design-vue";
import { DownOutlined } from '@ant-design/icons-vue';
import ListBtn from '@/components/workflowlist/ListBtn.vue';

defineProps<{
    workFlowList: any
}>()

const emit = defineEmits(['updataWorkflow']);

let dataSource = ref<any>([]);

const columns = [
    { title: '仿真名称', key: 'name', dataIndex: 'name', width: '15%', ellipsis: true },
    { title: '仿真类型', key: 'type', dataIndex: 'type', width: '10%', ellipsis: true },
    { title: '所属项目', key: 'project_name', dataIndex: 'project_name', width: '14%', ellipsis: true },
    { title: '描述信息', key: 'description', dataIndex: 'description', width: '21%', ellipsis: true },
    { title: '创建人', key: 'creator_name', dataIndex: 'creator_name', width: '10%', ellipsis: true },
    { title: '创建时间', key: 'created_at', dataIndex: 'created_at', width: '14%', ellipsis: true },
    { title: '操作', key: 'action', width: '16%' }
]

const getDate = (dateStr:any) => {
    const date = new Date(dateStr);
    // 格式化为 "YYYY-MM-DD HH:mm:ss"
    const formattedDate = date.getFullYear() + '-' 
        + String(date.getMonth() + 1).padStart(2, '0') + '-' 
        + String(date.getDate()).padStart(2, '0') + ' ' 
        + String(date.getHours()).padStart(2, '0') + ':' 
        + String(date.getMinutes()).padStart(2, '0') + ':' 
        + String(date.getSeconds()).padStart(2, '0');
    return formattedDate
}

</script>

<template>
    <div class="table_box">
        <Table :dataSource="workFlowList" :columns="columns" :pageSize="20" :pagination="{pageSize: 20}">
            <template v-slot:bodyCell="{ record, column }">
                <template v-if="column.key === 'created_at'">
                    {{ getDate(record[column.key]) }}
                </template>
                <template v-if="column.key === 'action'">
                    <ListBtn :list-type="'list'" :item="toRaw(record)" @updata-workflow="()=>emit('updataWorkflow')" />
                </template>
            </template>
        </Table>
    </div>
</template>

<style scoped>
.table_box{
    margin: 0 2.14rem 1.66rem;
    padding: 1rem 2.14rem 2.14rem;
    height: calc(100vh - 22.62rem);
    background: #fff;
}
::v-deep .ant-table{
    height: calc(100vh - 28.42rem);
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

</style>
