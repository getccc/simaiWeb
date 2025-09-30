<template>
  <div>
    <Drawer
      :width="640"
      :title="`${openType == 'add' ? '新建' : '编辑'}${title[management]}`"
      :open="isOpen"
      @close="closeAddModal"
      :closable="false"
    >
      <template #extra>
        <CloseOutlined style="cursor: pointer" @click="closeAddModal" />
      </template>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; width: 100%">
          <Button style="margin-right: 8px" @click="closeAddModal">取消</Button>
          <Button type="primary" @click="onSubmit">确定</Button>
        </div>
      </template>
      <div class="content">
        <!-- 新建/编辑用户 -->
        <Form
          v-if="management == 'user'"
          ref="formRef"
          :model="formState"
          :rules="rules"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <Form-item label="姓名" name="name">
            <Input v-model:value="formState.name" placeholder="请输入" />
          </Form-item>
          <Form-item label="账号" name="account">
            <Input v-model:value="formState.account" placeholder="请输入" />
          </Form-item>
          <Form-item label="密码" name="password">
            <InputPassword
              v-model:value="formState.password"
              placeholder="请输入"
            />
          </Form-item>
          <Form-item label="手机号" name="phone">
            <Input v-model:value="formState.phone" placeholder="请输入" />
          </Form-item>
          <Form-item label="邮箱" name="emil">
            <Input v-model:value="formState.emil" placeholder="请输入" />
          </Form-item>
          <Form-item label="组织分配" name="organization">
            <Select v-model:value="formState.organization" placeholder="请选择">
              <!-- <Select-option value="1">组织1</Select-option> -->
              <Select-option
                v-for="(item, index) in organizationsList"
                :key="index"
                :value="item.id"
                >{{ item.organization_name }}</Select-option
              >
            </Select>
          </Form-item>
          <Form-item label="备注" name="desc">
            <Textarea
              v-model:value="formState.desc"
              placeholder="请输入"
            ></Textarea>
          </Form-item>
        </Form>
        <!-- 新建/编辑角色 -->
        <Form
          v-if="management == 'role'"
          ref="formRef2"
          :model="formState2"
          :rules="rules2"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <Form-item label="角色名称" name="roleName">
            <Input v-model:value="formState2.roleName" placeholder="请输入" />
          </Form-item>
          <Form-item label="组织分配" name="organization">
            <Select
              v-model:value="formState2.organization"
              placeholder="请选择"
            >
              <!-- <Select-option value="1">组织1</Select-option> -->
              <Select-option
                v-for="(item, index) in organizationsList"
                :key="index"
                :value="item.id"
                >{{ item.organization_name }}</Select-option
              >
            </Select>
          </Form-item>
          <Form-item label="备注" name="desc">
            <Textarea
              v-model:value="formState2.desc"
              placeholder="请输入"
            ></Textarea>
          </Form-item>
        </Form>
        <!-- 新建/编辑组织 -->
        <Form
          v-if="management == 'organization'"
          ref="formRef3"
          :model="formState3"
          :rules="rules3"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 17 }"
        >
          <Form-item label="组织名称" name="organizationName">
            <Input
              v-model:value="formState3.organizationName"
              placeholder="请输入"
            />
          </Form-item>
          <Form-item label="组织编码" name="organization">
            <Input v-model:value="formState3.organization" placeholder="请选择">
            </Input>
          </Form-item>
          <Form-item label="组织logo">
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
          <Form-item label="备注" name="desc">
            <Textarea
              v-model:value="formState3.desc"
              placeholder="请输入"
            ></Textarea>
          </Form-item>
        </Form>
      </div>
      {{ editData }}
    </Drawer>
  </div>
</template>
<script setup lang="ts">
import { ref, type UnwrapRef, reactive, onMounted, watch } from "vue";
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
import {
  createUser,
  createRole,
  createOrganization,
  getOrganizationsList,
  editUser,
  editRole,
  editOrganization,
} from "@/api/userManagement/index";

const props = defineProps<{
  isOpen: boolean;
  closeAddModal: () => void;
  management: string; // 类型 user/role/organization
  openType: string; // 操作类型 add/edit新增还是编辑
  editData?: any; //要编辑的信息
}>();
const emit = defineEmits<{
  (e: "closeAddModal"): void;
}>();
const title: any = {
  user: "用户",
  role: "角色",
  organization: "组织",
};
// 表单
// 新建/编辑用户
let formRef = ref();
const formState: UnwrapRef<any> = reactive({
  name: "", // 姓名
  account: "", // 账号
  password: "", // 密码
  phone: "", // 手机号
  emil: "", // 邮箱
  organization: undefined, // 组织分配
  desc: "", // 备注
});
const rules: any = {
  name: [
    { required: true, message: "请输入名称", trigger: "blur" },
    { min: 3, max: 50, message: "长度应为3到50", trigger: "blur" },
  ],
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 50, message: "长度应为3到50", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 3, max: 50, message: "长度应为3到50", trigger: "blur" },
  ],
  organization: [{ required: true, message: "请选择组织", trigger: "blur" }],
};
// 新建/编辑角色
let formRef2 = ref();
const formState2: UnwrapRef<any> = reactive({
  roleName: "", // 角色名称
  organization: undefined, // 选择组织
  desc: "", // 描述
});
const rules2: any = {
  roleName: [
    { required: true, message: "请输入名称", trigger: "blur" },
    { min: 3, max: 50, message: "长度应为3到50", trigger: "blur" },
  ],
  organization: [{ required: true, message: "请选择组织", trigger: "blur" }],
};
// 新建/编辑组织
let formRef3 = ref();
const formState3: UnwrapRef<any> = reactive({
  organizationName: "", // 组织名称
  organization: "", // 组织编码
  logo: null, // logo
  desc: "", // 描述
});
const rules3: any = {
  organizationName: [
    { required: true, message: "请输入名称", trigger: "blur" },
    { min: 3, max: 50, message: "长度应为3到50", trigger: "blur" },
  ],
  organization: [{ required: true, message: "请选择组织", trigger: "blur" }],
};

