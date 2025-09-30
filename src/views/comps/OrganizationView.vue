<template>
  <div class="content-box">
    <Table
      class="table-box"
      :columns="UserColumns"
      :data-source="UserData"
      :scroll="{ y: 580 }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <Button
            type="text"
            class="btn_view"
            @click.stop="editOrganiza(record.key)"
            ><EditOutlined class="item_action_icon" />编辑</Button
          >
          <Button
            type="text"
            class="btn_view"
            @click.stop="openIsdel(record.key)"
            ><DeleteOutlined class="item_action_icon" />删除</Button
          >
          <Button type="text" class="btn_view"
            ><UnlockOutlined class="item_action_icon" />授权</Button
          >
        </template>
      </template>
    </Table>
    <AddView
      :isOpen="isOpen"
      :closeAddModal="closeAddModal"
      :management="'organization'"
      :openType="openType"
      :editData="editData"
    ></AddView>
    <DelView
      :isdelete="isdelete"
      :close="close"
      :management="'organization'"
      :delData="editData"
      :updateList="updateList"
    ></DelView>
  </div>
</template>
<style scoped lang="less">
</style>
<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, onMounted, watch } from "vue";
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
} from "ant-design-vue";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  UnlockOutlined,
} from "@ant-design/icons-vue";
import itemimg from "@/assets/images/11.png";
import { getOrganizationsList } from "@/api/userManagement/index";
import AddView from "./AddView.vue";
import DelView from "./DelView.vue";
const props = defineProps<{
  isOpen: boolean;
}>();
const UserColumns = [
  {
    title: "组织编号",
    dataIndex: "organizationNumber",
    key: "organizationNumber",
  },
  { title: "组织名称", dataIndex: "organizationName", key: "organizationName" },
  { title: "创建时间", dataIndex: "creationTime", key: "creationTime" },
  {
    title: "描述",
    dataIndex: "described",
    key: "described",
    width: "30%",
    ellipsis: true,
  },
  { title: "操作", key: "action", width: "30%" },
];
let UserData = ref<any>([
  // {
  //   key: 0,
  //   organizationNumber: "organization1",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 1,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 2,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 3,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 4,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 5,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 6,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 7,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 8,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 9,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
  // {
  //   key: 10,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  // },
]);
const updateList = () => {
  getOrganizationsList().then((res: any) => {
    const arr: any = [];
    // console.log(res["data "]);
    let data = res.data ?? res["data "];

    data.forEach((val: any) => {
      arr.push({
        key: val,
        organizationNumber: val.id,
        organizationName: val.organization_name,
        creationTime: new Date(val.created_at).toLocaleString(),
        described: val.description,
      });
    });
    UserData.value = arr;
    // console.log(UserData.value, "5555");
  });
};
// 编辑组织
const isOpen = ref(false);
const openType = ref("");
const editData: any = ref();
const editOrganiza = (record: any) => {
  console.log(record, "组织信息");
  editData.value = record;
  isOpen.value = true;
  openType.value = "edit";
};
const closeAddModal = () => {
  isOpen.value = false;
};

// 删除组织
const isdelete = ref(false);
const openIsdel = (record: any) => {
  console.log(record, "组织信息");
  editData.value = record;
  isdelete.value = true;
};
const close = () => {
  isdelete.value = false;
};
onMounted(() => {
  updateList();
});
watch(
  () => props.isOpen,
  async (newValue: any) => {
    if (!newValue) {
      updateList();
    }
  },
  { immediate: true }
);
watch(
  () => isOpen.value,
  async (newValue: any) => {
    if (!newValue) {
      updateList();
    }
  },
  { immediate: true }
);
</script>
<style lang="less" scoped>
.content-box {
  ::-webkit-scrollbar {
    display: none;
  }
  .table-box {
    height: 100%;
    // background-color: saddlebrown;
  }
}
</style>