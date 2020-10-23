<template>
    <div :style="{ color: theme.textColor }" class="header">
        <transition name="router" mode="out-in">
            <About @handlerAboutClick="handlerAboutClick" :isShow="showAbout" />
        </transition>
        <div class="left">
            <span class="fa fa-youtube-play"></span>
            <div @click.stop="showMenu">
                <span ref="title" class="title" v-if="!currentVideo">{{
                    $t('header.title')
                }}</span>
                <span
                    ref="icon"
                    class="fa fa-angle-down my-angle-down"
                    :style="{ 'margin-left': currentVideo ? '10px' : '' }"
                ></span>
            </div>
            <span
                v-if="currentVideo"
                :title="currentVideo.filename"
                class="filename"
                >{{ currentVideo.filename }}</span
            >
            <transition name="router" mode="out-in">
                <ul
                    @click="handlerClick"
                    :style="{ 'background-color': theme.bgColor }"
                    v-if="isShowMenu"
                    class="my-menu"
                >
                    <li
                        :data-title="item.title"
                        v-for="(item, index) in list"
                        :key="index"
                        :class="{ [theme.hover]: true, set: item.set }"
                    >
                        <span :class="item.icion"></span>
                        {{ item.title }}
                    </li>
                </ul>
            </transition>
        </div>
        <!-- middle -->
        <div class="middle" >
           <div class="search-wrap">
               <div @click.stop="searchVioAdi">
                    <el-input placeholder="搜索音乐" v-model="input" size="mini" suffix-icon="fa fa-search" @input="changeInput" />               
                </div>
            <transition name="router" mode="out-in">
                <div class="main-content" v-if="isShowWords">
                    <ul class="menu-word" ref="myHotWrap" v-loading="isLoading">
                        <p class="word-title">热搜榜</p>
                        <li v-for="(item, index) in recomList" :key="index" @click.stop="serachItem(item)">
                            <span :class="{'word-index': true, 'is-hot': index < 3}">{{index + 1}}</span>
                            <div class="word-content">
                                <div class="top-content">
                                    <span class="title">{{item.searchWord}}</span>
                                    <span class="count">{{item.score}}</span>
                                    <i class="fa fa-sign-language" v-if="index < 3"></i>
                                </div>
                                <div class="lack-content">{{item.content}}</div>
                            </div>
                        </li>
                    </ul>
                </div>
            </transition>
           </div>
        </div>
        <!-- right -->
        <div class="right">
            <!-- <span class="fa fa-language" :title="$t('header.lang')" @click="changeLang"></span> -->
            <span
                @click="setAlwaysOnTop(true)"
                v-if="!isAlwaysOnTop"
                :title="$t('header.roof')"
                class="fa fa-hand-o-left"
            ></span>
            <span
                @click="setAlwaysOnTop(false)"
                v-if="isAlwaysOnTop"
                :title="$t('header.cancelRoof')"
                class="fa fa-hand-o-down"
            ></span>
            <span :title="$t('header.user')" class="fa fa-user-o"></span>
            <span
                @click.stop="showTheme"
                :title="$t('header.skin')"
                class="fa fa-tv"
            ></span>
            <span
                @click.stop="showHistory"
                :title="$t('header.record')"
                class="fa fa-clock-o"
            ></span>
            <span
                @click="minWindow"
                :title="$t('header.minimize')"
                class="fa fa-window-minimize"
            ></span>
            <span
                v-if="!isMaxed"
                @click="maxWindow"
                :title="$t('header.Maximization')"
                class="fa fa-window-maximize"
            ></span>
            <span
                v-else
                @click="maxWindow"
                :title="$t('header.reset')"
                class="fa fa-window-restore"
            ></span>
            <span
                @click="close"
                :title="$t('header.close')"
                class="fa fa-close"
            ></span>
            <transition name="router" mode="out-in">
                <div
                    :style="{ 'background-color': theme.bgColor }"
                    v-show="isShowHistory"
                    class="m-history"
                >
                    <div class="history">
                        <div
                            :style="{ 'background-color': theme.bgColor }"
                            class="no-history"
                            v-if="historicalRecords.length == 0"
                        >
                            暂无历史记录
                        </div>
                        <HistoryItem
                            :item="video"
                            v-for="(video, index) in historicalRecords"
                            :key="index"
                        />
                        <div
                            :style="{ 'background-color': theme.bgColor }"
                            v-if="historicalRecords.length != 0"
                            @click="clearHistoricalRecords"
                            class="clear-history"
                        >
                            清空历史记录
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="router" mode="out-in">
                <ul
                    :style="{ 'background-color': theme.bgColor }"
                    v-show="isShowTheme"
                    class="change-skin"
                >
                    <li
                        @click="changeTheme(theme)"
                        :style="{ 'background-image': `url('${theme.bgUrl}')` }"
                        v-for="(theme, index) in themes"
                        :key="index"
                    ></li>
                </ul>
            </transition>
        </div>
        <div v-if="isFullScreen" class="fullScreen-title">
            {{ currentVideo.filename }}
        </div>
        <div class="flexbetween" v-if="isFullScreen">
            <span class="fullScreen-title">{{ time }}</span>
            <span
                class="fullScreen-title exit-fullScreen"
                @click="setFullScreen(false)"
                >退出全屏</span
            >
        </div>
    </div>
