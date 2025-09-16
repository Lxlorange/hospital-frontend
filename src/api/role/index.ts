import http from "@/http";
import { RoleListParm, SysRole,SaveMenuParm } from "./RoleModel";
//创建角色
export const addApi = (parm:SysRole)=>{
    return http.post("/api/role",parm)
}
//角色列表
export const getListApi = (parm:RoleListParm)=>{
 return http.get("/api/role/getList",parm)
}
//修改
export const editApi = (parm:SysRole)=>{
    return http.put("/api/role",parm)
}
//删除
export const deleteApi = (roleId:string)=>{
    return http.delete(`/api/role/${roleId}`)
}
//角色下拉
export const getSelectApi = ()=>{
    return http.get("/api/role/selectList")
}
//修改权限保存
export const saveRoleMenuApi = (parm:SaveMenuParm)=>{
    return http.post("/api/role/saveRoleMenu",parm)
}