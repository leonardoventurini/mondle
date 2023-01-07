export function isMemoryMongoAvailable() {
  try {
    require.resolve('mongoose')
    require.resolve('mongodb-memory-server')
    return true
  } catch (e) {
    console.log('Mondle: Database Disabled')
    return false
  }
}
