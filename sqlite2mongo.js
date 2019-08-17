const sqlite3 = require('sqlite3');
const Mongo = require('mongodb').MongoClient;

const validator = require('./validator');

const DBTransferer = function (mongoConf, sqliteDB) {
    this.liteDB = new sqlite3.Database(sqliteDB, sqlite3.OPEN_READONLY);
    let mongoURL = 'mongodb://';
    if (mongoConf.mongoUser && mongoConf.mongoPass) mongoURL += mongoConf.mongoUser + ':' +
        mongoConf.mongoPass + '@';
    mongoURL += mongoConf.mongoURL;
    if (mongoConf.mongoPort) mongoURL += + ':' + mongoConf.mongoPort;
    this.mongoDB = new Mongo(mongoURL);
    this.mongoDBName = mongoConf.mongoDB;
    this.validator = null;
    this.isTypeWritten = false;
}

DBTransferer.prototype.indexColumn = function (tableName, columnName, isUnique) {
    this.mongoDB.db(this.mongoDBName).collection(tableName).createIndex(columnName, {
        'unique': isUnique
    }, (err) => {
        if (err) throw err;
        this.mongoInserterCaller(tableName);
    });
}

DBTransferer.prototype.mongoInserterCaller = function (tableName) {
    this.liteDB.each("SELECT * FROM " + tableName + ";",
        (err, row) => {
            if (err) throw err;
            this.mongoInserter(tableName, row);
        });
}

DBTransferer.prototype.runStructureCascade = function (tableName) {
    this.mongoDB.db(this.mongoDBName).collection(tableName).countDocuments((err, count) => {
        this.validator = new validator.Validator();
        if (!err && count === 0) {
            this.liteDB.all("PRAGMA table_info('" + tableName + "');",
                (err, typeInfo) => {
                    if (err) throw err;
                    this.setStructure(tableName, typeInfo);
                })
        }
        else {
            this.mongoDB.db(this.mongoDBName).collection(tableName).findOne({},
                (err, res) => {
                    if (err) throw err;
                    this.validator.setDataTypes(res);
                });
        }
    })
}

DBTransferer.prototype.setStructure = function (tableName, typeInfo) {
    typeInfo.forEach((ele) => {
        let datatype = this.validator.convertType2Validator(ele['type']);
        if (ele['type'].includes("PRIMARY_KEY"))
            this.indexColumn(tableName, ele['name'], true);
        else this.mongoInserterCaller(tableName);
        if (!ele['type'].includes("NOT NULL")) this.validator.addNull(datatype);
        this.validator.addDataType(ele['name'], datatype);
    });
    if (!this.isTypeWritten)
        this.mongoDB.db(this.mongoDBName).collection(tableName).insertOne(
            this.validator.getDataTypes(), (err) => {
                if (err) throw err;
                this.isTypeWritten = true;
            });
}

DBTransferer.prototype.sqlite2mongo = function () {
    this.liteDB.each("SELECT name FROM sqlite_master WHERE type='table';",
        (err, tableName) => {
            if (err) throw err;
            this.isTypeWritten = false;
            this.tableQueryMaker(tableName);
        });
}

DBTransferer.prototype.tableQueryMaker = function (tableName) {
    let db2Connect = undefined;
    if (this.mongoDB.isConnected()) db2Connect = this.mongoDB;
    else db2Connect = this.mongoDB.connect();
    db2Connect.then(() => this.mongoDB.db(this.mognoDBName)
        .createCollection(tableName.name, (err) => {
            if (err) throw err;
            this.runStructureCascade(tableName.name);
        }));

}

DBTransferer.prototype.mongoInserter = function (tableName, row) {
    this.validator.validate(row);
    if (this.validator.isValid())
        this.mongoDB.db(this.mongoDBName).collection(tableName)
            .insertOne(row, (err) => { if (err) throw err; })
}

module.exports = { DBTransferer, };


// FOR TESTING

const db = new DBTransferer({ 'mongoURL': 'localhost', 'mongoDB': 'test' },
    '/usr/local/zulutek/doraapi/test.db');

db.sqlite2mongo();
