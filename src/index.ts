import chai from 'chai'

import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'
import chaiSubset from 'chai-subset'
import { isMemoryMongoAvailable } from './utils'

import 'chai/register-expect'
import 'chai/register-should'
import 'chai/register-assert'
import 'jsdom-global/register'

export function setup(database?: string) {
  chai.use(chaiAsPromised)
  chai.use(sinonChai)
  chai.use(chaiSubset)

  if (database && isMemoryMongoAvailable()) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { setupDatabase } = require('./db')

    setupDatabase(database)
  }
}
