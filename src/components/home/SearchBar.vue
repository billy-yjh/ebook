<template>
  <div>
    <div class="search-bar" :class="{'hide-title': !titleVisible, 'hide-shadow':!shadowVisible}">
      <transition name="title-move">
        <div class="search-bar-title-wrapper" v-show="titleVisible">
          <div class="title-text-wrapper">
            <span class="title-text title">{{$t('home.title')}}</span>
          </div>
          <div class="title-icon-shake-wrapper" @click="showFlapCard">
            <span class="icon-shake icon"></span>
          </div>
        </div>
      </transition>
      <div class="title-icon-back-wrapper" :class="{'hide-title': !titleVisible}" @click="back">
        <span class="icon-back icon"></span>
      </div>
      <div class="search-bar-input-wrapper" :class="{'hide-title': !titleVisible}">
        <div class="search-bar-blank" :class="{'hide-title': !titleVisible}"></div>
        <div class="search-bar-input">
          <span class="icon-search icon"></span>
          <input class="input" type="text" :placeholder="$t('home.hint')" v-model="searchText" @click="showHotSearch">
        </div>
      </div>
    </div>
    <hot-search-list v-show="hotSearchVisible" ref="hotSearch"></hot-search-list>
  </div>
</template>

<script>
import { storeHomeMixin } from "../../utils/mixin.js";
import HotSearchList from './HotSearchList'
export default {
  mixins: [storeHomeMixin],
  components:{
    HotSearchList
  },
  data() {
    return {
      searchText: "",
      titleVisible: true,
      shadowVisible: false,
      hotSearchVisible:false
    };
  },
  watch: {
    offsetY(offsetY) {
      if (offsetY > 0) {
        this.hideTitle()
        this.showShadow() 
      } else {
        this.showTitle()
        this.hideShadow()
      }
    },
    hotSearchOffsetY(offsetY){
      if(offsetY > 0){
        this.showShadow() 
      }else{
        this.hideShadow()
      }
    }
  },
  methods: {
    showFlapCard(){
      this.setFlapCardVisible(true)
    },
    back(){
      if(this.offsetY > 0){
        this.showShadow()
      }else{
        this.hideShadow()
      }
      this.hideHotSearch()
    },
    showHotSearch(){
      this.hideTitle()
      this.hideShadow()
      this.hotSearchVisible = true
      this.$nextTick(() => {
        this.$refs.hotSearch.reset()
      })
    },
    hideHotSearch(){
      this.hotSearchVisible = false
      if(this.offsetY > 0){
        this.hideTitle()
        this.showShadow
      }else{
        this.showTitle()
        this.hideShadow()
      }
    },
    hideTitle() {
      this.titleVisible = false;
    },
    showTitle() {
      this.titleVisible = true;
    },
    hideShadow() {
      this.shadowVisible = false;
    },
    showShadow() {
      this.shadowVisible = true;
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../assets/styles/global.scss";
.search-bar {
  position: relative;
  width: 100%;
  height: px2rem(94);
  z-index: 150;
  box-shadow: 0 px2rem(2) px2rem(2) rgba(0,0,0,.1);
  &.hide-title {
    height: px2rem(52);
  }
  &.hide-shadow{
    box-shadow: none;
  }
  .search-bar-title-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: px2rem(42);

    .title-text-wrapper {
      width: 100%;
      height: px2rem(42);
      @include center;
    }
    .title-icon-shake-wrapper {
      position: absolute;
      right: px2rem(15);
      top: 0;
      height: px2rem(42);
      @include center;
    }
  }
  .title-icon-back-wrapper {
    position: absolute;
    left: px2rem(15);
    top: 0;
    z-index: 200;
    height: px2rem(42);
    @include center;
    transition: height $animationTime $animationType;
    &.hide-title {
      height: px2rem(52);
    }
  }
  .search-bar-input-wrapper {
    position: absolute;
    top:px2rem(42);
    left: 0;
    width: 100%;
    display: flex;
    height: px2rem(52);
    padding: px2rem(10);
    box-sizing: border-box;
    transition: top $animationTime $animationType;
     &.hide-title {
      top:0;
    }
    .search-bar-blank{
      flex:  0 0 0;
      height: 0px;
      transition: all $animationTime $animationType;
      &.hide-title{
        flex:  0 0 px2rem(31);
        height: px2rem(31);
      }
    }
    .search-bar-input {
      flex: 1;
      background-color: #f4f4f4;
      border-radius: px2rem(20);
      padding: px2rem(5) px2rem(15);
      box-sizing: border-box;
      @include left;
      border: px2rem(1) solid #eee;
      .search-bar {
        color: #999;
      }
      .input {
        width: 100%;
        height: px2rem(22);
        border: none;
        background: transparent;
        margin-left: px2rem(10);
        font-size: px2rem(12);
        color: #ccc;
        &:focus {
          outline: none;
        }
        &::-webkit-input-placeholder {
          color: #ccc;
        }
      }
    }
  }
}
</style>