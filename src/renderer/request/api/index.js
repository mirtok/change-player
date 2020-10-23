import instance from '../common/request';  // 将实例导入

/**
 * 获取热门搜索列表
 * @param {Object} params 
 */
export const getHotDetail = (params) => instance.get("search/hot/detail",{params});

/**
 * 传入搜索关键词可获得搜索建议 , 搜索结果同时包含单曲 , 歌手 , 歌单 ,mv 信息
 * @param {Object} params 
 */
export const getSearchSuggest = (params) => instance.get(`search/suggest`,{params});

/**
 * 获取搜索list
 * @param {Object} params 
 */
export const getCloudSearchList = (params) => instance.get(`cloudsearch`,{params});