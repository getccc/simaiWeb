import { request } from "@/utils/request";

// 获取项目列表
interface UserSearch {
  user_id: number;
  search_term?: string;
}
export const getProgectList = (params: UserSearch) => {
  return request("/projects/pageable", "POST", params);
};

// 新建项目
interface Addprogect {
  name: string; //项目名
  description?: string; //项目描述
  org_id: number; //所属组织id
  creator_id: number; //创建者id，user_id
  project_avatar?: string;
  visit_num?: boolean;
  case_show?: string;
}
export const addProgect = (params: Addprogect) => {
  return request("/projects", "POST", params);
};

// 删除项目
export const deleteProgect = (project_id: string) => {
  return request("/projects/" + project_id, "delete");
};

// 编辑项目
interface EditProgect {
  name: string; //项目名
  description?: string; //项目描述
  project_avatar?: string;
  visit_num?: boolean;
  case_show?: string;
}
export const editProgect = (project_id: number, parmae: EditProgect) => {
  return request("/projects/" + project_id, "PUT", parmae);
};
