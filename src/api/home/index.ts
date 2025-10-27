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
//加号过程
export const addConsultationApi = (scheduleId: string, visitUserId: string,
    userId: string, reason: string | null
) => {
    return http.post("/api/addSlotRequest/submit",{
        scheduleId,
        userId,
        visitUserId,
        reason
    });
}

export const getPatientsApi = (name: string) => {
    return http.get("/api/addSlotRequest/patientOptions",
        {
            name
        }
    )
}

export const getScheduleIdApi = (date: string, time: string, doctorId: string) => {
    return http.get("/api/home/getScheduleId",
        {
            date,
            time,
            doctorId
        }
    );
}