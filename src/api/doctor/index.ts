import http from "@/http";
import { DoctorType } from './DoctorModel';

// 获取医生信息
export const getDoctorInfoApi = async (doctorId: string) => {
    return http.get("/api/doctorProfile/getDoctorProfile",{doctorId});
}

// 提交医生信息
export const updateDoctorInfoApi = async (changeData: DoctorType) => {
    return http.post("/api/doctorProfile/updateMyProfile",changeData);
}

// 获取医生修改信息的请求
export const getUpdateRequestsApi = async () => {
    return http.get("/api/doctorUpdateRequest/list");
}

// 提交对医生请求的反馈
export const approveRequestApi = async (id: number, status: number | string | null, 
    reviewComment: string | null | undefined) => {
    return http.get("/api/doctorUpdateRequest/review",{
        requestId: id,
        status,
        reviewComment
    })
}
