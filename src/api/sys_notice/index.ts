import http from "@/http";
//创建数据类型
export type SysNotice ={
    noticeId:string;
    noticeTitle:string;
    noticeText:string;
}
//创建
export const addApi = (parm:SysNotice)=>{
    return http.post("/api/sysNotice",parm)
}
//列表参数类型
export type SysNoticePageParm ={
    currentPage:number;
    pageSize:number;
    noticeTitle:string;
    total:number;
}
//列表
export const getListApi = (parm:SysNoticePageParm)=>{
    return http.get("/api/sysNotice/getList",parm)
}
//修改
export const editApi = (parm:SysNotice)=>{
    return http.put("/api/sysNotice",parm)
}
//删除
export const deleteApi = (noticeId:string)=>{
    return http.delete(`/api/sysNotice/${noticeId}`)
}