</template>

<script>
import { Loading } from 'element-ui';
import {getHotDetail,getSearchSuggest} from '@/request/api'
import WindowUtil from '../api/window'
import { mapGetters, mapMutations } from 'vuex'
import { remote, shell } from 'electron'
import { themes } from '../api/util'
import connect from '../api/bus.js'
const winUtil = new WindowUtil()

export default {
    name: 'my-header',
    data() {
        return {
            // 是否显示最大化
            isMaxed: false,
            // 是否显示左上角的菜单
            isShowMenu: false,
            // 当前时间
            time: null,
            // 是否显示历史记录
            isShowHistory: false,
            // 主题颜色
            themes,
            // 是否显示主题
            isShowTheme: false,
            // 是否显示关于页面
            showAbout: false,
            // 搜索关键字
            input: '',
            // 推荐热门列表
            recomList: [],
            // Loading
            isLoading: false,
            //是否显示搜索栏联想词
            isShowWords: false,
        }
    },
    mounted() {
        this.timer = null
        this.initListener()
    },
    methods: {
        ...mapMutations([
            'setFullScreen',
            'clearHistoricalRecords',
            'setAlwaysOnTop',
            'setTheme'
        ]),
        // 获取监听
        getHotDetailList(){
            this.isLoading = true;
            getHotDetail().then(res => {
                this.isLoading = false;
                this.recomList = res;
            })
        },

        // 监听搜索 显示热搜
        searchVioAdi(e) {
            if (!this.isShowWords) {
                document.body.click()
            }

            this.isShowWords = !this.isShowWords
            connect.$emit('searchClick', e);
            this.$nextTick(()=>{
                this.getHotDetailList();
            })
        },
        // 控制video
        serachItem(item){
            this.input = item.searchWord;
            connect.$emit('searchInfo', item);
        },

        // 监听search值变化
        changeInput(){
            const keywords =  this.input.trim()
            if(!!keywords){
                getSearchSuggest({keywords}).then(res=>{
                    console.log(res)
                })
            }
        },
        // 初始化监听器
        initListener() {
            remote.getCurrentWindow().addListener('maximize', this.maximize)
            remote.getCurrentWindow().addListener('unmaximize', this.unmaximize)
            window.addEventListener('click', this.onClick)
        },
        // 清空监听器
        removeListener() {
            window.removeEventListener('click', this.onClick)
            remote.getCurrentWindow().removeAllListeners()
        },
        maximize() {
            this.isMaxed = true
        },
        unmaximize() {
            this.isMaxed = false
        },
        // 最小化窗口
        minWindow() {
            winUtil.minWindow()
        },
        // 最大化或者还原窗口
        maxWindow() {
            winUtil.maxWindow()
        },
        // 关闭窗口
        close() {
            winUtil.close()
        },
        // 点击左上角播放器文字后显示或者隐藏菜单
        showMenu() {
            // 触发一次点击是因为可能还有其他的菜单在显示，此时需要隐藏其他菜单
            if (!this.isShowMenu) {
                document.body.click()
            }
            // 隐藏左上角的菜单
            this.isShowMenu = !this.isShowMenu
        },
        onClick() {
            this.isShowMenu = false
            this.isShowHistory = false
            this.isShowTheme = false
            this.isShowWords = false;
        },
        getTime() {
            let date = new Date()
            let h = date.getHours()
            let m = date.getMinutes()
            let s = date.getSeconds()
            this.time = `${h}:${m}:${s}`
        },
        showHistory() {
            if (!this.isShowHistory) {
                document.body.click()
            }
            this.isShowHistory = !this.isShowHistory
        },
        changeTheme(theme) {
            this.setTheme(theme)
        },
        showTheme() {
            if (!this.isShowTheme) {
                document.body.click()
            }
            this.isShowTheme = !this.isShowTheme
        },
        handlerClick(e) {
            const title = e.target.dataset.title
            switch (title) {
                case this.$t('header.list.Website'):
                    shell.openExternal('https://github.com/c10342/player')
                    break
                case this.$t('header.list.Exit'):
                    this.close()
                    break
                case this.$t('header.list.About'):
                    this.showAbout = true
                    break
            }
        },
        handlerAboutClick() {
            this.showAbout = false
        },
        // 切换语言
        changeLang() {
            const locale = this.$i18n.locale
            if (locale === 'cn') {
                this.$i18n.locale = 'en'
            } else {
                this.$i18n.locale = 'cn'
            }
        }
    },
    computed: {
        ...mapGetters([
            'isFullScreen',
            'currentVideo',
            'historicalRecords',
            'isAlwaysOnTop',
            'theme'
        ]),
        // 左上角菜单
        list() {
            return [
                {
                    title: this.$t('header.list.Website'),
                    icion: 'fa fa-list-alt',
                    set: false
                },
                {
                    title: this.$t('header.list.Upgrade'),
                    icion: 'fa fa-cloud-upload',
                    set: false
                },
                {
                    title: this.$t('header.list.Help'),
                    icion: 'fa fa-question-circle-o',
                    set: false
                },
                {
                    title: this.$t('header.list.Feedback'),
                    icion: 'fa fa-envelope-open-o',
                    set: false
                },
                {
                    title: this.$t('header.list.Settings'),
                    icion: 'fa fa-cog fa-fw',
                    set: true
                },
                {
                    title: this.$t('header.list.About'),
                    icion: 'fa fa-user-circle',
                    set: false
                },
                {
                    title: this.$t('header.list.Exit'),
                    icion: 'fa fa-sign-out',
                    set: true
                }
            ]
        }
    },
    watch: {
        isFullScreen(newVal) {
            winUtil.setFullScreen(newVal)
            if (newVal) {
                this.timer = setInterval(this.getTime, 1000)
            } else {
                if (this.timer) {
                    clearInterval(this.timer)
                }
            }
        }
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer)
        }
        this.removeListener()
    }
}
</script>

