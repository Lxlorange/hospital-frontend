import {defineStore} from 'pinia'
//定义store:defineStore
export const testSotre = defineStore('testSotre',{
    state:()=>{
        return{
            count:0
        }
    },
    getters:{
        getCount(state){
            return state.count
        }
    },
    actions:{
        setCount(count:number){
            this.count = count;
        }
    }
})