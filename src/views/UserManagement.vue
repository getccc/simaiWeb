<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, computed, onMounted } from "vue";
import UserListView from "@/views/comps/UserListView.vue";
import RoleListView from "@/views/comps/RoleListView.vue";
import OrganizationView from "@/views/comps/OrganizationView.vue";
import AddView from "./comps/AddView.vue";
import {
  Avatar,
  Row,
  Col,
  InputSearch,
  Dropdown,
  Menu,
  MenuItem,
  Button,
  Modal,
  message,
  Table,
  RadioGroup,
  RadioButton,
  Drawer,
} from "ant-design-vue";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
} from "@ant-design/icons-vue";

const management = ref("user");
const currentComponent = computed(() => {
  return management.value === "user"
    ? UserListView
    : management.value === "role"
    ? RoleListView
    : management.value === "organization"
    ? OrganizationView
    : UserListView;
});
const openType = ref("");
const isOpen = ref(false);
const openAddModal = () => {
  isOpen.value = true;
  openType.value = "add";
};
const closeAddModal = () => {
  isOpen.value = false;
};
</script>

<template>
  <div class="header_box">
    <div>
      <div>用户管理</div>
      <div class="rule_list">
        <RadioGroup v-model:value="management">
          <RadioButton value="user">用户列表</RadioButton>
          <RadioButton value="role">角色列表</RadioButton>
          <RadioButton value="organization">组织列表</RadioButton>
        </RadioGroup>
      </div>
    </div>
    <div>
      <Button class="create_btn" @click="openAddModal">
        <PlusOutlined class="create_btn_icon" />
        <div class="create_btn_test">
          新建{{
            management == "user"
              ? "用户"
              : management == "role"
              ? "角色"
              : management == "organization"
              ? "组织"
              : "用户"
          }}
        </div>
      </Button>
    </div>
  </div>

  <div class="table_box">
    <component :is="currentComponent" :isOpen="isOpen"></component>
  </div>
  <!-- 新建 -->
  <div>
    <!-- <Drawer
      :width="500"
      title="Basic Drawer"
      :open="isOpen"
      @close="closeAddModal"
      :closable="false"
    ></Drawer> -->
    <AddView
      :isOpen="isOpen"
      :closeAddModal="closeAddModal"
      :management="management"
      :openType="openType"
    ></AddView>
  </div>
</template>

<style scoped lang="less">
.header_box {
  padding: 1.57rem 2.14rem 1.66rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header_box > div {
  display: flex;
  align-items: center;
}

.header_box > div:nth-child(1) > div:nth-child(1) {
  margin-right: 1.42rem;
  font-size: 1.42rem;
  color: #1a1a1a;
  user-select: none;
}

.create_btn {
  margin-left: 2.14rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6.57rem;
  height: 2.28rem;
  line-height: 2.28rem;
  background: #2484fa;
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
  margin-right: 0.36rem;
  color: #fff;
}

.table_box {
  margin: 0 2.14rem 1.66rem;
  padding: 2.14rem 2.14rem;
  height: calc(100% - 8.57rem);
  background: #fff;
}
::v-deep .ant-table {
  height: calc(100vh - 21rem);
  overflow-y: auto;
}

.avatar_box {
  width: 2rem;
  height: 2rem;
  background: #ddd;
  cursor: pointer;
}

.btn_view {
  margin-right: 1.57rem;
  padding: 0 0.64rem;
}
.rule_list {
  :deep(.ant-radio-button-wrapper) {
    border: 1px solid #0063ff; /* 覆盖 Ant Design 默认边框颜色 */
  }
  :deep(.ant-radio-button-wrapper-checked) {
    background-color: #0062ff;
    color: white;
  }
}
</style>
