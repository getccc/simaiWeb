import { defineStore } from "pinia";
// import { login } from '/@/api/login';
import { ref } from "vue";
export const Login = defineStore(
  "token",
  () => {
    const userToken: any = ref();
    const userName: any = ref();
    const userId: any = ref();
    const userRefreshToken = ref();
    const userData: any = ref();
    const isLoggingIn: any = ref(false); // 防止重复登录
    // const user = { username: '11', password: '123456' };
    // const saveToken = () => {
    //   const data = await login(user);
    //   userToken.value = data.token;
    // };
    const saveToken = (order: string | null) => {
      userToken.value = order;
    };
    const saveUserName = (order: string | null) => {
      userName.value = order;
    };
    const saveUserId = (order: number | null) => {
      userId.value = order;
    };
    const saveUserRefreshToken = (order: string | null) => {
      userRefreshToken.value = order;
    };
    const saveUserData = (order: any | null) => {
      userData.value = order;
    };
    const saveLoggingIn = (order: boolean | null) => {
      isLoggingIn.value = order;
    };
    return {
      userToken,
      userName,
      userId,
      userRefreshToken,
      userData,
      isLoggingIn,
      saveToken,
      saveUserName,
      saveUserId,
      saveUserRefreshToken,
      saveUserData,
      saveLoggingIn,
    };
  },
  {
    persist: true, // 简化持久化配置
  }
);
