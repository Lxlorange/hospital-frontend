import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse,AxiosRequestConfig } from "axios";
import { ElMessage } from 'element-plus'
import { userSotre } from "@/store/user";
//axios的配置项
const config: AxiosRequestConfig= {
    baseURL: 'http://localhost:8089', //求接口的地址
    timeout: 10000,
    withCredentials:true
}
//定义返回值类型
export interface Result<T = any> {
    code: number,
    msg: string,
    data: T
}
class Http {
    //axios的实例
    private instance: AxiosInstance;
    //初始化的作用
    constructor(configs:AxiosRequestConfig) {
        //创建axios的实例
        this.instance = axios.create(configs)
        //配置拦截器
        this.interceptors()
    }
    //求发送、返回之后做处理
    private interceptors() {
        //求发送之前的处理：求头携带token
        this.instance.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                const store = userSotre();
                const token = store.getToken;
                if (token && config.headers) {
                    config.headers['token'] = token;
                }
                return config;
            },
            (error: any) => {
                // 请求错误一般是网络问题或代码错误，这里简单处理
                console.error("Request Error:", error);
                return Promise.reject(error);
            }
        );

        //求返回之后的拦截器：可以根据后端返回的状态码，做想要提示
        this.instance.interceptors.response.use(
            (res: AxiosResponse<Result>) => {
                const store = userSotre();
                const { code, msg } = res.data;
                if (code === 600) { // 特定业务码：未登录或Token过期
                    ElMessage.warning(msg || "登录状态已过期，请重新登录");
                    store.setToken('');
                    store.setUserId('');
                    localStorage.clear();
                    window.location.href = '/login';
                    return Promise.reject(res.data);
                } else if (code !== 200) { // 业务成功
                    ElMessage.error(msg || '服务器出错!');
                    return Promise.reject(res.data);
                } else return res.data as any; //类型断言
                // return res;
            },
            (error: any) => {
                // HTTP状态码非2xx
                console.error('Response Error:', error);

                // 优先显示后端返回的错误信息
                if (error.response && error.response.data && error.response.data.msg) {
                    ElMessage.error(error.response.data.msg);
                } else {
                    // 如果后端没有返回具体信息，再根据HTTP状态码显示通用信息
                    switch (error.response?.status) {
                        case 400: ElMessage.error('请求参数错误'); break;
                        case 401: ElMessage.error('未授权，请重新登录'); break;
                        case 403: ElMessage.error('拒绝访问'); break;
                        case 404: ElMessage.error('请求的资源不存在'); break;
                        case 500: ElMessage.error('服务器内部错误'); break;
                        default: ElMessage.error('网络错误，请稍后再试');
                    }
                }
                return Promise.reject(error);
            }
        );
    }
    //post求
    post<T = Result>(url:string,data?:object):Promise<T>{
        return this.instance.post(url,data);
    }
    //put求
    put<T = Result>(url:string,data?:object):Promise<T>{
        return this.instance.put(url,data);
    }
    //get求
    get<T = Result>(url:string,params?:object):Promise<T>{
        return this.instance.get(url,{params});
    }
    //delete求
    delete<T = Result>(url:string):Promise<T>{
        return this.instance.delete(url);
    }
    //图片上传
    upload<T = Result>(url: string, params?: object): Promise<T> {
        return this.instance.post(url, params, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}
export default new Http(config)