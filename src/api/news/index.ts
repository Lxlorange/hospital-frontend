import http from "@/http";
//数据类型
export type News = {
	id: string,
	title: string,
	textDesc: string,
	textContent: string,
	createTime: string,
    image:string
}
//列表查询参数
export type NewsPageParm = {
    currentPage:number,
    pageSize:number,
    total:number,
    keywords:string,
}
//创建
export const addApi =(parm:News)=>{
    return http.post("/api/news/add",parm)
}
//列表
export const getListApi = (parm:NewsPageParm)=>{
    return http.get("/api/news/getList",parm)
}
//修改
export const editApi =(parm:News)=>{
    return http.put("/api/news/edit",parm)
}
//删除
export const deleteApi = (id:string)=>{
    return http.delete(`/api/news/${id}`)
}