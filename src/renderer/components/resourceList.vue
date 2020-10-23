<template>
    <div class="search-wrap">
        <div class="no-more">暂无更多歌曲哦!</div>
    </div>
</template>
<script>
import {getCloudSearchList} from '@/request/api';
import connect from '../api/bus.js'
export default {
    data(){
        return{

        }
    },
    methods:{
        getResourceList(keywords){
            getCloudSearchList({keywords}).then((result) => {
                console.log(result)
            })
        },
        initListener() {
            connect.$on('searchInfo', (row) => {
                const keywords = row.searchWord;
                this.getResourceList(keywords)
            })
        },
    },
    mounted(){
        this.initListener();
    }
}
</script>
<style lang="less" scoped>
.search-wrap{
    width: 100%;
    height: 100%;
    padding: 20px;
}
</style>