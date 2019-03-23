<template>
  <div class="flap-card-wrapper" v-show="flapCardVisible">
    <div class="flap-card-bg" :class="{'animation':runFlapCardAnimation}" v-show="runFlapCardAnimation"> 
      <div class="point-wrapper">
        <div class="point" :class="{'animation':runPointAnimation}" v-for="(item) in pointList" :key="item"></div>
      </div>
      <div
        class="flap-card"
        v-for="(item, index) in flapCardList"
        :key="index"
        :style="{zIndex:item.zIndex}"
      >
        <div class="flap-card-circle">
          <div
            class="flap-card-semi-circle flap-card-semi-circle-left"
            :style="semiCircleStyle(item,'left')"
            ref="left"
          ></div>
          <div
            class="flap-card-semi-circle flap-card-semi-circle-right"
            :style="semiCircleStyle(item,'right')"
            ref="right"
          ></div>
        </div>
      </div>
    </div>
    <div class="book-card" :class="{'animation':runBookCardAnimation}" v-show="runBookCardAnimation">
      <div class="book-card-wrapper">
        <div class="img-wrapper">
          <img class="img" :src="data ? data.cover : ''">
        </div>
        <div class="content-wrapper">
          <div class="content-title">{{data ? data.title : ''}}</div>
          <div class="content-author sub-title-medium">{{data ? data.author : ''}}</div>
          <div class="content-category">{{categroyText()}}</div>
        </div>                <!--click.stop 为阻止事件冒泡-->
        <div class="read-btn" @click.stop="showBookDetail(data)">{{$t('home.readNow')}}</div>
      </div>
    </div>
    <div class="close-btn-wrapper" @click="close">
      <div class="icon-close"></div>
    </div>
  </div>
</template>

