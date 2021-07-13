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
  
  find (db, collection, query = {}, projection, sort, limit) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        let f = client.db(db)
        .collection(collection)
        .find(query)
        // limit if the limit was set
        if (Number.isInteger(limit) && limit >= 0) {
          f = f.limit(limit)
        }
        f.project(projection)
        .sort(sort)
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
  
  // mongo insert one
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
  
  // mongo insert many
  insertMany (db, collection, data) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // insert!
        client.db(db)
        .collection(collection)
        .insertMany(data, function (err, result) {
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
  
  
  // mongo updateMany (update one or more existing records)
  updateMany (db, collection, filter, updates) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // update one
        client.db(db)
        .collection(collection)
        .updateMany(filter, updates, function (err, result) {
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
    return this.deleteOne(db, collection, query)
  }

  deleteOne (db, collection, query) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // go
        client.db(db)
        .collection(collection)
        .deleteOne(query, function (err, result) {
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
  
  deleteMany (db, collection, query) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // go
        client.db(db)
        .collection(collection)
        .deleteMany(query, function (err, result) {
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

  removeMany (db, collection, query) {
    return this.deleteMany(db, collection, query)
  }
  
  // mongo replace record
  replaceOne (db, collection, query, data) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // upsert!
        client.db(db)
        .collection(collection)
        .findOneAndReplace(query, data, function (err, result) {
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
  
  // <filter>,
  //  <update document or aggregation pipeline>, // Changed in MongoDB 4.2
  //  {
  //    projection: <document>,
  //    sort: <document>,
  //    maxTimeMS: <number>,
  //    upsert: <boolean>,
  //    returnNewDocument: <boolean>,
  //    collation: <document>,
  //    arrayFilters: [ <filterdocument1>, ... ]
  //  }

  // find one and replace
  findOneAndUpdate (db, collection, filter, data) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // upsert!
        client.db(db)
        .collection(collection)
        .findOneAndReplace(filter, data, function (err, result) {
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

  /* db.collection.bulkWrite() method
   * Bulk write operations affect a single collection
   * Each write operation is passed to bulkWrite() as a document in an array.
   * Bulk write operations can be either ordered or unordered.
   */
  bulkWrite (db, collection, operationsArray, isOrdered){
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        client.db(db)
        .collection(collection)
        .bulkWrite(operationsArray, { ordered : isOrdered }, function (err, result) {
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

  // get a collection object so client can call any method
  collection (db, collection) {
    return new Promise((resolve, reject) => {
      // get mongo client
      this.getConnection(db)
      .then(client => {
        // return the connected collection object
        resolve(client.db(db).collection(collection))
      })
      .catch(e => {
        // failed to get client
        reject(e)
      })
    })
  }
}

module.exports = DB
