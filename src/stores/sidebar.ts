import { defineStore } from "pinia";
import { ref } from "vue";
import { Login } from "@/stores/user";
import { getProgectList } from "@/api/projects/index.ts";
export const Sidebar = defineStore(
  "SidebarData",
  () => {
    const projectNum: any = ref();
    const projectList: any = ref();
    const saveProjectNum = (order: number | null) => {
      projectNum.value = order;
    };
    const saveProjectList = async () => {
      try {
        const store = Login();
        let params = {
          user_id: store.userId,
          // "search_term":string // 如果需要，你可以传递搜索条件
        };

        const res: any = await getProgectList(params);
        if (res.data) {
          projectList.value = res.data;
          projectNum.value = res.data.length; // 获取项目列表长度
        }
      } catch (error) {
        console.error("Failed to fetch project list:", error);
        // 你可以根据需要设定错误时的默认值
        projectList.value = [];
        projectNum.value = null;
      }
    };

    return {
      projectNum,
      projectList,
      saveProjectNum,
      saveProjectList,
    };
  }
  // {
  //   persist: {
  //     enabled: true, // 设置持久化为true
  //     // 其他 PersistOptions 属性...
  //     strategies: [
  //       {
  //         storage: localStorage,
  //         paths: ["projectNum"],
  //       },
  //     ],
  //   },
  // }
);
