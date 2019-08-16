const sqlite3 = require('sqlite3');
const Mongo = require('mongodb').MongoClient;

const DBTransferer = function (mongoConf, sqliteDB) {
    this.liteDB = new sqlite3.Database(sqliteDB, sqlite3.OPEN_READONLY);
    let mongoURL = 'mongodb://';
    if (mongoConf.mongoUser && mongoConf.mongoPass) mongoURL += mongoConf.mongoUser + ':' +
        mongoConf.mongoPass + '@';
    mongoURL += mongoConf.mongoURL;
    if (mongoConf.mongoPort) mongoURL += + ':' + mongoConf.mongoPort;
    this.mongoDB = new Mongo(mongoURL);
    this.mongoDBName = mongoConf.mongoDB;
}

DBTransferer.prototype.sqlite2mongo = function () {
    this.promiseEach("SELECT name FROM sqlite_master WHERE type='table';")
        .then((tableName) => this.tableQueryMaker(tableName));
};

DBTransferer.prototype.promiseEach = function (query) {
    return new Promise((resolve, reject) => {
        this.liteDB.each(query, (err, tableName) => {
            if (err) reject(err);
            resolve(tableName);
        })
    })
}

DBTransferer.prototype.tableQueryMaker = function (tableName) {
    let db2Connect = undefined;
    if (this.mongoDB.isConnected()) db2Connect = this.mongoDB;
    else db2Connect = this.mongoDB.connect();
    db2Connect.then(() => this.mongoDB.db(this.mognoDBName)
        .createCollection(tableName.name, (err) => { if (err) throw err; }))
        .then(() => this.promiseAll("SELECT * FROM " + tableName.name + ";")
            .then((rows) => this.mongoInserter(tableName.name, rows)));

}

DBTransferer.prototype.promiseAll = function (query) {
    return new Promise((resolve, reject) => {
        this.liteDB.all(query, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
        })
    })
}

DBTransferer.prototype.mongoInserter = function (tableName, rows) {
    this.mongoDB.db(this.mongoDBName).collection(tableName).insertMany(rows, (err) => { if (err) throw err; })
}

module.exports = { DBTransferer, };
