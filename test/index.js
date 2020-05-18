// load environment file
require('dotenv').config()

const mongo = require('../src')

// library options. url is required
const url = process.env.MONGO_URL
// optional - these are the default values
const connectOptions = {
  useNewUrlParser: true,
  poolSize: 5, 
  useUnifiedTopology: true
}
// optional - this is the default value
const logLevel = 1

const db = new mongo(url, connectOptions, logLevel)

describe('db.getConnection()', function () {
  it('should get a mongo database connection', async function () {
    await db.getConnection('toolbox')
  })
})

describe('db.getConnection()', function () {
  it('should get another mongo database connection', async function () {
    await db.getConnection('cumulus')
  })
})

describe('db.find()', function () {
  it('should return array of results from mongo db', async function () {
    const projection = {password: 0}
    const r = await db.find('toolbox', 'users', {id: '0325'}, projection)
    console.log(r)
  })
})

describe('db.findOne()', function () {
  it('should return a single object from mongo db', async function () {
    await db.findOne('toolbox', 'users', {id: '0325'})
  })
})

describe('db.findOne()', function () {
  it('should return a single object from another mongo db', async function () {
    await db.findOne('cumulus', 'chat.session')
  })
})

describe('db.findOne()', function () {
  it('should return a single object from another mongo db', async function () {
    const projection = {password: 0}
    const r = await db.findOne('toolbox', 'users', {email: 'ccondry@cisco.com'}, {projection})
    console.log('found user:', r)
  })
})
