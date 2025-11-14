import http from "@/http";

export const getDoctorPendingApi = (doctorId: string, name?: string) => {
  return http.get("/api/waitlist/doctorPending", { doctorId, name });
};

export const allocateWaitlistApi = (scheduleId: string) => {
  return http.post(`/wxapi/allApi/waitlist/allocate?scheduleId=${scheduleId}`);
};

export const getAllWaitlistApi = (params?: { status?: string; name?: string; doctorId?: string }) => {
  return http.get("/api/waitlist/list", params);
};