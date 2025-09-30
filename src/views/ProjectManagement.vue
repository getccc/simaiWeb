<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw, onMounted, watch } from "vue";
import { Row, Col, InputSearch, Dropdown, Menu, MenuItem, Button, Modal, Form, FormItem, Input, Select, SelectOption, Textarea, Upload, message, } from "ant-design-vue";
import { DownOutlined, PlusOutlined, EditOutlined, DeleteOutlined, LoadingOutlined, } from "@ant-design/icons-vue";
import itemimg from "@/assets/images/09.png";

import {
  getProgectList,
  addProgect,
  deleteProgect,
  editProgect,
} from "@/api/projects/index.ts";
import { Login } from "@/stores/user";
import { Sidebar } from "@/stores/sidebar";
let searchVal = ref<string>("");
let iscreate = ref<string>("");

// 图片上传------------
let isCoverLoading = ref<boolean>(false);
let coverimg = ref<any>();
function getBase64(img: Blob, callback: (base64Url: string) => void) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result as string));
  reader.readAsDataURL(img);
}

const handleChange = (info: any) => {
  if (info.file.status === "uploading") {
    isCoverLoading.value = true;
    return;
  }
  if (info.file.status === "done") {
    getBase64(info.file.originFileObj, (base64Url: string) => {
      coverimg.value = base64Url;
      isCoverLoading.value = false;
    });
  }
  if (info.file.status === "error") {
    isCoverLoading.value = false;
    message.error("upload error");
  }
};

const beforeUpload = (file: any) => {
  const isJpgOrPng =
    file.type === "image/jpg" ||
    file.type === "image/jpeg" ||
    file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("您只能上传JPG/PNG/JPEG文件!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("图像必须小于2MB!");
  }
  return isJpgOrPng && isLt2M;
};
// --------------------

// 表单----------------
let formRef = ref();
const formState: UnwrapRef<any> = reactive({
  name: "",
  type: "1",
  desc: "",
});
const rules: any = {
  name: [
    { required: true, message: "请输入名称", trigger: "blur" },
    { min: 3, max: 50, message: "长度应为3到50", trigger: "blur" },
  ],
  type: [{ required: true, message: "请至少选择一种类型", trigger: "change" }],
};
const onSubmit = () => {
  formRef.value.validate().then(() => {
    let sdata = {
      ...toRaw(formState),
      coverimg: coverimg.value,
    };
    console.log(sdata);
    // iscreate.value = "";
    // formRef.value.resetFields();
    if (iscreate.value == "create") {
      let params = {
        name: formState.name,
        org_id: Number(formState.type),
        // org_id: 1,
        creator_id: 4,
        description: formState.desc,
      };
      addProgect(params)
        .then(() => {
          iscreate.value = "";
          message.success("创建成功");
          getProgectFunc();
        })
        .catch(() => {
          message.error("创建失败");
        });
      // console.log(params, "555");
    } else if (iscreate.value == "edit") {
      let project_id = editId.value;
      let params = {
        name: formState.name,
        org_id: Number(formState.type),
        description: formState.desc,
      };
      editProgect(project_id, params)
        .then((res: any) => {
          iscreate.value = "";
          message.success("编辑成功");
          getProgectFunc();
        })
        .catch((res: any) => {
          message.error("编辑失败");
        });
    }
  });
};
// 编辑
const editId = ref(); // 要编辑的项目id
const onEditFunc = (item: any) => {
  iscreate.value = "edit";
  console.log(item, "bianji");
  editId.value = item.id;
  formState.name = item.name;
  formState.desc = item.description;
};
// --------------------

const onSearch = (searchValue: string) => {
  // console.log('use value', searchValue);
  if (searchValue.trim() == "") {
    getProgectFunc();
  } else {
    let params = {
      user_id: store.userId,
      search_term: searchValue,
    };
    getProgectList(params).then((res: any) => {
      projectsList.value = res.data;
    });
  }
};

const store = Login();
const store2 = Sidebar();
let projectsList: any = ref([
  {

  }
]);
// 获取组织列表
const getProgectFunc = () => {
  let params = {
    user_id: store.userId,
    // "search_term":string
  };
  let data = getProgectList(params).then((res: any) => {
    projectsList.value = res.data;
    // console.log(projectsList, "5555");
    store2.saveProjectNum(projectsList.value.length);
  });
};
onMounted(() => {
  getProgectFunc();
});
// 删除项目
const isDel = ref(false);
const delId = ref();
const delName = ref();
const openDelModel = (item: any) => {
  delId.value = item.id;
  delName.value = item.name;
  isDel.value = true;
};

