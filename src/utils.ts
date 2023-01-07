export function isMemoryMongoAvailable() {
  try {
    require('mongodb-memory-server')
    return true
  } catch (e) {
    console.log('Mondle: Memory Database Disabled')
    return false
  }
}
