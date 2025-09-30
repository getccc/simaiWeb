import { request } from "@/utils/request";

// 获取工作流列表
interface UserSearch {
  project_id?: number;
  search_term?: string;
}
export const getWorkFlowList = (params: UserSearch) => {
  return request("/projects/apply_list", "POST", params);
};

// 新建工作流
export const addWorkFlow = (params: any) => {
  return request("/projects/apply", "POST", params);
};

// 删除工作流
export const deleteWorkFlow = (apply_id: string) => {
  return request("/projects/" + apply_id + '/apply', "delete");
};

// 编辑工作流
export const editWorkFlow = (apply_id: number, parmae: any) => {
  return request("/projects/" + apply_id + '/apply', "PUT", parmae);
};
