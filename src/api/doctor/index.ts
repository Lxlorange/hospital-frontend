import http from "@/http";

// 获取医生信息
export const getDoctorInfoApi = async (doctorId: string) => {
    return http.get("/api/doctorProfile/getDoctorProfile",{doctorId});
}

// 提交医生信息
export const updateDoctorInfoApi = async () => {

}

// 获取医生修改信息的请求
export const getUpdateRequestsApi = async () => {

}

// 提交对医生请求的反馈
export const approveRequestApi = async (id: number) => {

}

export const rejectRequestApi = async (id: number) => {

}