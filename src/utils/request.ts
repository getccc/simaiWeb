import axios, { type Method } from "axios";
import { baseURL } from "@/utils/base";
import { Login } from "@/stores/user";
import { login } from "@/api/login";
import { useRouter, useRoute } from "vue-router";
// console.log(userToken, 'token');
// 创建axios实例，并配置请求跟路径
const instance = axios.create({
  baseURL: "/api",
  timeout: 10000,
});
// 配置请求的拦截器   token请求头携带
// 添加请求拦截器
instance.interceptors.request.use(
  async function (config) {
    // 判断是否有token，如果有在headers中携带token
    // console.log(config.headers, 'config.headers');
    // if (store.userInfo?.token && config.headers) {
    //   config.headers.Authorization = `Bearer ${store.userInfo?.token}`;
    // }
    const store = Login();
    // const router = useRouter();
    // console.log(store.userToken);

    // // 如果有token直接使用
    if (store.userToken && config.headers) {
      config.headers.Authorization = store.userToken;
    }
    // 如果没有token，则进行登录请求
    // try {
    //   if (!store.isLoggingIn) {
    //     // 防止重复登录
    //     store.saveLoggingIn(true); // 设置为正在登录状态
    //     let obj = {
    //       username: "yog",
    //       password: "123456",
    //     };
    //     // 等待登录请求完成
    //     const res: any = await login(obj);

    //     // 登录成功后保存token并设置Authorization
    //     store.saveToken(res.token);
    //     store.saveUserId(Number(res.user.id));
    //     config.headers.Authorization = store.userToken;
    //   }
    //   return config;
    // } catch (error) {
    //   console.error("登录失败", error);
    //   router.push({ name: "login" });
    //   return Promise.reject(error); // 如果登录失败，返回错误
    // } finally {
    //   store.saveLoggingIn(false); // 无论如何，登录状态重置
    // }

    // 一定返回请求对象
    return config;
  },
  function (error) {
    // 对请求错误做些什么

    return Promise.reject(error);
  }
);

// 添加响应拦截器   错误响应处理  401错误处理
instance.interceptors.response.use(
  function (response) {
    // 手动抛出错误
    // if (response.data.code !== 10000) {
    //   return Promise.reject(response.data);
    // }

    return response.data;
  },
  function (error) {
    //错误的响应在返回浏览器之前会经过这里
    if (error.response && error.response.status === 401) {
      const store = Login();
      // 401 错误时，跳转到登录页面
      store.saveToken(null);
      store.saveUserId(null);
      store.saveUserName(null);
      const router = useRouter();
      router.push({ name: "login" });
    }
    return Promise.reject(error);
  }
);

// 给所有的响应的数据提供公共的类型声明
type Data<T> = {
  res: any;
  token: any;
  code: number;
  msg: string;
  data: T;
};

// 导出一个通用的请求工具函数，支持设置响应数据类型
const request = <T>(
  url: string,
  method: Method = "get",
  submitData?: object
) => {
  return instance.request<Data<T>, Data<T>>({
    url,
    method,
    // params  || data : submitData
    [method.toLowerCase() === "get" || method.toLowerCase() === "delete"
      ? "params"
      : "data"]: submitData,
  });
};

export { baseURL, instance, request };
