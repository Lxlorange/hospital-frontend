import http from "@/http";
//定义科室类型
export type Department = {
    deptId:string;
    deptName:string;
    phone:string;
    toHome:string;
    orderNum:string;
}
//创建科室
export const addApi = (parm:Department)=>{
    return http.post("/api/department",parm)
}
//列表参数类型
//列表查询参数
export type DepartmentPageParm = {
    currentPage:number,
    pageSize:number,
    deptName: string,
    total?:number
}
//查询列表
export const getListApi = (parm:DepartmentPageParm)=>{
    return http.get("/api/department/getList",parm)
}
//修改科室
export const editApi = (parm:Department)=>{
    return http.put("/api/department",parm)
}
//删除科室
export const deleteApi = (deptId:string)=>{
    return http.delete(`/api/department/${deptId}`)
}
//科室下拉列表
export const getSelectDeptApi = () => {
    return http.get("/api/department/getSelectDept")
}