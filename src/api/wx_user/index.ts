import http from "@/http";
//数据类型
export type WxUser = {
	userId: string,
	userName: string,
	nickName: string,
	phone: string,
	sex: string,
	name: string,
	image: string,
	status: string,
	password: string,
}
//列表查询参数
export type WxUserPageParm = {
    currentPage:number,
    pageSize:number,
    total:number,
    name:string
}
//开关按钮参数类型
export type SwitchParm = {
    userId:string;
    status:boolean;
}
//删除
export const deleteApi = (id:string)=>{
    return http.delete(`/api/wxUser/${id}`)
}
//列表
export const getListApi = (parm:WxUserPageParm)=>{
    return http.get("/api/wxUser/getList",parm)
}
//启用停用用户
export const enabledApi = (parm:SwitchParm)=>{
    return http.post("/api/wxUser/enabledUser",parm)
} 
//启用停用用户
export const resetPasswordApi = (userId:string)=>{
    return http.post("/api/wxUser/resetPassword",{"userId":userId})
}