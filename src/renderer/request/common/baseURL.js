let baseUrl = "";

if(process.env.NODE_ENV === 'production'){  
    baseUrl = 'http://www.lxit365.com/neteseApi/' // 生产环境
}else{
    baseUrl = 'http://127.0.0.1:9999/' // 开发环境
}

export default baseUrl;
