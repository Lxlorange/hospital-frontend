/**
 * 信息确定提示框
 */
import { ElMessageBox } from 'element-plus'
export default function myconfirm(text: string) {
    return new Promise((resolve, reject) => {
        ElMessageBox.confirm(text, '', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
        ).then(() => { //确定按钮
            resolve(true)
        }).catch(() => { //取消
            reject(false)
        })
    }).catch(() => {
        return false;
    })
}