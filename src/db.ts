import { MongoMemoryReplSet } from 'mongodb-memory-server'
import chalk from 'chalk'
import type { Mongoose } from 'mongoose'

export const setupDatabase = (
  mongoose: Mongoose,
  database: string,
  beforeConnect: () => Promise<void>,
  afterConnect: () => Promise<void>,
  beforeDisconnect: () => Promise<void>,
  afterDisconnect: () => Promise<void>,
) => {
  let replSet = null

  const connect = async (
    database: string,
    beforeConnect: () => Promise<void>,
    afterConnect: () => Promise<void>,
  ) => {
    if (replSet) return
    if (mongoose.connection.readyState === 1) return

    replSet = await MongoMemoryReplSet.create({
      replSet: { storageEngine: 'wiredTiger', dbName: database },
    })

    await replSet.waitUntilRunning()

    const uri = replSet.getUri()

    mongoose.set('strictQuery', false)

    await beforeConnect?.()

    await mongoose.connect(uri, {
      dbName: database,
      autoCreate: true,
      autoIndex: true,
    })

    await afterConnect?.()
  }

  const clearDatabase = async () => {
    await Promise.all(
      Object.values(mongoose.connection.collections).map(async collection => {
        const count = await collection.countDocuments()

        if (count) {
          console.log(
            chalk.bgGray.hex(
              '#bada55',
            )`clearing collection: "${collection.collectionName}" (${count} documents)`,
          )
          await collection.deleteMany({})
        }
      }),
    )
  }

  before(async () => {
    await connect(database, beforeConnect, afterConnect)

    await Promise.all(
      Object.values(mongoose.connection.collections).map(async collection => {
        if (await collection.countDocuments()) await collection.dropIndexes()
      }),
    )
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  afterEach(async () => {
    await clearDatabase()
  })

  after(async () => {
    await clearDatabase()

    /**
     * We need to clear the schemas and models otherwise Mocha will try to
     * overwrite them since the same instance is utilized.
     */

    // @ts-ignore
    // noinspection JSConstantReassignment
    mongoose.connection.models = {}
    // @ts-ignore
    // noinspection JSConstantReassignment
    mongoose.models = {}

    if (process.argv.includes('--watch')) {
      return
    }

    await beforeDisconnect?.()

    await mongoose.disconnect()
    await replSet.stop()
    replSet = null

    await afterDisconnect?.()
  })
}
