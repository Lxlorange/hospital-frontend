import http from "@/http"

export const requestLeave = (param: any) => {
    return http.post("/api/requestLeave",param);
}