import { defineStore } from "pinia";
import { ref } from "vue";
export const Etch = defineStore(
  "token",
  () => {
    const simName: any = ref();
    const menuName: any = ref('simModeling');
   
    const saveSimName = (name: string | null) => {
      simName.value = name;
    };
    const saveMenuName = (name: string | null) => {
      menuName.value = name;
    };
  
    return {
      simName,
      menuName,
      saveSimName,
      saveMenuName,
    };
  },
  {
    persist: true, // 简化持久化配置
  }
);
