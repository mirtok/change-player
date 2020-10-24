import Vue from 'vue'
import axios from 'axios'
import store from './store'

import i18n from './lang'

import './element-custom/index.css'
import './font-awesome-4.7.0/css/font-awesome.css'
import './base.css'

import { MessageBox, Col, Row ,Input,Icon,Loading,Card,Divider,InfiniteScroll,Avatar} from 'element-ui'


Vue.prototype.$prompt = MessageBox.prompt;

Vue.use(Col)
Vue.use(Row)
Vue.use(Input)
Vue.use(Icon)
Vue.use(Card)
Vue.use(Divider)
Vue.use(Avatar)
Vue.use(Loading)
Vue.use(InfiniteScroll)


import App from './App'
import MyHeader from './components/Header'
import MyVideo from './components/Video'
import MyFooter from './components/Footer'
import PlayList from './components/PlayList'
import MyProgress from './components/Progress'
import VideoProgress from './components/VideoProgress'
import ListItem from './components/ListItem'
import HistoryItem from './components/HistoryItem'
import About from './components/About'
import FileInfo from './components/FileInfo'

Vue.component('MyHeader', MyHeader)
Vue.component('MyVideo', MyVideo)
Vue.component('MyFooter', MyFooter)
Vue.component('PlayList', PlayList)
Vue.component('MyProgress', MyProgress)
Vue.component('VideoProgress', VideoProgress)
Vue.component('ListItem', ListItem)
Vue.component('HistoryItem', HistoryItem)
Vue.component('About', About)
Vue.component('FileInfo', FileInfo)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.prototype.$http = axios
Vue.config.productionTip = false

import { ipcRenderer } from 'electron'
import storage from 'good-storage'

// 窗口关闭前,保存store中的状态，以便下次打开恢复上次的状态
ipcRenderer.on('close', () => {
    storage.set('locale',i18n.locale)
    if (store.state.currentVideo && !store.state.isTrace) {
        storage.set('state', Object.assign({}, store.state, { currentVideo: { ...store.state.currentVideo, currentTime: store.state.currentTime, speed: store.state.speed } }))
    } else {
        storage.set('state', store.state)
    }
})

// 解决警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'


new Vue({
    components: { App },
    template: '<App/>',
    store,
    i18n
}).$mount('#app')

