// noinspection JSConstantReassignment
import mongoose from 'mongoose'
import { after, before } from 'mocha'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import chalk from 'chalk'

let replSet = null

export const connect = async (database: string) => {
  if (replSet) return
  if (mongoose.connection.readyState === 1) return

  replSet = await MongoMemoryReplSet.create({
    replSet: { storageEngine: 'wiredTiger', dbName: 'sapienza-test' },
  })

  await replSet.waitUntilRunning()

  const uri = replSet.getUri()

  await mongoose.connect(uri, {
    dbName: database,
    autoCreate: true,
    autoIndex: true,
  })
}

export const clearDatabase = async () => {
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

export const setupDatabase = (database: string) => {
  before(async () => {
    await connect(database)

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

    await mongoose.disconnect()
    await replSet.stop()
    replSet = null
  })
}
