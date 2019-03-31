<template>
  <div class="shelf-footer" v-show="isEditMode">
    <div
      class="shelf-footer-tab-wrapper"
      v-for="item in tab"
      :key="item.index"
      @click="onTabClick(item)"
    >
      <div class="shelf-footer-tab" :class="{'is-selected':isSelected}">
        <div class="icon-private tab-icon" v-if="item.index === 1 && !isPrivate"></div>
        <div class="icon-private-see tab-icon" v-if="item.index === 1 && isPrivate"></div>
        <div class="icon-download tab-icon" v-if="item.index === 2 && !isDownload"></div>
        <div class="icon-download-remove tab-icon" v-if="item.index === 2 && isDownload"></div>
        <div class="icon-move tab-icon" v-if="item.index === 3"></div>
        <div class="icon-shelf tab-icon" v-if="item.index === 4"></div>
        <div class="tab-text" :class="{'remove-text':item.index === 4}">{{label(item)}}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { storeShelfMixin } from "../../utils/mixin.js";
import { saveBookShelf, removeLocalStorage } from '../../utils/localStorage.js';
import { download } from '../../api/store.js'
import { removeLocalForage } from '../../utils/localForage.js';
export default {
  mixins: [storeShelfMixin],
  data() {
    return {
      popupMenu: null
    }
  },
  computed: {
    tab() {
      return [
        {
          label: this.$t("shelf.private"),
          label2: this.$t("shelf.noPrivate"),
          index: 1
        },
        {
          label: this.$t("shelf.download"),
          label2: this.$t("shelf.delete"),
          index: 2
        },
        {
          label: this.$t("shelf.move"),
          index: 3
        },
        {
          label: this.$t("shelf.remove"),
          index: 4
        }
      ];
    },
    isSelected() {
      return this.shelfSelected && this.shelfSelected.length > 0;
    },
    isPrivate(){
      if(!this.isSelected){
        return false
      }else{
        return this.shelfSelected.every(item => item.private)
      }
    },
    isDownload(){
      if(!this.isSelected){
        return false
      }else{
        return this.shelfSelected.every(item => item.cache)
      }
    }
  },
  methods: {
    onComplete(){
      this.hidePopup()
      this.setIsEditMode(false)
      // 这里为啥保存shelfList 是因为 shelfSelected是从shelfList中提取的
      saveBookShelf(this.shelfList)
    },
    onTabClick(item) {
      if (!this.isSelected) {
        return;
      }
      switch (item.index) {
        case 1:
          this.showPrivate()
          break;
        case 2:
          this.showDownload()
          break;
        case 3:
          this.dialog().show()
          break;
        case 4:
          this.showRemove()
          break;
        default:
          break;
      }
    },
    showPrivate() {
      this.popupMenu = this.popup({
        title: this.isPrivate ? this.$t('shelf.closePrivateTitle') : this.$t('shelf.setPrivateTitle'),
        btn: [
          {
            text: this.isPrivate ? this.$t('shelf.close') : this.$t('shelf.open'),
            click: () => {
              this.setPrivate()
            }
          },
          {
            text: this.$t('shelf.cancel'),
            click: () => {
              this.hidePopup()
            }
          }
        ]
      }).show();
    },
    setPrivate(){
      let isPrivate
      if(this.isPrivate){
        isPrivate = false
      }else{
        isPrivate = true
      }
      // 遍历shelfSelected的值将isPrivate 的值 覆盖shelfSelected数组中所有项的private值
      this.shelfSelected.forEach(book => {
        book.private = isPrivate
      })
      this.onComplete()
      if(isPrivate){
        this.simpleToast(this.$t('shelf.setPrivateSuccess'))
      }else{
        this.simpleToast(this.$t('shelf.closePrivateSuccess'))
      }
    },
    hidePopup(){
      this.popupMenu.hide()
    },
    label(item){
      switch(item.index){
        case 1:
          return this.isPrivate ? item.label2 : item.label
          break
        case 2:
          return this.isDownload ? item.label2 : item.label
          break
        default:
          return item.label
      }
    },
    showDownload(){
      this.popupMenu = this.popup({
         title: this.isDownload ? this.$t('shelf.removeDownloadTitle') : this.$t('shelf.setDownloadTitle'),
        btn: [
          {
            text: this.isDownload ? this.$t('shelf.delete') : this.$t('shelf.open'),
            click: () => {
              this.setDownload()
            }
          },
          {
            text: this.$t('shelf.cancel'),
            click: () => {
              this.hidePopup()
            }
          }
        ]
      }).show()
    },
    async setDownload(){
      this.onComplete()
      if(this.isDownload){
        this.removeSelectedBook()
        this.simpleToast(this.$t('shelf.removeDownloadSuccess'))
      }else{
        await this.downloadSelectedBook()
        saveBookShelf(this.shelfList)
        this.simpleToast(this.$t('shelf.setDownloadSuccess'))
      }
    },
    async downloadSelectedBook(){
      for(let i = 0; i < this.shelfSelected.length; i++){
        await this.downloadBook(this.shelfSelected[i]).then(book => {
          book.cache = true
        })
      }
    },
    downloadBook(book){
      let text = ''
      const toast = this.toast({
        text:text
      })
      toast.continueShow()
      return new Promise((resolve,reject) => {
        // 创建一个download方法 传入一本书 然后将书进行下载
        download(book, book => {
          toast.remove()
          resolve(book)
        }, reject, progressEvent => {
          const progress = Math.floor(progressEvent.loaded / progressEvent.total * 100) + '%'
          const text = this.$t('shelf.progressDownload').replace('$1',`${book.fileName}.epub(${progress})`)
          toast.updateText(text)
        })
      })
    },
    removeSelectedBook(){
      Promise.all(this.shelfSelected.map(book => this.removeBook(book)))
      .then(books => {
        books.map(book => {
          book.cache = false
        })
        saveBookShelf(this.shelfList)
        this.simpleToast(this.$t('shelf.removeDownloadSuccess'))
      })
    },
    removeBook(book){
      return new Promise((resolve,reject) => {
        removeLocalStorage(`${book.categoryText}/${book.fileName}-info`)
        // 用来删除离线的电子书
        removeLocalForage(`${book.fileName}`)
        resolve(book)
      })
    },
    showRemove(){
      let title
      if(this.shelfSelected.length === 1){
        title = this.$t('shelf.removeBookTitle').replace('$1',`《${this.shelfSelected[0].title}》`)
      }else{
        title = this.$t('shelf.removeBookTitle').replace('$1',this.$t('shelf.selectedBooks'))
      }
      this.popupMenu = this.popup({
        title: title,
        btn: [
          {
            text: this.$t('shelf.removeBook'),
            type: 'danger',
            click: () => {
              this.removeSelected()
            }
          },
          {
            text: this.$t('shelf.cancel'),
            click: () => {
              this.hidePopup()
            }
          }
        ]
      }).show()
    },
    removeSelected(){
      this.shelfSelected.forEach(selected => {
        this.setShelfList(this.shelfList.filter(book => book !== selected))
      })
      this.setShelfSelected([])
      this.onComplete()
    }
  }
};
</script>
<style lang="scss" scoped>
@import "../../assets/styles/global";
.shelf-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 120;
  display: flex;
  width: 100%;
  height: px2rem(48);
  background: white;
  box-shadow: 0 px2rem(-2) px2rem(4) 0 rgba(0, 0, 0, 0.1);
  .shelf-footer-tab-wrapper {
    flex: 1;
    width: 25%;
    height: 100%;
    .shelf-footer-tab {
      width: 100%;
      height: 100%;
      @include columnCenter;
      opacity: 0.5;
      &.is-selected {
        opacity: 1;
      }
      .tab-icon {
        font-size: px2rem(20);
        color: #666;
      }
      .tab-text {
        margin-top: px2rem(5);
        font-size: px2rem(12);
        color: #666;
        &.remove-text{
          color: $color-pink;
        }
      }
      .icon-shelf{
        color: $color-pink;
      }
    }
  }
}
</style>