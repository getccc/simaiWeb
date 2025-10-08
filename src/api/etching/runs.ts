import { request } from "@/utils/request";

const createRuns = (config: any) => {
  return request<any>("/v1/runs", "POST", config);
};

const getRuns = (page: any = 1, page_size: any = 50) => {
  return request<any>(`/v1/runs?page=${page}&page_size=${page_size}`, "GET");
};

const getRunsById = (id: number, sinceId: number, limit: number) => {
  return request<any>(`/v1/runs/${id}/events?since_id=${sinceId}&limit=${limit}`, "GET");
};

const cancelRunsById = (id: number) => {
  return request<any>(`/v1/runs/${id}/cancel`, "POST");
};

export { createRuns, getRuns, getRunsById, cancelRunsById };
