<template>
  <div class="ebook-reader">
    <div id="read"></div>
    <div class="ebook-reader-mask"
         @click="onMaskClick"
         @touchmove="move"
         @touchend="moveEnd"
         @mousedown.left="onMouseEnter"
         @mousemove.left="onMouseMove"
         @mouseup="onMouseEnd"></div>
  </div>
</template>

<script>
import Epub from "epubjs";
global.ePub = Epub;
import { ebookMixin } from "../../utils/mixin.js";
import {
  getFontFamily,
  saveFontFamily,
  getFontSize,
  saveFontSize,
  getTheme,
  saveTheme,
  getLocation
} from "../../utils/localStorage.js";
import { flatten } from '../../utils/book.js'

export default {
  mixins: [ebookMixin],
  methods: {
    prevPage() {
      if (this.rendition) {
        this.rendition.prev().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    nextPage() {
      if (this.rendition) {
        this.rendition.next().then(() => {
          this.refreshLocation()
        })
        this.hideTitleAndMenu()
      }
    },
    toggleTitleAndMenu() {
      if (this.menuVisible) {
        this.setSettingVisible(-1);
        this.setFontFamilyVisible(false);
      }
      this.setMenuVisible(!this.menuVisible);
    },
    initFontSize() {
      let fontSize = getFontSize(this.fileName);
      if (!fontSize) {
        saveFontSize(this.fileName, this.defaultFontSize);
      } else {
        this.currentBook.rendition.themes.fontSize(fontSize);
        this.setDefaultFontSize(fontSize);
      }
    },
    initFontFamily() {
      let font = getFontFamily(this.fileName);
      if (!font) {
        saveFontFamily(this.fileName, this.defaultFontFamily);
      } else {
        this.currentBook.rendition.themes.font(font);
        this.setDefaultFontFamily(font);
      }
    },
    initTheme() {
      let defaultTheme = getTheme(this.fileName);
      if (!defaultTheme) {
        defaultTheme = this.themeList[0].name;
        saveTheme(this.fileName, defaultTheme);
      }
      this.setDefaultTheme(defaultTheme);
      this.themeList.forEach(theme => {
        //注册
        this.rendition.themes.register(theme.name, theme.style);
      });
      this.rendition.themes.select(defaultTheme);
    },
    //表示初始化过程
    initRendition() {
      this.rendition = this.book.renderTo("read", {
        width: innerWidth,
        height: innerHeight,
        methods: "default" /*微信兼容配置 */
      })
      const location = getLocation(this.fileName)
      this.display(location,() => {
        this.initFontSize()
        this.initFontFamily()
        this.initTheme()
        this.initGlobalStyle()
      })
      //用来管理资源
      this.rendition.hooks.content.register(contents => {
        Promise.all([
          //表示可以手动添加样式文件     获取地址
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/daysOne.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/cabin.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/montserrat.css`
          ),
          contents.addStylesheet(
            `${process.env.VUE_APP_RES_URL}/fonts/tangerine.css`
          )
        ]).then(() => {});
      });
    },
    initGesture() {
      /*touch开始 */
      this.rendition.on("touchstart", event => {
        this.touchStartX = event.changedTouches[0].clientX;
        this.touchTime = event.timeStamp;
      });
      /*touch结束 */
      this.rendition.on("touchend", event => {
        const offsetX = event.changedTouches[0].clientX - this.touchStartX;
        const time = event.timeStamp - this.touchTime;
        if (time < 500 && offsetX > 40) {
          this.prevPage();
        } else if (time < 500 && offsetX < -40) {
          this.nextPage();
        } else {
          this.toggleTitleAndMenu();
        }
        /**禁用事件默认方法调用 */
        // event.preventDefault()
        /**禁用传播 */
        event.stopPropagation();
      });
    },
    // 获取图片的封面链接 和 作者标题
    parseBook(){
      // loaded表示book的加载   cover表示封面信息
      this.book.loaded.cover.then(cover => {
        this.book.archive.createUrl(cover).then(url => {
          this.setCover(url)
        })
      })
      this.book.loaded.metadata.then(metadata => {
        this.setMetadata(metadata)
      })
      this.book.loaded.navigation.then(nav => {
        const navItem = flatten(nav.toc)
        function find(item,level = 0){
          return !item.parent ? level : find(navItem.filter(parentItem => parentItem.id === item.parent)[0],++level)
        }
        navItem.forEach(item => {
          item.level = find(item)
        })
         this.setNavigation(navItem)
      })
    },
    initEpub() {
      const url =
        process.env.VUE_APP_RES_URL + "/epub/" + this.fileName + ".epub";
      this.book = new Epub(url);
      this.setCurrentBook(this.book);
      this.initRendition();
      this.initGesture();
      this.parseBook();
      this.book.ready
        .then(() => {
          return this.book.locations.generate(
            750 * (window.innerWidth / 375) * (getFontSize(this.fileName) / 16)
          );
        })
        .then(locations => {
          this.navigation.forEach(nav => {
            nav.pagelist = []
          })
          locations.forEach(item => {
            const loc = item.match(/\[(.*)\]!/)[1]
            this.navigation.forEach(nav => {
              if(nav.href){
                const href = nav.href.match(/^(.*)\.html$/)[1]
                if(href === loc){
                  nav.pagelist.push(item)
                }
              }
            })
            let currentPage = 1
            this.navigation.forEach((nav,index) => {
              if(index === 0){
                nav.page = 1
              }else{
                nav.page = currentPage
              }
              currentPage += nav.pagelist.length
            })
          })
          this.setPagelist(locations)
          this.setBookAvailable(true)
          this.refreshLocation()
        });
    },
    onMaskClick(e){
      if(this.mouseState && (this.mouseState === 2 || this.mouseState === 3)){
        return
      }
      const offsetX = e.offsetX
      const width = window.innerWidth
      if(e.offsetX > 0 && offsetX < width * 0.3){
        this.prevPage()
      }else if(e.offsetX > 0 && offsetX > width * 0.7){
        this.nextPage()
      }else{
        this.toggleTitleAndMenu()
      }
    },
    move(e){
      let offsetY = 0
      if(this.firstOffsetY){
        offsetY = e.changedTouches[0].clientY - this.firstOffsetY
        this.setOffsetY(offsetY)
      }else{
        this.firstOffsetY = e.changedTouches[0].clientY
      }
      e.preventDefault();
      e.stopPropagation()
    },
    moveEnd(e){
      this.setOffsetY(0)
      this.firstOffsetY = null
    },
    //1-鼠标进入
    //2-鼠标进入后的移动
    //3-鼠标从移动状态松手
    //4-鼠标还原
    onMouseEnter(e){
      this.mouseState = 1
      e.stopPropagation()
      e.preventDefault()
      this.mouseStartTime = e.timeStamp
    },
    onMouseMove(e){
      if(this.mouseState === 1){
        this.mouseState = 2
      }else if(this.mouseState === 2){
        let offsetY = 0
        if(this.firstOffsetY){
          offsetY = e.clientY - this.firstOffsetY
          this.setOffsetY(offsetY)
        }else{
          this.firstOffsetY = e.clientY
        }
      }
      e.stopPropagation()
      e.preventDefault()
    },
    onMouseEnd(e){
      if(this.mouseState === 2){
        this.setOffsetY(0)
        this.firstOffsetY = null
        this.mouseState = 3
      } else if(this.mouseState === 3){
        this.mouseState = 4
      }
      const time = e.timeStamp - this.mouseStartTime
      if(time < 100){
        this.mouseState = 4
      }
      e.stopPropagation()
      e.preventDefault()
    }
  },
  mounted() {
    /**
     * $route.params.fileName* 获取路径*/
    this.setFileName(this.$route.params.fileName.split("|").join("/")).then(
      () => {
        this.initEpub();
      }
    );
  }
};
</script>

<style lang="scss" scoped>
@import "../../assets/styles/global.scss";
.ebook-reader{
  height: 100%;
  width: 100%;
  overflow: hidden;
  .ebook-reader-mask{
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    z-index: 150;
    background: transparent;
  }
}
</style>