<style lang="less" scoped>

.header {
    /*设置可以拖拽导航栏移动窗口*/
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    height: 50px;
    padding: 0 10px;
    .middle {
        -webkit-app-region: drag;
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        .el-input {
            width: 200px;
            -webkit-app-region: none;
            /deep/ .el-input__inner {
                background: transparent;
                color: #ffffff;
                border-radius: 15px;
            }
        }
        .search-wrap{
            position: relative;
            z-index: 555;
            .main-content{
                position: absolute;
                top: 40px;
                left: 5px;
                min-width: 200px;
                width: 350px;
                max-height: 350px;
                background-color: #ffffff;
                &:before {
                    position: absolute;
                    top: -10px;
                    left: 10px;
                    content: '';
                    height: 0;
                    width: 0;
                    border: 5px solid transparent;
                    border-bottom-color: #ffffff;
                }
            }
            .menu-word{
                padding: 5px 0;
                font-size: 13px;
                color: #b4b4b4;
                z-index: 11;
                width: 100%;
                max-height: 350px;
                overflow-y: scroll;
                .word-title{
                    padding: 10px 15px;
                    font-size: 16px;
                }
                & > li {
                    cursor: pointer;
                    padding: 10px 15px;
                    color: #878788;
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                    .word-content{
                        flex: 1;
                        .top-content{
                            overflow: hidden;
                            padding-bottom: 10px;
                            display: flex;
                            align-items: center;
                            .title{
                                color: #000;
                            }
                            .count{
                                padding-right:15px;
                                padding-left: 15px;
                            }
                            .fa{
                                color: #ff0000;
                            }
                        }
                    }
                    .word-index{
                        padding-right: 20px;
                        font-size: 16px;
                        &.is-hot{
                            color: #ff0000;
                        }
                    }
                }
            }
        }
    }
    .left {
        display: flex;
        flex-direction: row;
        align-items: center;
        .my-menu {
            padding: 5px 0;
            position: absolute;
            font-size: 13px;
            top: 50px;
            left: 5px;
            color: #b4b4b4;
            z-index: 11;
            width: 150px;
            border-radius: 5px;
            &:before {
                position: absolute;
                top: -10px;
                left: 10px;
                content: '';
                height: 0;
                width: 0;
                border: 5px solid transparent;
                border-bottom-color: #ffffff;
            }
            > li {
                cursor: pointer;
                padding: 10px 15px;
                color: #878788;
                position: relative;
                &.set:before {
                    content: '';
                    height: 1px;
                    position: absolute;
                    width: 100%;
                    top: 0;
                    left: 0;
                    background-color: #878788;
                }
                &:hover {
                    color: #5dee00;
                }
            }
        }
        > span:nth-child(1) {
            color: #5dee00;
            font-size: 16px;
        }
        > div {
            position: relative;
            cursor: pointer;
            .title {
                font-size: 16px;
                padding: 0 5px;
            }
            .my-angle-down {
                font-size: 16px;
            }
            &:hover {
                > span {
                    color: #ffffff;
                }
            }
        }
    }
    .toggleLang {
        margin-left: 20px;
        cursor: pointer;
    }
    .right {
        position: relative;
        width: 300px;
        display: flex;
        justify-content: flex-end;
        align-items: center;
        span {
            height: 36px;
            width: 36px;
            text-align: center;
            line-height: 36px;
            cursor: pointer;
            &:hover {
                color: #5dee00;
            }
        }
        .history {
            max-height: 200px;
            width: 300px;
            border-radius: 5px;
            overflow: auto;
            color: #b4b4b4;
        }
    }
}