const onDel = () => {
  console.log(delId.value);

  deleteProgect(delId.value)
    .then(() => {
      message.success("删除成功");
      isDel.value = false;
      getProgectFunc();
    })
    .catch(() => {
      message.error("删除失败");
    });
};
watch(
  () => iscreate.value,
  (newValue: any) => {
    if (newValue == "") {
      formState.name = "";
      formState.type = "1";
      formState.desc = "";
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="header_box">
    <div>
      <div>项目管理</div>
      <div>
        <InputSearch
          v-model:value="searchVal"
          placeholder="搜索项目"
          enter-button="搜索"
          @search="onSearch"
          class="search_input"
        />
      </div>
    </div>
    <div>
      <div class="header_select">
        <Dropdown trigger="click">
          <div @click.prevent>
            全部状态
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
        <Button class="create_btn" @click="iscreate = 'create'">
          <PlusOutlined class="create_btn_icon" />
          <div class="create_btn_test">新建</div>
        </Button>
      </div>
    </div>
  </div>

  <div class="content_box">
    <div class="item_box">
      <Button class="create_btn item_btn" @click="iscreate = 'create'">
        <PlusOutlined class="item_btn_icon" />
        <div class="item_btn_text">新建</div>
      </Button>
    </div>
    <!--  -->
    <div v-for="(item, index) in projectsList" :key="index">
      <Dropdown :trigger="['contextmenu']">
        <div class="item_box" @click.prevent>
          <div
            class="item_image"
            :style="{ backgroundImage: 'url(' + itemimg + ')' }"
          ></div>
          <div class="item_cont">
            <!-- <div>{{ item.name }}</div>
            <div>{{ item.description }}</div> -->
            <!-- <div>{{ new Date(item.updated_at).toLocaleString() }}</div> -->
            <div>蚀刻机仿真项目</div>
            <div>
              <!-- 利用蒙特卡洛方法模拟气体分子的碰撞和输运过程蒙特卡洛方法模拟气体分子的碰撞和输运过程 -->
              基于蚀刻机的离散事件仿真
            </div>
          </div>
        </div>
        <template #overlay>
          <Menu>
            <MenuItem>
              <div class="item_action" @click="onEditFunc(item)">
                <EditOutlined class="item_action_icon" />编辑
              </div>
            </MenuItem>
            <MenuItem>
              <div class="item_action" @click="openDelModel(item)">
                <DeleteOutlined class="item_action_icon" />删除
              </div>
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>
    </div>
  </div>

  <Modal
    :visible="iscreate != ''"
    :title="(iscreate == 'create' ? '新建' : '编辑') + '项目'"
    @ok="onSubmit"
    @cancel="iscreate = ''"
    ok-text="确定"
    cancel-text="取消"
    :keyboard="false"
    :maskClosable="false"
  >
    <Form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
    >
      <Form-item label="名称" name="name">
        <Input v-model:value="formState.name" placeholder="请输入" />
      </Form-item>
      <!-- <Form-item label="组织" name="type">
        <Select v-model:value="formState.type" placeholder="请选择">
          <Select-option value="1">组织1</Select-option>
        </Select>
      </Form-item> -->
      <Form-item label="描述" name="desc">
        <Textarea
          v-model:value="formState.desc"
          placeholder="请输入"
        ></Textarea>
      </Form-item>
      <Form-item label="上传封面">
        <Upload
          name="cover"
          list-type="picture-card"
          action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
          :show-upload-list="false"
          :before-upload="beforeUpload"
          @change="handleChange"
        >
          <img v-if="coverimg" :src="coverimg" alt="avatar" />
          <div v-else>
            <loading-outlined v-if="isCoverLoading" />
            <plus-outlined v-else />
            <div class="">上传</div>
          </div>
        </Upload>
      </Form-item>
    </Form>
  </Modal>
  <Modal v-model:open="isDel" @ok="onDel" ok-text="确定" cancel-text="取消">
    <div style="margin-top: 1.43rem">确认要删除项目{{ delName }}吗？</div>
    <div>删除后数据将不复存在</div>
  </Modal>
</template>


<style scoped>
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

::v-deep(.search_input .ant-input-group .ant-input) {
  width: 16.71rem;
  height: 2.28rem;
  font-size: 1rem;
  border-radius: 0 !important;
}

::v-deep(
    .search_input
      .ant-input-group
      .ant-input-group-addon
      .ant-input-search-button
  ) {
  padding: 0;
  width: 4rem;
  height: 2.28rem;
  line-height: 2.28rem;
  /* border-radius: 0 !important; */
  border-top-right-radius: 0.36rem !important;
  border-bottom-right-radius: 0.36rem !important;
  background: #2484fa;
}

::v-deep(
    .search_input
      .ant-input-group
      .ant-input-group-addon
      .ant-input-search-button
  )
  span {
  padding: 0;
  height: 2.28rem;
  line-height: 2.28rem;
  font-size: 1rem !important;
  transform: translate(0px, -0.14rem);
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
  color: #fff;
}

.content_box {
  margin: 0 0 0 2.14rem;
  display: flex;
  flex-wrap: wrap;
}

.item_box {
  margin: 0 2.14rem 2.85rem 0;
  width: 16.14rem;
  height: 19rem;
  background: #fff;
  border-radius: 0.28rem;
  border: 0.071rem solid #d5dbe0;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.item_box:hover {
  box-shadow: 0 0.14rem 0.8rem 0 rgba(0, 0, 0, 0.15);
}

.item_image {
  width: 100%;
  height: 12rem;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center center;
}

.item_cont {
  padding: 0.82rem 0.85rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.item_cont > div:nth-child(1) {
  font-size: 1.14rem;
  font-weight: 600;
  color: #1a1a1a;
}

.item_cont > div:nth-child(2) {
  font-size: 1rem;
  color: #333;
  height: 3.14rem;
  line-height: 1.57rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
}

.item_btn {
  margin: 8.35rem auto 0;
  background: #fff !important;
  border: 0.07rem solid #d5dbe0;
}

.item_btn_icon {
  margin-right: 0.34rem;
  color: #666 !important;
}

.item_btn_text {
  color: #666 !important;
}

.item_action {
  width: 7.01rem;
  height: 2.07rem;
  font-size: 1rem;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item_action_icon {
  margin-left: -0.78rem;
  margin-right: 0.78rem;
}

.item_action:hover {
  color: #2484fa;
}
</style>