<script>
import { storeHomeMixin } from "../../utils/mixin.js";
import { flapCardList, categoryText } from "../../utils/store.js";
export default {
  mixins: [storeHomeMixin],
  props:{
    data:Object
  },
  data() {
    return {
      flapCardList,
      front: 0,
      back: 1,
      intervalTime: 25,
      runFlapCardAnimation:false,
      pointList:null,
      runPointAnimation:false,
      runBookCardAnimation: false
    };
  },
  watch: {
    flapCardVisible(v){
      if(v){
        this.runAnimation()
      }
    }
  },
  methods: {
    close() {
      this.stopAnimation()
      this.setFlapCardVisible(false);
    },
    semiCircleStyle(item, dir) {
      return {
        backgroundColor: `rgb(${item.r},${item.g},${item.b})`,
        backgroundSize: item.backgroundSize,
        backgroundImage: dir === "left" ? item.imgLeft : item.imgRight
      };
    },
    rotate(index, type) {
      //获取属性值
      const item = this.flapCardList[index];
      //获取dom
      let dom;
      if (type === "front") {
        dom = this.$refs.right[index];
      } else {
        dom = this.$refs.left[index];
      }
      // 获取旋转角度 和 颜色
      dom.style.transform = `rotateY(${item.rotateDegree}deg)`;
      dom.style.backgroundColor = `rgb(${item.r},${item._g},${item.b})`;
    },
    flapCardRotate() {
      const frontFlapCard = this.flapCardList[this.front];
      const backFlapCard = this.flapCardList[this.back];
      frontFlapCard.rotateDegree += 10;
      frontFlapCard._g -= 5;
      backFlapCard.rotateDegree -= 10;
      // 当backFlapCard 角度小于90度的时候 此时才显示 此时颜色变淡
      if(backFlapCard.rotateDegree < 90){
        backFlapCard._g += 5;
      }
      // 前面的卡片转动到90度   后面的卡片也转动到90度
      if (frontFlapCard.rotateDegree === 90 && backFlapCard.rotateDegree === 90) {
        backFlapCard.zIndex += 2;
      }
      this.rotate(this.front, "front");
      this.rotate(this.back, "back");
      //前面那张已经完全翻转过去    后面那张已经归位
      if(frontFlapCard.rotateDegree === 180 && backFlapCard.rotateDegree === 0){
        this.next()
      }
    },
    next(){
      // 获取到元素
      const frontFlapCard = this.flapCardList[this.front]
      const backFlapCard = this.flapCardList[this.back]
      // 归位处理
      frontFlapCard.rotateDegree = 0
      backFlapCard.rotateDegree = 0
      frontFlapCard._g = frontFlapCard.g
      backFlapCard._g = backFlapCard.g
      this.rotate(this.front,'front')
      this.rotate(this.back,'back')
      this.front++
      this.back++
      const len = this.flapCardList.length
      // 判断是否溢出
      if(this.front >= len){
        this.front = 0
      }
      if(this.back >= len){
        this.back = 0
      }
      this.flapCardList.forEach((item,index) => {
        item.zIndex = 100 - ((index - this.front + len) % len)
      })
      this.prepare()
    },
    // 让左边半圆和右边半圆重叠
    prepare(){
      const backFlapCard = this.flapCardList[this.back]
      backFlapCard.rotateDegree = 180
      backFlapCard._g = backFlapCard.g - 5 * 9
      this.rotate(this.back,'back')
    },
    //翻转卡片的动画
    startFlapCardAnimation() {
      this.prepare()
      this.task = setInterval(() => {
        this.flapCardRotate()
      }, this.intervalTime);
    },
    stopAnimation(){
      if(this.task){
        clearInterval(this.task)
      }
      if(this.timeout){
        clearTimeout(this.timeout)
      }
      if(this.timeout2){
        clearTimeout(this.timeout2)
      }
      this.reset()
    },
    reset(){
      this.front = 0
      this.back = 1
      this.flapCardList.forEach((item,index) => {
        item._g = item.g
        item.rotateDegree = 0
        item.zIndex = 100 - index
        this.rotate(index, "front");
        this.rotate(index, "back");
      })
      this.runFlapCardAnimation = false
      this.runBookCardAnimation = false
      this.runPointAnimation = false
    },
    runAnimation(){
      this.runFlapCardAnimation = true
      this.timeout = setTimeout(() => {
        this.startFlapCardAnimation()
        this.startPointAnimation()
      },300)
      this.timeout2 = setTimeout(() => {
        this.stopAnimation()
        this.runBookCardAnimation = true
      },2500) 
    },
    startPointAnimation(){
      this.runPointAnimation = true
      setTimeout(() => {
        this.runPointAnimation = false
      },750)
    },
    categroyText(){
      if(this.data){
        //接收两个参数 id 和 vue
        return categoryText(this.data.category,this)
      } else {
        return ''
      }
    }
  },
  created() {
    this.pointList = []
    for(let i = 0; i < 18; i++){
      this.pointList.push(`point${i}`)
    }
  },
};
</script>
<style lang="scss" scoped>
@import "../../assets/styles/global.scss";
@import '../../assets/styles/flapCard.scss';
.flap-card-wrapper {
  @include center;
  @include absCenter;
  z-index: 1000;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  .close-btn-wrapper {
    position: absolute;
    left: 0;
    bottom: px2rem(30);
    z-index: 1100;
    width: 100%;
    @include center;
    .icon-close {
      width: px2rem(45);
      height: px2rem(45);
      font-size: px2rem(25);
      border-radius: 50%;
      background: #333;
      color: white;
      @include center;
    }
  }
  .flap-card-bg {
    position: relative;
    width: px2rem(64);
    height: px2rem(64);
    background: white;
    border-radius: px2rem(5);
    transform: scale(0);
    opacity: 0;
    &.animation{
      animation: flap-card-move .3s ease-in both;
    }
    @keyframes flap-card-move {
      0%{
        transform: scale(0);
        opacity: 0
      }
      50%{
        transform: scale(1.2);
        opacity: 1;
      }
      75%{
        transform: scale(.9);
        opacity: 1;
      }
      100%{
        transform: scale(1);
        opacity: 1;
      }
    }
    .flap-card {
      @include absCenter;
      width: px2rem(48);
      height: px2rem(48);
      .flap-card-circle {
        display: flex;
        widows: 100%;
        height: 100%;
        .flap-card-semi-circle {
          flex: 0 0 50%;
          width: 50%;
          height: 100%;
          background-color: orange;
          background-repeat: no-repeat;
          backface-visibility: hidden; /*翻转到背后隐藏*/
        }
        .flap-card-semi-circle-left {
          border-radius: px2rem(24) 0 0 px2rem(24);
          background-position: center right;
          transform-origin: right;
        }
        .flap-card-semi-circle-right {
          border-radius: 0 px2rem(24) px2rem(24) 0;
          background-position: center left;
          transform-origin: left;
        }
      }
    }
    .point-wrapper{
      z-index: 1500;
      @include absCenter;
      .point{
        border-radius: 50%;
        @include absCenter;
        &.animation{
          /*scss循环 $i为变量 length为获取长度的方法*/
          @for $i from 1 to length($moves){
            &:nth-child(#{$i}){
              @include move($i)
            }
          }
        }
      }
    }
  }
  .book-card {
      position: relative;
      width: 65%;
      max-width: px2rem(400);
      box-sizing: border-box;
      border-radius: px2rem(15);
      background: white;
      &.animation {
        animation: scale .3s ease-in both;
        @keyframes scale {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      }
      .book-card-wrapper {
        width: 100%;
        height: 100%;
        margin-bottom: px2rem(30);
        @include columnTop;
        .img-wrapper {
          width: 100%;
          margin-top: px2rem(20);
          @include center;
          .img {
            width: px2rem(90);
            height: px2rem(130);
          }
        }
        .content-wrapper {
          padding: 0 px2rem(20);
          margin-top: px2rem(20);
          .content-title {
            color: #333;
            font-weight: bold;
            font-size: px2rem(18);
            line-height: px2rem(20);
            max-height: px2rem(40);
            text-align: center;
            @include ellipsis2(2)
          }
          .content-author {
            margin-top: px2rem(10);
            text-align: center;
          }
          .content-category {
            color: #999;
            font-size: px2rem(14);
            margin-top: px2rem(10);
            text-align: center;
          }
        }
        .read-btn {
          position: absolute;
          bottom: 0;
          left: 0;
          z-index: 1100;
          width: 100%;
          border-radius: 0 0 px2rem(15) px2rem(15);
          padding: px2rem(15) 0;
          text-align: center;
          color: white;
          font-size: px2rem(14);
          background: $color-blue;
        }
      }
    } 
}
</style>