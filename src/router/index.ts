import { createRouter, createWebHistory } from "vue-router";
import { Login } from "@/stores/user";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "projectmanagement",
      component: () => import("../views/ProjectManagement.vue"),
    },
    {
      path: "/Login",
      name: "login",
      component: () => import("../views/Login.vue"),
    },
    {
      path: "/CaseCenter",
      name: "casecenter",
      component: () => import("../views/CaseCenter.vue"),
    },
    {
      path: "/SimulationTraining",
      name: "simulationtraining",
      component: () => import("../views/SimulationTraining.vue"),
    },
    {
      path: "/SimulationStudio",
      name: "simulationstudio",
      component: () => import("../views/SimulationStudio.vue"),
    },
    {
      path: "/UserManagement",
      name: "usermanagement",
      component: () => import("../views/UserManagement.vue"),
    },
    {
      path: "/WorkFlow",
      name: "workflow",
      component: () => import("../views/WorkFlow.vue"),
    },
    {
      path: "/WorkFlow/Detail",
      name: "workflowdetail",
      component: () => import("../views/WorkFlowDetail.vue"),
    },
    {
      path: "/Resource/DataSet",
      name: "dataset",
      component: () => import("../views/DataSet.vue"),
    },
    {
      path: "/Resource/PlugIn",
      name: "plugin",
      component: () => import("../views/PlugIn.vue"),
    },
  ],
});
// const whiteList = ['/Login'];
// 前置路由首守卫
router.beforeEach((to, from, next) => {
  const state = Login();
  // 网站标题
  //获取用户页面token信息
  // if (!to.meta.requiresAuth) return next();
  // const token = ls.get("token");
  // if (whiteList.indexOf(to.path) !== -1) {
  //   next();
  // } else {
  //   // if (!token) {
  //   //   next("/user/login");
  //   // } else {
  //   //   next();
  //   // }
  // }
  //如果token数据为null则跳转到指定路径
  // if (to.path === "/Login") {
  //   next();
  //   return;
  // }
  // if (!state.userToken) {
  //   return next("/Login");
  // }
  next();
});
export default router;
