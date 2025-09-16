import http from "@/http";
//数据类型
export type MakeOrderVisit = {
	visitId: string,
	makeId: string,
	hasVisit:string,
	hasLive:string,
	advice:string
}
//列表查询参数
export type MakeOrderVisitPageParm = {
    currentPage:number,
    pageSize:number,
    total:number,
    name:string,
	timesArea:string,
	doctorId:string
}
//列表
export const getListApi = (parm:MakeOrderVisitPageParm)=>{
    return http.get("/api/makeOrderVisit/getList",parm)
}
//医嘱
export const editApi = (parm:MakeOrderVisit)=>{
    return http.put("/api/makeOrderVisit/edit",parm)
}