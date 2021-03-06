import Storage from 'web-storage-cache'

const localStorage = new Storage()
// 写入localStorage
export function setLocalStorage (key, value) {
  return localStorage.set(key, value)
}
// 获取到localStorage的内容
export function getLocalStorage (key) {
  return localStorage.get(key)
}
// 删除localStorage的值
export function removeLocalStorage (key) {
  return localStorage.delete(key)
}
// 清空localStorage的值
export function clearLocalStorage () {
  return localStorage.clear()
}

export function saveBookShelf (shelf) {
  return setLocalStorage('shelf', shelf)
}

export function getBookShelf () {
  return getLocalStorage('shelf')
}

export function setBookObject (fileName, key, value) {
  let book = getLocalStorage(`${fileName}-info`)
  if (!book) {
    book = {}
  }
  book[key] = value
  setLocalStorage(`${fileName}-info`, book)
}

export function getBookObject (fileName, key) {
  let book = getLocalStorage(`${fileName}-info`)
  if (book) {
    return book[key]
  } else {
    return null
  }
}

export function getFontFamily (fileName) {
  return getBookObject(fileName, 'fontFamily')
}

export function saveFontFamily (fileName, font) {
  return setBookObject(fileName, 'fontFamily', font)
}

export function getFontSize (fileName) {
  return getBookObject(fileName, 'fontSize')
}

export function saveFontSize (fileName, fontSize) {
  setBookObject(fileName, 'fontSize', fontSize)
}
export function getLocale () {
  return getLocalStorage('locale')
}

export function saveLocale (locale) {
  return setLocalStorage('locale', locale)
}

export function getLocation (fileName) {
  return getBookObject(fileName, 'location')
}

export function saveLocation (fileName, location) {
  setBookObject(fileName, 'location', location)
}

export function getBookmark (fileName) {
  return getBookObject(fileName, 'bookmark')
}

export function saveBookmark (fileName, bookmark) {
  setBookObject(fileName, 'bookmark', bookmark)
}

export function getReadTime (fileName) {
  return getBookObject(fileName, 'time')
}

export function saveReadTime (fileName, theme) {
  setBookObject(fileName, 'time', theme)
}

export function getProgress (fileName) {
  return getBookObject(fileName, 'progress')
}

export function saveProgress (fileName, progress) {
  setBookObject(fileName, 'progress', progress)
}

export function getNavigation (fileName) {
  return getBookObject(fileName, 'navigation')
}

export function saveNavigation (fileName, navigation) {
  setBookObject(fileName, 'navigation', navigation)
}

export function getMetadata (fileName) {
  return getBookObject(fileName, 'metadata')
}

export function saveMetadata (fileName, metadata) {
  setBookObject(fileName, 'metadata', metadata)
}

export function getCover (fileName) {
  return getBookObject(fileName, 'cover')
}

export function saveCover (fileName, cover) {
  setBookObject(fileName, 'cover', cover)
}

export function getTheme (fileName) {
  return getBookObject(fileName, 'theme')
}

export function saveTheme (fileName, theme) {
  setBookObject(fileName, 'theme', theme)
}
