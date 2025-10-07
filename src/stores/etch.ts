import { defineStore } from "pinia";
import { ref } from "vue";
export const Etch = defineStore(
  "token",
  () => {
    const simName: any = ref();
    const menuName: any = ref('simModeling');
    const drawerVisible: any = ref(true);
   
    const saveSimName = (name: string | null) => {
      simName.value = name;
    };
    const saveMenuName = (name: string | null) => {
      menuName.value = name;
    };
    const saveDrawerVisible = (visivle: boolean) => {
      drawerVisible.value = visivle;
    };
    return {
      simName,
      menuName,
      drawerVisible,
      saveSimName,
      saveMenuName,
      saveDrawerVisible
    };
  },
  {
    persist: true, // 简化持久化配置
  }
);
