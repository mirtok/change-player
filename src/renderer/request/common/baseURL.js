let baseUrl = "";

if(process.env.NODE_ENV === 'production'){  
    baseUrl = 'http://www.lxit365.com/capi/' // 生产环境
}else{
    baseUrl = 'http://www.lxit365.com/capi/' // 开发环境
}

export default baseUrl;
