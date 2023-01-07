import chai from 'chai'
import type { Mongoose } from 'mongoose'

import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'
import chaiSubset from 'chai-subset'
import { isMemoryMongoAvailable } from './utils'

import 'chai/register-expect.js'
import 'chai/register-should.js'
import 'chai/register-assert.js'
import 'jsdom-global/register.js'

type Params = {
  database?: string
  beforeConnect?: () => Promise<void>
  afterConnect?: () => Promise<void>
  beforeDisconnect?: () => Promise<void>
  afterDisconnect?: () => Promise<void>
  mongoose?: Mongoose
}

export function setup(params: Params) {
  const {
    database,
    beforeConnect,
    afterConnect,
    beforeDisconnect,
    afterDisconnect,
    mongoose,
  } = params

  chai.use(chaiAsPromised)
  chai.use(sinonChai)
  chai.use(chaiSubset)

  if (database && mongoose && isMemoryMongoAvailable()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setupDatabase } = require('./db')

    setupDatabase(
      mongoose,
      database,
      beforeConnect,
      afterConnect,
      beforeDisconnect,
      afterDisconnect,
    )
  }
}
