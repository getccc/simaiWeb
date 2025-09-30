<template>
  <div class="content-box">
    <!-- <Table :dataSource="dataSource" :columns="columns" :pageSize="20">
      <template v-slot:bodyCell="{ record, column }">
        <template v-if="column.key === 'avatar'">
          <Avatar class="avatar_box" @click.prevent></Avatar>
        </template>
        <template v-if="column.key === 'action'">
          <Button type="text" class="btn_view"
            ><EditOutlined class="item_action_icon" />编辑</Button
          >
          <Button type="text" class="btn_view"
            ><DeleteOutlined class="item_action_icon" />删除</Button
          >
        </template>
      </template>
    </Table> -->
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
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'avatar'">
              <Avatar class="avatar_box" @click.prevent></Avatar>
            </template>
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
            </template>
          </template>
        </Table>
      </template>
    </Table>
    <AddView
      :isOpen="isOpen"
      :closeAddModal="closeAddModal"
      :management="'user'"
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
} from "@ant-design/icons-vue";
import itemimg from "@/assets/images/11.png";
import {
  getOrganizationsList,
  getProgectList,
} from "@/api/userManagement/index";
import AddView from "./AddView.vue";
const props = defineProps<{
  isOpen: boolean;
}>();
const dataSource = ref<innerDataItem[]>([
  // {
  //   key: 0,
  //   avatar: "",
  //   name: "王博士",
  //   account: "wangPhD",
  //   email: "wangPhD@pinn.com",
  //   role: "管理员",
  // },
  // {
  //   key: 1,
  //   avatar: "",
  //   name: "顾博士",
  //   account: "guPhD",
  //   email: "guPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 2,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 3,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 4,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 5,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 6,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 7,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 8,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 9,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 10,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 11,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 12,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 13,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 14,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 15,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 16,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 17,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 18,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 19,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 20,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 21,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
  // {
  //   key: 22,
  //   avatar: "",
  //   name: "周博士",
  //   account: "zhouPhD",
  //   email: "zhouPhD@pinn.com",
  //   role: "CAE",
  // },
]);

const columns = [
  { title: "头像", key: "avatar", dataIndex: "avatar", width: "10%" },
  {
    title: "姓名",
    key: "name",
    dataIndex: "name",
    width: "20%",
    ellipsis: true,
  },
  {
    title: "账号",
    key: "account",
    dataIndex: "account",
    width: "20%",
    ellipsis: true,
  },
  {
    title: "邮箱",
    key: "email",
    dataIndex: "email",
    width: "20%",
    ellipsis: true,
  },
  {
    title: "角色",
    key: "role",
    dataIndex: "role",
    width: "10%",
    ellipsis: true,
  },
  { title: "操作", key: "action", width: "20%" },
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
interface innerDataItem {
  key: number;
  avatar: string;
  name: string;
  account: string;
  email: string;
  role: string;
}
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
// const pagination = {
//   pageSize: 5, // 每页展示5条数据
//   showSizeChanger: true, // 允许用户改变每页显示的条数
//   pageSizeOptions: ["5", "10", "20"], // 提供选择不同条数的选项
// };
const updateList = () => {
  // 获取所有用户
  getProgectList().then((res: any) => {
    const arr: any = [];
    // console.log(res["data "]);
    let data = res.data ?? res["data "];

    data.forEach((val: any) => {
      arr.push({
        key: val,
        avatar: val.user_avatar,
        name: val.name,
        account: val.username,
        email: val.email,
        role: "",
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
// 编辑用户
const isOpen = ref(false);
const openType = ref("");
const editData: any = ref();
const editOrganiza = (record: any) => {
  console.log(record, "用户信息");
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