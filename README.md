# sqlite2mongo
Not much testing is done at the moment. It is a simple tool that gets the job done for our use case.

WRITTEN BY OZGUR BAGCI <bagciozgur@yahoo.com>

GNU GPLv3 LICENSE

# Usage
Create 'DBTransferer' object with parameters: 
  
  mongoConf -> mongoUser(optional), mongoPass(optional), mongoPort(optional), mongoDB(mandatory), mongoURL(mandatory)
  
  Example: `{ 'mongoUser': 'johndoe', 'password': 'verysecret', 'mongoPort': '1111', 'mongoDB': 'testing', 'mongoURL': 'localhost' }`
  
  sqliteDB -> The path to sqlite database file
  
After creating the object, call 'sqlite2mongo' member function on it with no parameters.

# Notes
- It will create all the collections with the same name as the tables in SQLite DB.
- It will keep to connection open until the object is destroyed for efficiency.
- It works with this keywords on SQLite as types: PRIMARY_KEY, NOT NULL, INT, VARCHAR(*), BOOLEAN.
- Use at your own risk.
- It checks data types before pushing it into MongoDB and create unique indices for PRIMARY_KEYs.
