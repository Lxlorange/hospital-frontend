//定义用户数据类型
export type User = {
    userId: string,
    username: string,
    password: string,
    phone: string,
    email: string,
    sex: string,
    nickName: string,
    roleId: string,
    deptId: string,
    deptName: string,
    education: string,
    jobTitle: string,
    image: string,
    introduction: string,
    visitAddress: string,
    toHome: string,
    goodAt: string,
    price:string
}
//列表参数类型
export type UserListParm = {
    phone:string;
    nickName:string;
    currentPage:number;
    pageSize:number;
    total:number;
}
//登录
export type Login = {
    username:string;
    password:string;
    code:string;
}
//菜单树参数
export type AssignParm = {
    roleId:string;
    userId:string;
}
//修改信息参数
export type UpdateParm = {
    userId:string;
    oldPassword:string;
    password:string;
}
//开关按钮参数类型
export type SwitchParm = {
    userId:string;
    enabled:boolean;
}