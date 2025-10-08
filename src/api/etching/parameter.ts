import { request } from "@/utils/request";

const createParameter = (config: any) => {
  return request<any>("/v1/parameter-sets", "POST", config);
};

const getParameter = (domain_key: any, template_id: any) => {
  return request<any>("/v1/parameter-sets", "GET", { domain_key, template_id, is_active: true });
};

const getParameterById = (id: number) => {
  return request<any>(`/v1/parameter-sets/${id}`, "GET");
};

const updateParameterById = (id: number, config: any) => {
  return request<any>(`/v1/parameter-sets/${id}`, "PUT", config);
};

const delParameterById = (id: number) => {
  return request<any>(`/v1/parameter-sets/${id}`, "DELETE");
};

export { createParameter, getParameter, getParameterById, updateParameterById, delParameterById };
