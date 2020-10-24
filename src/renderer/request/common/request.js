import axios from 'axios';
import baseUrl from './baseURL'
import {remote} from 'electron'

/**
 * 构建axios实例
 */
const instance = axios.create({
	baseURL: baseUrl,  // 该处url会根据开发环境进行变化（开发/发布）
	timeout: 10000  // 设置请求超时连接时间
})

/**
 * 请求拦截
 */
instance.interceptors.request.use(
	config => {
		return config 
	},
	error => {
	    return;
	}
)


/**
 * 响应拦截
 */
instance.interceptors.response.use(
	response => { 
        const res = response.data
		if (res.code == 200) {
            if(res.data){
                return res.data
            }else if(res.result){
                return res.result
            }
            return res
		} else {
            remote.dialog.showMessageBox({
                type: 'error',
                title: 'error',
                message: res.code
            })
		}
	},
	error => {
        remote.dialog.showMessageBox({
            type: 'error',
            title: 'error',
            message: "数据处理超时"
        })
	}
)



export default instance;