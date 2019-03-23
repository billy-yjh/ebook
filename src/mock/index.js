import Mock from 'mockjs'
import home from './bookHome'
import shelf from './bookShelf'
import list from './bookList'
import flatList from './bookFlatList'
// 第一个参数是正则表达式 匹配符合的路径  第二个参数 为请求方法
Mock.mock(/\/book\/home/, 'get', home)
Mock.mock(/\/book\/shelf/, 'get', shelf)
Mock.mock(/\/book\/list/, 'get', list)
Mock.mock(/\/book\/flat-list/, 'get', flatList)
