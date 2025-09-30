import { request } from "@/utils/request";

// 获取节点库
export const getNodeLibrary = () => {
  return request("/object_info", "GET");
};

// post prompt
interface promptInfo {
  client_id: string;
  extra_data: {
    extra_pnginfo: {
      workflow: any;
    };
  };
  prompt: any;
}
export const postPrompt = (params: promptInfo) => {
  return request("/prompt", "POST", params);
};
