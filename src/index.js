/***
This provides some simple async methods for using a mongo database
***/
const mongo = require('mongodb')

const MongoClient = mongo.MongoClient
const ObjectID = mongo.ObjectID

class DB {
  constructor (url, connectOptions = {}, logLevel = 1) {
    if (!url) {
      throw Error('url is a required constructor parameter')
    }
    // database connection URL
    this.url = url
    // default connect options
    const defaultConnectOptions = {
      useNewUrlParser: true,
      poolSize: 5, 
      useUnifiedTopology: true
    }
    // merge user connect options with with defaults
    this.connectOptions = {...defaultConnectOptions, ...connectOptions}
    // database connections
    this.connections = {}
    // export ObjectID for client to use
    this.ObjectID = ObjectID
    // logging level. 0 = none, 1 = a little.
    this.logLevel = logLevel
  }

  // get authenticated mongo client connection
  getConnection (db) {
    if (!db) {
      throw Error('database name is a required parameter for getConnection')
    }
    return new Promise((resolve, reject) => {
      // if connection exists, return it
      if (this.connections[db]) {
        // console.log('returning existing connection pool to database', db)
        resolve(this.connections[db])
      } else {
        if (this.logLevel > 0) {
          console.log(`creating new mongodb connection pool to database '${db}'`)
        }
        // connection does not exist yet, establish it now
        MongoClient.connect(this.url, this.connectOptions, (err, client) => {
          // check for error
          if (err) {
            return reject(err)
          } else {
            // success - save client and return it
            this.connections[db] = client
            resolve(this.connections[db])
          }
        })
      }
    })
  }
  
  find (db, collection, query = {}, projection) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        client.db(db).collection(collection)
        .find(query).project(projection)
        .toArray(function (queryError, doc) {
          // check for error
          if (queryError) reject(queryError)
          // success
          else resolve(doc)
        })
      })
      .catch(e => {
        // failed to get client
        reject(e)
      })
    })
  }
  
  // mongo find one (returns object)
  findOne (db, collection, query, options) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // find one!
        client.db(db)
        .collection(collection)
        .findOne(query, options, function (err, result) {
          // check for error
          if (err) reject(err)
          // success
          else resolve(result)
        })
      })
      .catch(e => {
        // failed to get client
        reject(e)
      })
    })
  }
  
  // mongo insert
  insertOne (db, collection, data) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // insert!
        client.db(db)
        .collection(collection)
        .insertOne(data, function (err, result) {
          // check for error
          if (err) reject(err)
          // success
          else resolve(result)
        })
      })
      .catch(e => {
        // failed to get client
        reject(e)
      })
    })
  }
  
  // mongo upsert (update existing or insert new if not exist)
  upsert (db, collection, query, data) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // upsert!
        client.db(db)
        .collection(collection)
        .findOneAndReplace(query, data, { upsert: true }, function (err, result) {
          // check for error
          if (err) reject(err)
          // success
          else resolve(result)
        })
      })
      .catch(e => {
        // failed to get client
        reject(e)
      })
    })
  }
  
  // mongo updateOne (update one existing record)
  updateOne (db, collection, filter, query) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // update one
        client.db(db)
        .collection(collection)
        .updateOne(filter, query, function (err, result) {
          // check for error
          if (err) reject(err)
          // success
          else resolve(result)
        })
      })
      .catch(e => {
        // failed to get client
        reject(e)
      })
    })
  }
  
  removeOne (db, collection, query) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // go
        client.db(db)
        .collection(collection)
        .removeOne(query, function (err, result) {
          // check for error
          if (err) reject(err)
          // success
          else resolve(result)
        })
      })
      .catch(e => {
        // failed to get client
        reject(e)
      })
    })
  }
}

module.exports = DB
