# sqlite2mongo
Not much testing is done at the moment. It is a simple tool that gets the job done for our use case.

# Usage
Create 'DBTransferer' object with parameters: 
  mongoConf -> mongoUser(optional), mongoPass(optional), mongoPort(optional), mongoDB(mandatory), mongoURL(mandatory)
  example:
    { 'mongoUser': 'johndoe', 'password': 'verysecret', 'mongoPort': '1111', 'mongoDB': 'testing', 'mongoURL': 'localhost' }
  sqliteDB -> The path to sqlite database file
  
After creating the object, call 'sqlite2mongo' member function on it with no parameters.

# Notes
- It will create all the collections with the same name as the tables in SQLite DB.
- It will keep to connection open until the object is destroyed for efficiency.
- For now, it will create another unique ID in MongoDB Collection and uniquiness, primary key status etc. not checked. (Working on them.)
- For now, do not trust this library. Use it at your own risk.
- Any contrubitions welcome.
