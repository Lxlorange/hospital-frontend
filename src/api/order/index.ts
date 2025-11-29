import http from "@/http";
//数据类型
export type MakeOrder = {
    makeId: string,
    userId: string,
    visitUserId: string,
    visitname:string,
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
    calledTime?: string,
    signInStatus?: string,
    signInTime?: string,
    missed?: string,
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

//历史记录
export type HistoryPageParm = {
    currentPage: number,
    pageSize: number,
    visitUserId: string | number, // 关键参数
    status?: string
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

export const checkInApi = (parm: { makeId: string }) => {
    return http.post("/api/makeOrder/checkIn", parm)
}

// 查询患者全院历史记录
export const getAllHistoryApi = (parm: HistoryPageParm) => {
    return http.get("/api/makeOrder/getAllHistory", parm)
}