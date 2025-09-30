<template>
  <div class="content-box">
    <Table
      class="table-box"
      :columns="UserColumns"
      :data-source="UserData"
      :scroll="{ y: 580 }"
    >
      <template v-slot:expandedRowRender="{ record }">
        <Table
          style="height: 100%"
          :dataSource="record.dataSource"
          :columns="columns"
          :pagination="{ pageSize: 4 }"
          :scroll="{ y: 360 }"
        >
          <template #bodyCell="{ column, record }">
            <!-- <template v-if="column.key === 'avatar'">
              <Avatar class="avatar_box" @click.prevent></Avatar>
            </template> -->
            <template v-if="column.key === 'action'">
              <Button
                type="text"
                class="btn_view"
                @click.stop="editOrganiza(record.key)"
                ><EditOutlined class="item_action_icon" />编辑</Button
              >
              <Button type="text" class="btn_view"
                ><DeleteOutlined class="item_action_icon" />删除</Button
              >
              <Button type="text" class="btn_view"
                ><UnlockOutlined class="item_action_icon" />授权</Button
              >
            </template>
          </template>
        </Table>
      </template>
    </Table>
    <AddView
      :isOpen="isOpen"
      :closeAddModal="closeAddModal"
      :management="'role'"
      :openType="openType"
      :editData="editData"
    ></AddView>
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
import { getOrganizationsList, getRolesList } from "@/api/userManagement/index";
import AddView from "./AddView.vue";
const props = defineProps<{
  isOpen: boolean;
}>();
const dataSource = ref<any>([
  // {
  //   key: 0,
  //   roleName: "管理员",
  //   described:
  //     "中微半导体设备旗下互联网公司，中微汇链专注于泛半导体工业互联网平台及智能制造应用…",
  // },
  // {
  //   key: 1,
  //   roleName: "超级管理员",
  //   described:
  //     "中微半导体设备旗下互联网公司，中微汇链专注于泛半导体工业互联网平台及智能制造应用…",
  // },
  // {
  //   key: 2,
  //   roleName: "测试角色",
  //   described:
  //     "中微半导体设备旗下互联网公司，中微汇链专注于泛半导体工业互联网平台及智能制造应用…",
  // },
]);

const columns = [
  {
    title: "角色名称",
    key: "roleName",
    dataIndex: "roleName",
    width: "20%",
    ellipsis: true,
  },
  {
    title: "描述",
    key: "described",
    dataIndex: "described",
    width: "50%",
    ellipsis: true,
  },

  { title: "操作", key: "action", width: "30%" },
];

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
    width: "50%",
    ellipsis: true,
  },
];
let UserData = ref<any>([
  // {
  //   key: 0,
  //   organizationNumber: "organization1",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 1,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 2,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 3,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 4,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 5,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 6,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 7,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 8,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 9,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
  // {
  //   key: 10,
  //   organizationNumber: "organization2",
  //   organizationName: "基于AI仿真",
  //   creationTime: "2023/01/27 13:33:48",
  //   described:
  //     "是一家以中国为基地、面向全球的微观加工高端设备公司，为集成电路和泛半导体行业提供具竞争力的….com",
  //   dataSource: dataSource.value,
  // },
]);
const updateList = () => {
  // 获取所有用户
  getRolesList().then((res: any) => {
    const arr: any = [];
    // console.log(res["data "]);
    let data = res.data ?? res["data "];

    data.forEach((val: any) => {
      arr.push({
        key: val,
        roleName: val.name,
        described: val.desc,
        org_id: val.org_id,
      });
    });
    dataSource.value = arr;
    // 获取所有组织
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
          dataSource: dataSource.value.filter(
            (item: any) => item.org_id == val.id
          ),
        });
      });
      UserData.value = arr;
      // console.log(UserData.value, "5555");
    });
  });
};
// 编辑角色
const isOpen = ref(false);
const openType = ref("");
const editData: any = ref();
const editOrganiza = (record: any) => {
  console.log(record, "角色信息");
  editData.value = record;
  isOpen.value = true;
  openType.value = "edit";
};
const closeAddModal = () => {
  isOpen.value = false;
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