const onSubmit = () => {
  if (props.openType == "add") {
    if (props.management == "user") {
      formRef.value
        .validate()
        .then(() => {
          console.log("values", formState);
          let params = {
            name: formState.name,
            username: formState.account,
            email: formState.emil,
            password: formState.password,
            phone: formState.phone,
            orgId: formState.organization, //组织id 只有有组织编辑权限的创建者才传，没有则不传
            // roles: [string], //角色id数组
            // userAvatar: //头像 base64
          };
          createUser(params)
            .then(() => {
              message.success("创建成功");
              props.closeAddModal();
            })
            .catch((error: any) => {
              message.error("创建失败");
            });
        })
        .catch((error: any) => {
          console.log("error", error);
        });
    } else if (props.management == "role") {
      formRef2.value
        .validate()
        .then(() => {
          console.log("values", formState2);
          let params = {
            name: formState2.roleName,
            desc: formState2.desc,
            orgId: formState2.organization,
          };
          createRole(params)
            .then(() => {
              message.success("创建成功");
              props.closeAddModal();
            })
            .catch((error: any) => {
              message.error("创建失败");
            });
        })
        .catch((error: any) => {
          console.log("error", error);
        });
    } else if (props.management == "organization") {
      formRef3.value
        .validate()
        .then(() => {
          console.log("values", formState3);
          let params = {
            organizationName: formState3.organizationName,
            organizationCode: formState3.organization,
          };
          createOrganization(params)
            .then(() => {
              message.success("创建成功");
              props.closeAddModal();
            })
            .catch((error: any) => {
              message.error("创建失败");
            });
        })
        .catch((error: any) => {
          console.log("error", error);
        });
    }
  } else if (props.openType == "edit") {
    if (props.management == "user") {
      formRef.value
        .validate()
        .then(() => {
          console.log("values", formState);
          let params: any = {
            name: formState.name,
            username: formState.account,
            email: formState.emil,
            // password: formState.password, //待确认
            phone_number: formState.phone,
            org_id: formState.organization, //组织id 只有有组织编辑权限的创建者才传，没有则不传

            // user_avatar: //头像 base64  //待确认
          };
          let id = props.editData.id;

          editUser(id, params)
            .then(() => {
              message.success("编辑成功");
              props.closeAddModal();
            })
            .catch((error: any) => {
              message.error("编辑失败");
            });
        })
        .catch((error: any) => {
          console.log("error", error);
        });
    } else if (props.management == "role") {
      formRef2.value
        .validate()
        .then(() => {
          console.log("values", formState2);
          let params = {
            name: formState2.roleName,
            desc: formState2.desc,
            // orgId: formState2.organization, //待确认
          };
          let id = props.editData.id;
          editRole(id, params)
            .then(() => {
              message.success("编辑成功");
              props.closeAddModal();
            })
            .catch((error: any) => {
              message.error("编辑失败");
            });
        })
        .catch((error: any) => {
          console.log("error", error);
        });
    } else if (props.management == "organization") {
      formRef3.value
        .validate()
        .then(() => {
          console.log("values", formState3);
          let params = {
            organization_name: formState3.organizationName,
            organization_code: formState3.organization,
            description: formState3.desc,
          };
          let id = props.editData.id;
          editOrganization(id, params)
            .then(() => {
              message.success("编辑成功");
              props.closeAddModal();
            })
            .catch((error: any) => {
              message.error("编辑失败");
            });
        })
        .catch((error: any) => {
          console.log("error", error);
        });
    }
  }
};
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
const organizationsList: any = ref([]);
onMounted(() => {
  getOrganizationsList().then((res: any) => {
    let data = res.data ?? res["data "];
    organizationsList.value = data;
    // console.log(organizationsList.value);
  });
});
watch(
  () => props.isOpen,
  async (newValue: any) => {
    //数据初始化
    if (newValue) {
      let eData = props.editData;
      if (props.openType == "edit") {
        if (props.management == "user") {
          formState.name = eData.name;
          formState.account = eData.username;
          formState.password = eData.password;
          formState.phone = eData.phone_number;
          formState.email = eData.email;
          formState.organization = eData.org_id;
          formState.desc = eData.desc;
        } else if (props.management == "role") {
          formState2.roleName = eData.name;
          formState2.organization = eData.org_id;
          formState2.desc = eData.desc;
        } else if (props.management == "organization") {
          formState3.organizationName = eData.organization_name;
          formState3.organization = eData.organization_code;
          formState3.desc = eData.description;
        }
      } else if (props.openType == "add") {
        if (props.management == "user") {
          formState.name = "";
          formState.account = "";
          formState.password = "";
          formState.phone = "";
          formState.email = "";
          formState.organization = undefined;
          formState.desc = "";
        } else if (props.management == "role") {
          formState2.roleName = "";
          formState2.organization = undefined;
          formState2.desc = "";
        } else if (props.management == "organization") {
          formState3.organizationName = "";
          formState3.organization = "";
          formState3.desc = "";
        }
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="less"></style>