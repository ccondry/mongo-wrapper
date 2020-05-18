# mongo-wrapper
A simple wrapper for mongodb. Handles connection pooling for you.

## Example
```js
// this library
const mongo = require('@ccondry/mongo-wrapper')

// your mongo database URL / connection string
const url = 'mongodb+srv://user:password@host/?retryWrites=true'
// optional - these are the default values
const connectOptions = {
  useNewUrlParser: true,
  poolSize: 5, 
  useUnifiedTopology: true
}
// optional - this is the default value
const logLevel = 1

// create the wrapper object
const db = new mongo(url, connectOptions, logLevel)

// this would also work to create the wrapper object
// const db = new mongo(url)

// set up projection to exclude password from results
const projection = {password: 0}

// find one user in the toolbox database, excluding the password field
db.findOne('toolbox', 'users', {email: 'ccondry@cisco.com'}, {projection})
.then(r => console.log('found user:', r))
.catch(e => console.log('error:', e.message))

// find list of enabled users in the toolbox database, excluding the password field
db.find('toolbox', 'users', {disabled: false}, projection)
.then(r => console.log('found user:', r))
.catch(e => console.log('error:', e.message))
```