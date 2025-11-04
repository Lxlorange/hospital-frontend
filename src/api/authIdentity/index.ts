import http from "@/http"

export const getIdentityRequestApi = async (param: any) => {
    return http.get("/api/auth/list",param);
}

export const approveRequestApi = async (param: any) => {
    return http.get("/api/auth/approve",param);
}

export const rejectRequestApi = async ( param: any ) => {
    return http.post("/api/auth/approve",param)
}