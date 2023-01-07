import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'
import chaiSubset from 'chai-subset'
import { setupDatabase } from './setup'

export function setup(database: string) {
  chai.use(chaiAsPromised)
  chai.use(sinonChai)
  chai.use(chaiSubset)

  setupDatabase(database)
}
