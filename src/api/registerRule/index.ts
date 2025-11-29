// api/registerRule/index.ts
import http from "@/http";

// 获取允许预约的天数
export const getScheduleQueryDaysApi = async () => {
    return http.get("/wxapi/allApi/config/scheduleQueryDays",{});
};

// 设置允许预约的天数
export const setScheduleQueryDaysApi = async (days: number) => {
    return http.post("/wxapi/allApi/config/scheduleQueryDays", {days});
};

// 获取每日放号时间
export const getScheduleQueryTimeApi = async () => {
    return http.get("/wxapi/allApi/config/scheduleQueryTime",{});
};

// 设置每日放号时间
export const setScheduleQueryTimeApi = async (hours: number, minutes: number) => {
    return http.post(`/wxapi/allApi/config/scheduleQueryTime?hours=${hours}&minutes=${minutes}`,{});
};
