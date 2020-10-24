<template>
<div class="search-wrap">
    <div class="left-search">
        <div class="data-empty" v-if="dataList.length == 0">暂无更多歌曲哦!</div>
        <div v-else class="data-list">
            <el-card class="box-card" :body-style="{padding: '10px 10px 0 10px'}">
                <div slot="header" class="card-header">
                    <span>搜索结果({{count}})</span>
                    <span @click="close" :title="$t('header.close')" class="fa fa-close"></span>
                </div>
                <div class="s-wrap" v-infinite-scroll="loadMore">
                    <ul class="infinite-list">
                        <li class="infinite-list-item" v-for="(item,index) in dataList" :key="index" :data-id="item.id" @dblclick.stop="qucikPalyer(item.id)">
                            <div class=" song-info">
                                <el-avatar size="medium" :src="item['artists'][0].img1v1Url">
                                    <img src=" https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png" />
                                </el-avatar>
                                <p class="item-songs-name">{{item.name}}</p>
                                <p class="item-songs-arts" v-for="(citem,i) in item['artists']" :key="i">
                                    <span>{{citem.name}}</span>{{ i < item['artists'].length - 1 ? '-' : ''}}
                                </p>
                            </div>
                            <div class="song-action"></div>
                        </li>
                    </ul>
                    <div class="loading-wrap" v-if="hasMore" v-loading="loading" element-loading-text="努力加载中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.2)">
                    </div>
                    <div v-if="!hasMore" class="no-more text-center">没有更多了</div>
                </div>
            </el-card>

        </div>
    </div>
    <div class="right-hot-list">
        2135
    </div>
</div>
</template>

<script>
import {
    getCloudSearchList,
    getCloudSongDetail,
    getCloudSongUrl
} from '@/request/api';
import connect from '../api/bus.js'

import OpenDialog from '../api/OpenDialog'
const openDialog = new OpenDialog()
export default {
    data() {
        return {
            keywords: '',
            dataList: [],
            offset: 1,
            count: 50,
            loading: false,
            hasMore: true
        }
    },
    methods: {
        getResourceList(data) {
            getCloudSearchList(data).then(result => {
                if (result.songs && result.songs.length != 0) {
                    const currentList = this.dataList;
                    this.count = result.songCount;
                    this.dataList = currentList.concat(result.songs);
                    this.hasMore = result.hasMore;
                } else {
                    this.hasMore = false;
                    this.loading = false;
                }
            })
        },
        initListener() {
            connect.$on('searchInfo', (row) => {
                this.keywords = row;
                this.offset = 1;
                this.dataList = [];
                this.getResourceList({
                    keywords: this.keywords,
                    offset: this.offset
                })
            })
        },
        loadMore() {
            this.hasMore = true;
            this.loading = true;
            this.getMoreFn()
        },
        getMoreFn() {
            this.offset++;
            this.getResourceList({
                keywords: this.keywords,
                offset: this.offset
            })
        },
        close() {
            connect.$emit('closeSearchView')
        },
        async qucikPalyer(id) {
            let res1 = await getCloudSongDetail({ ids: id})
            let res2 = await getCloudSongUrl({id: id})
            let obj = new Object();
            obj.createTime =  + new Date;
            obj.currentTime = 0;
            obj.src = res2[0].url;
            obj.id = res2[0].url;
            obj.isPlaying = false,
            obj.filename = res1['songs'][0]['name'];
            obj.size = res2[0].size;
            obj.mode = 'url';
            obj.speed = 1;
            obj.msg = '';
            obj.img = res1['songs'][0]['al'].picUrl;
            obj.art = res1['songs'][0]['ar'][0].name;
            let arr = [];
            arr.push(obj)
            openDialog.changeStore(arr);
        },

        getfilesize(size) {
            if (!size) return "";
                let num = 1024.00;
            if (size < num)
                return size + "B";
            if (size < Math.pow(num, 2))
                return (size / num).toFixed(2) + "K"; //kb
            if (size < Math.pow(num, 3))
                return (size / Math.pow(num, 2)).toFixed(2) + "M"; //M
            if (size < Math.pow(num, 4))
                return (size / Math.pow(num, 3)).toFixed(2) + "G"; //G
            return (size / Math.pow(num, 4)).toFixed(2) + "T"; //T
        }
    },
    mounted() {
        this.initListener();
    }
}
</script>

<style lang="less" scoped>
.text-center {
    text-align: center;
}

.search-wrap {
    width: 100%;
    height: 100%;
    padding: 20px 30px;
    box-sizing: border-box;
    display: flex;

    .left-search {
        flex: 1;
        height: 100%;

        .data-list {
            width: 100%;
            height: 100%;

            .el-card {
                .card-header {
                    width: 100%;
                    display: flex;
                    justify-content: space-between;
                }

                &:extend(.data-list);
                color: #ffffff;
                background-color: rgba(0, 0, 0, 0.3);
                border: none;

                /deep/ .el-card__header {
                    border-bottom: 1px solid #dcdfe6;
                }

                .s-wrap {
                    width: 100%;
                    height: calc(100vh - 220px);
                    overflow-y: scroll;

                    .no-more {
                        width: 100%;
                        height: 50px;
                        line-height: 50px;
                    }

                    .loading-wrap {
                        width: 100%;
                        height: 50px;
                    }

                    &::-webkit-scrollbar-track-piece {
                        background-color: transparent;
                        -webkit-border-radius: 6px;
                    }

                    &::-webkit-scrollbar-thumb {
                        height: 5px;
                        background-color: #474C75;
                        -webkit-border-radius: 6px;
                    }

                    .infinite-list {
                        padding: 0 15px;

                        .infinite-list-item {
                            display: flex;
                            padding: 15px 0;
                            align-items: center;
                            border-bottom: 1px solid rgba(220, 223, 230, .3);
                            cursor: pointer;

                            .song-info {
                                flex: 1;
                                display: flex;
                                align-items: center;

                                .item-songs-img {
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 20px;
                                }

                                .item-songs-name {
                                    padding: 0 30px;
                                }
                            }

                            .song-action {
                                width: 150px;
                                text-align: right;
                            }
                        }
                    }
                }
            }
        }
    }

}
</style>
