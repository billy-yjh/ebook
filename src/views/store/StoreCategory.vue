<template>
  <div class="store-shelf">
    <shelf-title :title="shelfCategory.title" ></shelf-title>
    <scroll :top="0" 
            :bottom="scrollBottom"
            class="store-shelf-scroll-wrapper"
            @onScroll="onScroll"
            ref="scroll"
            v-if="ifShowList">
      <shelf-list :top="42" :data="shelfCategory.itemList"></shelf-list>
    </scroll>
    <div v-else class="store-shelf-empty-view">{{$t('shelf.groupNone')}}</div>
    <shelf-footer></shelf-footer>
  </div>
</template>

<script>
import ShelfTitle from '../../components/shelf/ShelfTitle'
import Scroll from '../../components/common/Scroll'
import ShelfList from '../../components/shelf/ShelfList'
import ShelfFooter from '../../components/shelf/ShelfFooter'
import { storeShelfMixin } from '../../utils/mixin.js'

export default {
  mixins:[storeShelfMixin],
  components:{
    ShelfTitle,
    Scroll,
    ShelfList,
    ShelfFooter
  },
  watch: {
    isEditMode(isEditMode){
      this.scrollBottom = isEditMode ? 48 : 0
      this.$nextTick(()=>{
        this.$refs.scroll.refresh()
      })
    }
  },
  data() {
    return {
      scrollBottom:0
    }
  },
  methods: {
    onScroll(offsetY){
      this.setOffsetY(offsetY)
    }
  },
  mounted() {
    this.getCategoryList(this.$route.query.title)
    this.setCurrentType(2)
  },
  computed: {
    ifShowList(){
      return this.shelfCategory.itemList && this.shelfCategory.itemList.length > 0
    }
  },
}
</script>
<style lang="scss" scoped>
@import "../../assets/styles/global";
.store-shelf{
  position: relative;
  z-index: 100;
  width: 100%;
  height: 100%;
  background: white;
  .store-shelf-scroll-wrapper{
    position: absolute;
    top: 0;
    left: 0;
    z-index: 101;
  }
  .store-shelf-empty-view{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    font-size: px2rem(14);
    color: #333;
    @include center;
  }
}
</style>