<script setup lang="ts">
import { ref, defineProps } from "vue";
import { Avatar, Dropdown, message } from "ant-design-vue";
import {
  LayoutFilled,
  BookFilled,
  UserOutlined,
  TranslationOutlined,
  ReloadOutlined,
  SwapOutlined,
  PoweroffOutlined,
  RightOutlined,
} from "@ant-design/icons-vue";
import { Login } from "@/stores/user";
import { login } from "@/api/login";
import { useRouter, useRoute } from "vue-router";
import { Etch } from '@/stores/etch';

const etchStore = Etch()

defineProps<{
  name: string;
}>();

const visible = ref<boolean>(false);

// 模拟登录
// const simulateLogin = async () => {
//   const store = Login();
//   // 防止重复登录
//   store.saveLoggingIn(true); // 设置为正在登录状态
//   let obj = {
//     username: "yog",
//     password: "123456",
//   };
//   // 等待登录请求完成
//   const res: any = await login(obj);

//   // 登录成功后保存token并设置Authorization
//   store.saveToken(res.token);
//   store.saveUserId(Number(res.user.id));
//   store.saveLoggingIn(false);
// };
// 退出登录
const store = Login();
const router = useRouter();
const logOut = () => {
  store.saveToken(null);
  store.saveUserId(null);
  store.saveUserName(null);
  store.saveUserData(null);
  //   store.saveUserRefreshToken(null);
  router.push({ name: "login" });
  //   router.push({ path: '/user/login' });
  //   location.reload();
  message.success("退出成功");
};

const handleDrawer = () => {
  etchStore.saveDrawerVisible(!etchStore.drawerVisible)
}
</script>

<template>
  <div class="nav_right">
    <LayoutFilled @click="handleDrawer" class="label_icon" />
    <BookFilled class="label_icon" />
    <!-- <BookFilled class="label_icon" @click="()=>simulateLogin()" /> -->
    <Dropdown trigger="click" :open="visible" @update:open="visible = $event">
      <Avatar class="avatar_box" @click.prevent></Avatar>
      <template #overlay>
        <div class="avatar_cont">
          <div class="avatar_top">
            <div>
              <Avatar class="avatar_item"></Avatar>
            </div>
            <div class="avatar_user">
              <div>{{ store.userName ?? name }}</div>
              <div>基于AI仿真平台</div>
            </div>
          </div>
          <div class="avatar_bottom">
            <div>
              <div><UserOutlined class="l_icon" />个人中心</div>
            </div>
            <!-- <div>
                            <div>
                                <TranslationOutlined class="l_icon" />语言切换
                            </div>
                            <div>简体中文<RightOutlined class="r_icon" /></div>
                        </div>
                        <div>
                            <div>
                                <ReloadOutlined class="l_icon" />模式切换
                            </div>
                            <div>深色<RightOutlined class="r_icon" /></div>
                        </div> -->
            <div>
              <div><SwapOutlined class="l_icon" />切换账号</div>
              <div><RightOutlined class="r_icon" /></div>
            </div>
            <div>
              <div @click="logOut"><PoweroffOutlined class="l_icon" />退出</div>
            </div>
          </div>
        </div>
      </template>
    </Dropdown>
  </div>
</template>

<style scoped>
.nav_right {
  display: flex;
  align-items: center;
  height: 65px;
}

.label_icon {
  margin-right: 1.57rem;
  font-size: 1.42rem;
  color: #93a1c5;
  cursor: pointer;
}

.avatar_box {
  width: 2rem;
  height: 2rem;
  background: #ddd;
  cursor: pointer;
}

.avatar_cont {
  width: 280px;
  background: #ffffff;
  box-shadow: 0px 4px 12px 0px rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border: 1px solid #d5dbe0;
}

.avatar_top {
  padding: 0 20px;
  height: 72px;
  background: #e7f2ff;
  display: flex;
  align-items: center;
}

.avatar_item {
  width: 36px;
  height: 36px;
}

.avatar_user {
  margin-left: 10px;
}

.avatar_user > div:nth-child(1) {
  font-size: 14px;
  color: #333;
}

.avatar_user > div:nth-child(2) {
  font-size: 14px;
  color: #666;
}

.avatar_bottom {
  padding: 10px 0 0;
  user-select: none;
}
.avatar_bottom > div {
  padding: 2px 30px 2px 20px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}
.avatar_bottom > div:nth-last-child(1) {
  height: 42px;
  background: #fafafa;
}
.avatar_bottom > div:hover {
  color: #2484fa;
  background: #f0f2f5;
}
.avatar_bottom > div:hover .l_icon {
  color: #2484fa !important;
}
.avatar_bottom > div > div:nth-child(2) {
  color: #333;
}
.l_icon {
  margin-right: 8px;
  width: 16px;
  height: 16px;
  color: #999;
}
.r_icon {
  margin-left: 8px;
  width: 16px;
  height: 16px;
  color: #999;
}
</style>
