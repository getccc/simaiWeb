<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, defineProps, defineEmits  } from 'vue';
import { Row, Col, InputSearch, Table, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Upload, message } from "ant-design-vue";
import { DownOutlined } from '@ant-design/icons-vue';
import itemimg from '@/assets/images/11.png';

import { Login } from "@/stores/user";
import { addWorkFlow, editWorkFlow } from "@/api/workFlow/index.ts";

const props = defineProps<{
  iscreate: string
  projectsList?: any
}>()

const store = Login();
const emit = defineEmits(['updataWorkflow', 'changeIscreate']);

const sendIscreate = (val:any) => {
    emit('changeIscreate', val);
};
// 表单----------------
let formRef = ref();
const formState: UnwrapRef<any> = reactive({
  name: '',
  project_id: [],
  type: [],
  description: '',
});
const rules: any = {
  name: [
    { required: true, message: '请输入名称', trigger: 'blur' },
    { min: 3, max: 50, message: '长度应为3到50', trigger: 'blur' },
  ],
  project_id: [{ required: true, message: '请至少选择一个项目', trigger: 'change' }],
  type: [{ required: true, message: '请至少选择一种类型', trigger: 'change' }],
};

const onSubmit = () => {
  formRef.value.validate().then(() => {
    let formData = toRaw(formState)
    let projectData = (props?.projectsList?.filter((v:any)=>v.id==formData?.project_id) || [])[0] || {}
    let sdata = {
      ...formData,
      org_id: projectData?.org_id,
      creator_id: store.userId,
      format_workflow: {},
      workflow: {}
    }
    addWorkFlow(sdata).then(() => {
      message.success("创建成功");
      sendIscreate('')
      formRef.value.resetFields();
      emit('updataWorkflow')
    }).catch(() => {
      message.error("创建失败");
    });
  })
};
// --------------------

</script>

<template>
    <Modal :visible="iscreate != ''" :title="(iscreate == 'create' ? '新建' : '编辑') + '工作流'"
      @ok="onSubmit" @cancel="sendIscreate('')" ok-text="确定" cancel-text="取消" :keyboard="false" :maskClosable="false">
      <Form ref="formRef" :model="formState" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <Form-item label="名称" name="name">
          <Input v-model:value="formState.name" placeholder="请输入" />
        </Form-item>
        <Form-item label="项目" name="project_id">
          <Select v-model:value="formState.project_id" placeholder="请选择">
            <Select-option v-for="(item, index) in projectsList" :key="index" :value="item.id">{{item.name}}</Select-option>
          </Select>
        </Form-item>
        <Form-item label="类型" name="type">
          <Select v-model:value="formState.type" placeholder="请选择">
            <Select-option value="discharge">放电仿真</Select-option>
          </Select>
        </Form-item>
        <Form-item label="描述" name="description">
          <Textarea v-model:value="formState.description" placeholder="请输入"></Textarea>
        </Form-item>
      </Form>
    </Modal>
</template>

<style scoped>
</style>
