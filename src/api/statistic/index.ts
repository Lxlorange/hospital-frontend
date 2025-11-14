import http, { Result } from "@/http";

export type DateCount = { date: string; count: number };
export type NameCount = { name: string; count: number };

export const getRegistrationTrendApi = (params?: { startDate?: string; endDate?: string }) => {
  return http.get<Result<DateCount[]>>("/api/statistic/registrationTrend", params);
};

export const getVisitTrendApi = (params?: { startDate?: string; endDate?: string }) => {
  return http.get<Result<DateCount[]>>("/api/statistic/visitTrend", params);
};

export const getDepartmentDistributionApi = (params?: { startDate?: string; endDate?: string }) => {
  return http.get<Result<NameCount[]>>("/api/statistic/departmentDistribution", params);
};

export const getDoctorDistributionApi = (params?: { startDate?: string; endDate?: string; limit?: number }) => {
  return http.get<Result<NameCount[]>>("/api/statistic/doctorDistribution", params);
};

export const getTimesAreaDistributionApi = (params?: { startDate?: string; endDate?: string }) => {
  return http.get<Result<NameCount[]>>("/api/statistic/timesAreaDistribution", params);
};

export const getStatusDistributionApi = (params?: { startDate?: string; endDate?: string }) => {
  return http.get<Result<NameCount[]>>("/api/statistic/statusDistribution", params);
};