import { request } from "@/utils/request";

const start = (config: any) => {
  return request<any>("/start", "POST", config);
};

const status = (id: number) => {
  return request<any>("/status", "GET", { id });
};

const events = (id: number, since_id: number, limit: number) => {
  return request<any>("/events", "GET", { id, since_id, limit });
};

export { start, status, events };
