console.log('Start server');

const http = require('http');
const mysql = require('mysql2');
const handling = require('./handle_request.js');


let server = http.createServer();
var db;
connectDb();

server.on('request', (req, res) => {
    handling.handleRequest(req, res, db);
});

server.listen(80);
   
function connectDb(){
    db = mysql.createConnection({
        host     : '127.0.0.1',
        user     : 'root',
        password : '6317983S1q2L3,;:=',
        database : 'user_database',
        // multipleStatements: true
    });

    db.connect((err) => {
        if(err){
            console.log('MySQL failed to connect...')
            console.log(err)
        }
        console.log('MySQL connected...');
    });
}