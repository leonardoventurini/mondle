export function isMemoryMongoAvailable() {
  try {
    require.resolve('mongoose')
    require.resolve('mongodb-memory-server')
    return true
  } catch (e) {
    return false
  }
}
