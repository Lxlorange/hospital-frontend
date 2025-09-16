import http from "@/http";
//数据类型
export type ScheduleDetail = {
	detailId: string,
	scheduleId: string,
	doctorId: string,
	times: string,
	week: string,
	witchWeek: string,
	type: string,
	amount: number,
    lastAmount:number,
	doctorName: string
}
//列表查询参数
export type ScheduleDetailPageParm = {
    currentPage:number,
    pageSize:number,
    total:number
}
//下拉数据类型
export type SelectType = {
	label:string;
	value:number;
}
//数据类型
export type Schedule = {
	scheduleId: string,
	doctorId: string,
	doctorName: string,
	departmentName: string,
	weekOneM: number,
	weekTwoM: number,
	weekThreeM: number,
	weekFourM: number,
	weekFiveM: number,
	weekSixM: number,
	weekZeroM: number,
	weekOne: string,
	weekTwo: string,
	weekThree: string,
	weekFour: string,
	weekFive: string,
	weekSix: string,
	weekZero: string,
	week: string,
	details:ScheduleDetail[]
}
//列表查询参数
export type SchedulePageParm = {
    currentPage:number,
    pageSize:number,
    total?:number,
	doctorName:string,
}

//排班保存
export const scheduleAddApi = (parm:any) => {
    return http.post("/api/scheduleDetail/add",parm)
}
//查询列表
export const getListApi = (parm:SchedulePageParm)=>{
    return http.get("/api/scheduleDetail/getList",parm)
}
//排班修改
export const scheduleEditApi = (parm:any) => {
    return http.put("/api/scheduleDetail/edit",parm)
}
//删除排班
export const delListApi = (parm:any) => {
    return http.post("/api/scheduleDetail/delList",parm)
}
//排班删除
export const scheduleDeleteApi = (scheduledetailId:string) => {
    return http.delete(`/api/scheduleDetail/${scheduledetailId}`)
}