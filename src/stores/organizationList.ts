import { defineStore } from "pinia";
import { ref } from "vue";

import { getOrganizationsList } from "@/api/userManagement/index";
export const Organizations = defineStore("OrganizationsList", () => {
  const organizationsList: any = ref();

  const saveOrganizationsList = async () => {
    try {
      const res: any = await getOrganizationsList();
      let data = res.data ?? res["data "];

      if (data) {
        organizationsList.value = data;
      }
    } catch (error) {
      console.error("Failed to fetch project list:", error);
      // 你可以根据需要设定错误时的默认值
      organizationsList.value = [];
    }
  };

  return {
    organizationsList,
    saveOrganizationsList,
  };
});
