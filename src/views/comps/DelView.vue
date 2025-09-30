<template>
  <div>
    <Modal
      v-model:open="isOpen"
      :after-close="cancel"
      centered
      width="500px"
      :inert="!isdelete"
      :title="`删除${
        management === 'user' ? '用户' : management === 'role' ? '角色' : '组织'
      }`"
    >
      <template #footer>
        <Button key="back" @click="hendleClose">取消</Button>
        <Button key="submit" type="primary" @click="isDel">确定</Button>
      </template>
      <div>
        <div style="font-size: 2.14rem; font-weight: 500">
          确定要删除{{
            management === "user"
              ? "用户"
              : management === "role"
              ? "角色"
              : "组织"
          }}{{ delData.organization_name }}吗？
        </div>
        <div>请注意：删除后数据不可恢复</div>
      </div>
    </Modal>
  </div>
</template>
<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, onMounted, watch } from "vue";
import { Button, Modal, message } from "ant-design-vue";
import { deleteOrganization } from "@/api/userManagement/index";
const props = defineProps<{
  isdelete: boolean;
  close: () => void;
  management: string; // 类型 user/role/organization
  delData: any; // 要删除的信息
  updateList: () => void;
}>();
const emit = defineEmits<{
  (e: "close"): void;
}>();
const isOpen = ref(false);
const cancel = () => {
  props.close();
};
const hendleClose = () => {
  props.close();
};
const isDel = () => {
  if (props.management == "organization") {
    let id = props.delData.id;
    deleteOrganization(id)
      .then(() => {
        message.success("删除成功");
        props.close();
        props.updateList();
      })
      .catch((error: any) => {
        message.error("删除失败");
      });
  }
};
watch(
  () => props.isdelete,
  (newValue: any) => {
    isOpen.value = newValue;
  }
);
</script>
<style lang="less" scoped>
</style>