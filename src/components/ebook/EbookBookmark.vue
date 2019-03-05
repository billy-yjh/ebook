<template>
  <div class="ebook-bookmark" ref="bookmark">
    <div class="ebook-bookmark-text-wrapper">
      <div class="ebook-bookmark-down-wrapper" ref="iconDown">
        <span class="icon-down"></span>
      </div>
      <div class="ebook-bookmark-text">{{text}}</div>
    </div>
    <div class="ebook-bookmark-icon-wrapper" :style="isFixed ? fixStyle : {}">
      <bookmark :color="color" :width="15" :height="40"></bookmark>
    </div>
  </div>
</template>

<script>
import { ebookMixin } from "../../utils/mixin.js";
import { realPx } from "../../utils/utils.js";
import Bookmark from "../common/Bookmark";
import { getBookmark ,saveBookmark } from '../../utils/localStorage.js';
const BLUE = "#346cbc";
const WHITE = "#fff";
export default {
  mixins: [ebookMixin],
  data() {
    return {
      text: "",
      color: WHITE,
      isFixed:false
    };
  },
  components: {
    Bookmark
  },
  watch: {
    offsetY(v) {
      if(!this.bookAvailable || this.menuVisible || this.settingVisible >= 0){
        return false
      }
      if (v >= this.height && v < this.threshold) {
        this.beforeThreshold(v)
      } else if (v >= this.threshold) {
        this.afterThreshold(v)
      } else if (v > 0 && v < this.height){
        this.beforeHeight()
      } else if( v === 0){
        this.restore()
      }
    },
    isBookmark(isBookmark){
      if(isBookmark){
        this.color = BLUE
        this.isFixed = true
      } else {
        this.color = WHITE
        this.isFixed = false
      }
    }
  },
  computed: {
    height() {
      return realPx(35);
    },
    threshold() {
      return realPx(55);
    },
    fixStyle(){
      return {
        position: 'fixed',
        top: 0,
        right:`${(window.innerWidth - this.$refs.bookmark.clientWidth) / 2}px`
      }
    }
  },
  methods: {
    addBookmark(){
      this.bookmark = getBookmark(this.fileName)
      if(!this.bookmark){
        this.bookmark = []
      }
      const currentLocation = this.currentBook.rendition.currentLocation()
      const cifbase = currentLocation.start.cfi.replace(/!.*/,'')
      const cifstart = currentLocation.start.cfi.replace(/.*!/,'').replace(/\)$/,'')
      const cfiend = currentLocation.end.cfi.replace(/.*!/,'').replace(/\)$/,'') 
      const cfirange = `${cifbase}!,${cifstart},${cfiend})`
      this.currentBook.getRange(cfirange).then(range => {
        const text = range.toString().replace(/\s\s/g,'')
        this.bookmark.push({
          cfi:currentLocation.start.cfi,
          text:text
        })
        saveBookmark(this.fileName,this.bookmark)
      })
    },
    removeBookmark(){
      const currentLocation = this.currentBook.rendition.currentLocation()
      const cfi = currentLocation.start.cfi
      this.bookmark = getBookmark(this.fileName)
      if(this.bookmark){
        this.bookmark = this.bookmark.filter(item => item.cfi !== cfi)
        saveBookmark(this.fileName,this.bookmark)
        this.setIsBookmark(false)
      }
    },
    restore(){
      //复原
      setTimeout(() => {
        this.$refs.bookmark.style.top = `${-this.height}px`
        this.$refs.iconDown.transform = 'rotate(0deg)'
      },200)
      if(this.isFixed){
        this.setIsBookmark(true)
        this.addBookmark()
      }else{
        this.setIsBookmark(false)
        this.removeBookmark()
      }
    },
    beforeHeight(){
      //状态一 未超过书签的高度
      if (this.isBookmark) {
        this.color = BLUE;
        this.text = this.$t("book.pulldownDeleteMark");
        this.isFixed = true
      } else {
        this.color = WHITE;
        this.text = this.$t("book.pulldownAddMark");
        this.isFixed = false
      }
    },
    beforeThreshold(v) {
      // 状态二 未达到临界状态
      this.$refs.bookmark.style.top = `${-v}px`;
      this.beforeHeight()
      const iconDown = this.$refs.iconDown;
      if (iconDown.style.transform === "rotate(180deg)") {
        iconDown.style.transform = "rotate(0deg)";
      }
    },
    afterThreshold(v) {
      // 状态三  超越临界状态
      this.$refs.bookmark.style.top = `${-v}px`;
      if (this.isBookmark) {
        this.color = WHITE;
        this.text = this.$t("book.releaseDeleteMark");
        this.isFixed = false
      } else {
        this.color = BLUE;
        this.text = this.$t("book.releaseAddMark");
        this.isFixed = true
      }
      const iconDown = this.$refs.iconDown;
      if (
        iconDown.style.transform === "" || iconDown.style.transform === "rotate(0deg)") {
        iconDown.style.transform = "rotate(180deg)";
      }
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../assets/styles/global.scss";
.ebook-bookmark {
  position: absolute;
  top: px2rem(-35);
  left: 0;
  z-index: 200;
  width: 100%;
  height: px2rem(35);
  .ebook-bookmark-text-wrapper {
    position: absolute;
    right: px2rem(45);
    bottom: 0;
    display: flex;
    .ebook-bookmark-down-wrapper {
      font-size: px2rem(14);
      color: white;
      transition: all 0.2s linear;
      @include center;
    }
    .ebook-bookmark-text {
      font-size: px2rem(14);
      color: white;
    }
  }
  .ebook-bookmark-icon-wrapper {
    position: absolute;
    right: 0;
    bottom: 0;
    margin-right: px2rem(15);
  }
}
</style>