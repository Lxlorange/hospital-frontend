import http from "@/http"

export const requestLeave = (param: any) => {
    return http.post("/api/leaveRequest/requestLeave",param);
}

export const listLeaveRequest = () => {
    return http.get("/api/leaveRequest/list");
}

export const updateLeaveStatus = (requestId: string, status: number, reviewComment: string | null) => {
    return http.post("/api/leaveRequest/approve",{
        requestId,
        status,
        reviewComment
    })
}