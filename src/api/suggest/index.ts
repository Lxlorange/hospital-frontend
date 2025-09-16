import http from "@/http";
//列表查询的参数
export type ListParm = {
    currentPage: number;
    pageSize: number;
    name: string;
    total: number;
}
//角色列表
export const getListApi = (parm: ListParm) => {
    return http.get("/api/suggest/getList", parm)
}

//删除
export const deleteApi = (id: string) => {
    return http.delete(`/api/suggest/${id}`)
}