.filename {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #b0b0b0;
    font-size: 14px;
    padding: 0 10px;
    max-width: 200px;
    cursor: default;
}
.fullScreen-title {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #b0b0b0;
    font-size: 14px;
    padding: 0 10px;
    cursor: default;
}
.exit-fullScreen {
    cursor: pointer;
    &:hover {
        color: #5dee00;
    }
}

.m-history {
    position: absolute;
    top: 37px;
    right: -8px;
    z-index: 20;
    border-radius: 5px;
    &:before {
        position: absolute;
        top: -15px;
        left: 160px;
        width: 0;
        height: 0;
        content: '';
        border: 7px solid transparent;
        border-bottom-color: greenyellow;
    }
}
.clear-history,
.no-history {
    text-align: center;
    font-size: 12px;
    padding: 10px;
}
.clear-history {
    cursor: pointer;
    &:hover {
        color: #5dee00;
    }
}

.change-skin {
    width: 400px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    position: absolute;
    top: 38px;
    z-index: 2;
    right: 0;
    border-radius: 5px;
    &:before {
        position: absolute;
        top: -14px;
        left: 230px;
        width: 0;
        height: 0;
        content: '';
        border: 7px solid transparent;
        border-bottom-color: greenyellow;
    }
    > li {
        width: 113px;
        height: 80px;
        margin: 10px;
        border-radius: 5px;
        cursor: pointer;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
    }
}
</style>