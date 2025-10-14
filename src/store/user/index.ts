import {defineStore} from 'pinia'
import { getInfoApi } from '@/api/user'
//定义store:defineStore
export const userSotre = defineStore('userSotre',{
    state:()=>{
        return{
            userId:'',
            nickName:'',
            token:'',
            codeList:[],
            type:''
        }
    },
    getters:{
        getUserId(state){
            return state.userId
        },
        getNickName(state){
            return state.nickName;
        },
        getToken(state){
            return state.token;
        },
        getCodeList(state){
            return state.codeList
        },
        getType(state){
            return state.type
        }
    },
    actions:{
        setUserId(userId:string){
            this.userId = userId;
        },
        setNickName(nickName:string){
            this.nickName = nickName;
        },
        setToken(token:string){
            this.token = token;
        },
        setType(type:string){
            this.type = type;
        },
        getInfo(){
            return new Promise((resolve,reject)=>{
                getInfoApi(this.userId).then((res)=>{
                    if(res && res.code == 200){
                        this.codeList = res.data.permissons
                    }
                    resolve(this.codeList)
                }).catch((error)=>{
                    reject(error)
                })
            })
        }
    },
    persist: {
        enabled: true,
        strategies: [
            { storage: sessionStorage, paths: ['userId','nickName','token','type'] }
        ]
    }
})