import http from "@/http";
//数据中台统计
export const getHomeTotalApi = () => {
    return http.get("/api/home/getHomeTotal")
}
//数据中台信息
export const getIndexNoticeApi = () => {
    return http.get("/api/home/getIndexNotice")
}
//数据中台排班
export const getMyScheduleApi = (parm:any) => {
    return http.get("/api/home/getMySchedule",parm)
}
//添加号源
export const addConsultationApi = (parm: any) => {
    return http.get("/api/home/addConsultation",parm);
}