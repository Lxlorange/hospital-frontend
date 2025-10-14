import http from "@/http";
import { MenuType } from "./MenuModel";
//获取上级菜单
export const getParentApi = ()=>{
    return http.get("/api/sysMenu/getParent")
}
//创建
export const addApi = (parm:MenuType)=>{
    return http.post("/api/sysMenu",parm)
}
//列表
export const getListApi = ()=>{
    return http.get("/api/sysMenu/list")
}
//修改
export const editApi = (parm:MenuType)=>{
    return http.put("/api/sysMenu",parm)
}
//删除
export const deleteApi = (menuId:string)=>{
    return http.delete(`/api/sysMenu/${menuId}`)
}
//获取菜单数据
export const getMenuListApi = (userId:string)=>{
    return http.get("/api/sysMenu/getMenuList",{userId:userId})
}