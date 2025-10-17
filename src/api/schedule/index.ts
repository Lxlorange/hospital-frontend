// src/api/schedule/index.ts

import http from "@/http";
// 从 department API 文件导入通用类型
import { ApiResponse, SelectType } from "../department";

// ================== 1. 数据模型 (TypeScript Types) ==================

// --- 模板相关类型 ---
export type TemplateSlot = {
  slotId?: string;
  slotType: string;
  totalAmount: number;
}

export type ScheduleTemplate = {
  templateId?: string;
  doctorId: string;
  dayOfWeek: number;
  timeSlot: number;
  slots: TemplateSlot[];
}

// --- 实例相关类型 ---
export type InstanceSlot = {
  instanceSlotId?: string;
  slotType: string;
  totalAmount: number;
  availableAmount: number;
  price: number;
}

export type ScheduleInstance = {
  instanceId: string;
  doctorId: string;
  doctorName: string;
  departmentName: string;
  scheduleDate: string;
  timeSlot: number;
  status: number;
  slots: InstanceSlot[];
}

// --- API 参数类型 ---
export type InstanceQueryParm = {
    startDate: string;
    endDate: string;
    deptId?: string;
    doctorId?: string;
}

// ================== 2. API 请求函数 (已修复返回类型) ==================

// --- 模板管理 API ---
export const getTemplateApi = (doctorId: string) => {
    return http.get<ApiResponse<ScheduleTemplate[]>>(`/api/schedule/template/${doctorId}`);
}

export const saveTemplateApi = (doctorId: string, templates: ScheduleTemplate[]) => {
    return http.post<ApiResponse<null>>(`/api/schedule/template/${doctorId}`, templates);
}

// --- 排班实例 API ---
export const generateInstancesApi = (params: { startDate: string, endDate: string }) => {
    return http.post<ApiResponse<null>>("/api/schedule/instance/generate", params);
}

export const getInstancesApi = (params: InstanceQueryParm) => {
    return http.get<ApiResponse<ScheduleInstance[]>>("/api/schedule/instance", params);
}

export const updateInstanceStatusApi = (instanceId: string, status: number) => {
    return http.put<ApiResponse<null>>(`/api/schedule/instance/${instanceId}/status`, { status });
}

export const addInstanceApi = (instanceData: Omit<ScheduleInstance, 'instanceId'>) => {
    return http.post<ApiResponse<null>>("/api/schedule/instance", instanceData);
}