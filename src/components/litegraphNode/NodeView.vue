<template>
  <div>
    <Drawer
      :width="640"
      :title="nodedata?.title"
      :open="isOpen"
      @close="closeModal"
      :closable="false"
    >
      <template #extra>
        <CloseOutlined style="cursor: pointer" @click="closeModal" />
      </template>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; width: 100%">
          <Button style="margin-right: 8px" @click="closeModal">取消</Button>
          <Button type="primary" @click="onSubmit">确定</Button>
        </div>
      </template>
      <div>{{ nodedata }}</div>
    </Drawer>
  </div>
</template>
<script setup lang="ts">
import {
  Button,
  Drawer,
  Form,
  FormItem,
  Input,
  InputPassword,
  Select,
  SelectOption,
  Textarea,
  Upload,
  message,
} from "ant-design-vue";
import { CloseOutlined } from "@ant-design/icons-vue";
const props = defineProps<{
  isOpen: boolean;
  nodedata: any;
  closeModal: () => void;
}>();
const emit = defineEmits<{
  (e: "closeModal"): void;
}>();
let wind: any = window;
const onSubmit = () => {
  console.log("nodedata:", props.nodedata);
  let graph = wind["graph"];
  console.log(graph.nodes);
  graph.nodes.forEach((node: any) => {
    if (node.id === props.nodedata.id && node.title === props.nodedata.title) {
      node.widgets[3].name = "rec_res";
      node.widgets[3].value = 970;
      node.widgets.push({
        options: {
          min: 100,
          max: 1000000,
          step: 1000,
          round: 1,
          precision: 0,
        },
        label: "max_steps2",
        name: "max_steps2",
        type: "number",
        value: 1000,
        last_y: 146,
      });
      //   node.widgets[3].hidden = true;
      //   node.widgets.splice(4, 6);
    }
  });
  emit("closeModal");
};
</script>