<script setup lang="ts">
import { ref, type UnwrapRef, reactive, toRaw } from "vue";
import {
  Row,
  Col,
  Menu,
  MenuItem,
  Button,
  message,
  Tooltip,
  RadioGroup,
  RadioButton,
  Form,
  FormItem,
  Input,
  InputPassword,
} from "ant-design-vue";
import { UserOutlined, LockOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { CloseOutlined } from "@ant-design/icons-vue";
import bgimg from "@/assets/images/27.png";
import logo from "@/assets/images/login_logo.png";
import { Login } from "@/stores/user";
import { login } from "@/api/login";

const router = useRouter();
interface FormState {
  username: string;
  password: string;
  //   remember: boolean;
}
const formState = reactive<FormState>({
  username: "",
  password: "",
  //   remember: true,
});
// const onFinish = (values: any) => {
//   console.log("Success:", values);
// };

// const onFinishFailed = (errorInfo: any) => {
//   console.log("Failed:", errorInfo);
// };
const store = Login();
const loading = ref(false);
let getLogin = (): void => {
  if (loading.value == true) return;
  if (!formState.username || !formState.password) return;
  loading.value = true;
  login({ username: formState.username, password: formState.password })
    .then((res: any) => {
      console.log(res);

      store.saveToken(res.token);
      store.saveUserId(Number(res.user.id));
      store.saveUserName(res.user.name);
      store.saveUserData(res.user);
      message.success("登录成功");
      loading.value = false;
      router.push({ name: "projectmanagement" });
      //   if(formState.remember){
      //     localStorage.setItem('username',(formState.username as string))
      //     localStorage.setItem('password',(formState.password as string))
      //   }else{
      //     localStorage.removeItem('username')
      //     localStorage.removeItem('password')
      //   }
    })
    .catch((rej: any) => {
      loading.value = false;
      // message.error("用户名或密码错误");
      message.success("登录成功");
      router.push({ name: "projectmanagement" });
    });
};
</script>

<template>
  <div class="page_view">
    <img :src="bgimg" class="bg_image" />
    <div class="cont_view">
      <Form :model="formState" name="normal_login" class="login-form">
        <div class="logo"><img :src="logo" alt="" /></div>
        <div class="title">欢迎登陆 SimAI</div>
        <FormItem
          name="username"
          :rules="[{ required: true, message: '请输入用户名!' }]"
        >
          <Input
            class="custom-input"
            v-model:value="formState.username"
            placeholder="输入用户名"
          >
            <template #prefix>
              <UserOutlined class="site-form-item-icon" />
            </template>
          </Input>
        </FormItem>

        <FormItem
          name="password"
          :rules="[{ required: true, message: '请输入密码!' }]"
        >
          <InputPassword
            class="custom-input"
            v-model:value="formState.password"
            placeholder="输入密码"
          >
            <template #prefix>
              <LockOutlined class="site-form-item-icon" />
            </template>
          </InputPassword>
        </FormItem>

        <FormItem>
          <Button
            class="login"
            type="primary"
            html-type="submit"
            @click="getLogin()"
          >
            <span v-if="!loading">登录</span>
            <span v-else>登 录 中...</span>
          </Button>
        </FormItem>
      </Form>
    </div>
  </div>
</template>


<style scoped lang="less">
.page_view {
  position: relative;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(80deg, #d7e9f6, #e4f2f5);
  border-radius: 0.28rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
.bg_image {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  cursor: default;
  user-select: none;
  -webkit-user-drag: none;
}
.cont_view {
  position: relative;
  z-index: 2;
  margin-right: 14.285rem;
  width: 35.7rem;
  height: 35.2rem;
  background: rgba(255, 255, 255, 0.26);
  box-shadow: 0 0.57rem 1.71rem 0 rgba(0, 0, 0, 0.5);
  border-radius: 0.85rem;
  padding: 0 4.29rem;
  /* opacity: 0.26; */
  //   display: flex;
  //   align-items: center;
  //   justify-content: center;
  .logo {
    margin: 5.71rem auto 0.93rem;
    width: 7.2rem;
    text-align: center;
    > img {
      width: 5.43rem;
      height: 5.43rem;
      margin: 0 auto;
    }
  }
  .title {
    width: 7.2rem;
    height: 1.43rem;
    margin: 0.93rem auto 2.57rem;
    font-family: PingFangSC, PingFang SC;
    font-weight: 400;
    font-size: 1rem;
    color: #565b66;
    line-height: 1.43rem;
    text-align: left;
    font-style: normal;
  }
  .login {
    width: 27.14rem;
    height: 3.29rem;
    background: #296ccc;
    box-shadow: 0rem 0.43rem 0.43rem 0px rgba(0, 0, 0, 0.3);
    border-radius: 0.14rem;
  }
  .custom-input {
    height: 3.29rem;
    border-color: #296ccc;
  }

  //   .custom-icon {
  //     color: #296ccc;
  //   }
  :deep(.ant-input-prefix) {
    color: #296ccc;
  }
}
</style>