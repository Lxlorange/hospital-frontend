import http from "@/http";
//数据类型
export type MakeOrder = {
	makeId: string,
	userId: string,
	visitUserId: string,
	doctorId: string,
	times: string,
	timesArea: string,
	week: string,
	createTime: string,
	price: string,
	address: string,
	status: string,
	hasCall: string,
	hasVisit: string,
	hasLive: string,
	advice: string,
}
//列表查询参数
export type MakeOrderPageParm = {
    currentPage:number,
    pageSize:number,
    total:number,
    name:string,
	timesArea:string,
	doctorId:string
}

//删除
export const deleteApi = (makeId:string) => {
    return http.delete(`api/makeOrder/${makeId}`)
}
//查询
export const getListApi = (parm:MakeOrderPageParm) => {
    return http.get("/api/makeOrder/getList",parm)
}

//叫号
export const callVisitApi = (parm:MakeOrder) => {
    return http.post("/api/makeOrder/callVisit",parm)
}