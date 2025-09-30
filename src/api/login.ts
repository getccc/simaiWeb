import { request } from "@/utils/request";
// 登录方法
interface loginInfo {
  // refreshToken:string,
  // token: string;
  message: string;
  user_id: number;
  token: string;
}
interface userInfo {
  username: string;
  password: string;
}
// const user = { username: 'yog', password: '123456' };
const login = (code: userInfo) => {
  return request<loginInfo>("/login", "POST", code);
};

export { login };
