import "./assets/main.css";
import "@comfyorg/litegraph/style.css";
import "ant-design-vue/dist/reset.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";
import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";

// 清除可能损坏的 localStorage 数据
try {
  const tokenData = localStorage.getItem('token');
  if (tokenData && !tokenData.startsWith('{')) {
    // 如果存储的数据不是JSON格式，清除它
    localStorage.removeItem('token');
    console.log('清除了损坏的token数据');
  }
} catch (error) {
  console.warn('检查localStorage时出错:', error);
  localStorage.clear(); // 清除所有localStorage数据
}

const app = createApp(App);

// app.use(createPinia());
const pinia = createPinia();
pinia.use(piniaPersist); // 使用插件

app.use(Antd);
app.use(pinia); // 注册 Pinia

app.use(router);

app.mount("#app");
