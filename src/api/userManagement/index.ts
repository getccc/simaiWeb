import { request } from "@/utils/request";

// 获取用户列表
export const getProgectList = () => {
  return request("/users/list", "GET");
};
// 创建用户
interface CreateUser {
  name: string; //昵称
  username: string; //用户名，用作登录凭证
  email?: string | undefined; //邮箱
  password: string; //密码
  phone?: string | undefined; //手机号 非必传项
  orgId: number; //组织id 只有有组织编辑权限的创建者才传，没有则不传
  roles?: [string]; //角色id数组
  userAvatar?: string | undefined; //头像 base64
}
export const createUser = (params: CreateUser) => {
  return request("/users/create", "POST", params);
};
// 编辑用户
interface EditUser {
  username: string;
  email?: string;
  org_id: number;
  name: string;
  user_avatar?: string;
  user_job_number?: string;
  user_position?: string;
  nick_name?: string;
  mobie_number?: string;
  phone_number?: string;
}
export const editUser = (user_id: number, parmae: EditUser) => {
  return request("/users/" + user_id + "/update", "PUT", parmae);
};
// 删除用户
export const deleteUser = (user_id: string) => {
  return request("/users/" + user_id + "/delete", "delete");
};

// 获取角色列表
export const getRolesList = () => {
  return request("/roles", "GET");
};
// 创建角色
interface CreateRole {
  name: string; //角色名
  desc: string; //角色介绍 非必传
  orgId: number; //组织id
}
export const createRole = (params: CreateRole) => {
  return request("/auth/roles/create", "POST", params);
};
// 编辑角色
interface EditRole {
  name: string;
  desc: string;
}
export const editRole = (role_id: number, parmae: EditRole) => {
  return request("/auth/roles/" + role_id + "/update", "PUT", parmae);
};
// 删除角色
export const deleteRole = (role_id: string) => {
  return request("/auth/roles/" + role_id + "/delete", "delete");
};

// 获取组织接口
export const getOrganizationsList = () => {
  return request("/organizations", "GET");
};
// 创建组织
interface CreateOrganization {
  organizationName: string; //组织名称
  organizationCode: string; //组织编码
}
export const createOrganization = (params: CreateOrganization) => {
  return request("/organizations/create ", "POST", params);
};
// 编辑组织
interface EditOrganization {
  organization_name: string;
  description?: string;
  organization_code: string;
  organization_level?: string;
  parent_organization?: string;
}
export const editOrganization = (org_id: number, parmae: EditOrganization) => {
  return request("/organizations/" + org_id + "/update", "PUT", parmae);
};
// 删除组织
export const deleteOrganization = (org_id: string) => {
  return request("/organizations/" + org_id + "/delete", "delete");
};
