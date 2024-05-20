const http = require('http');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;

function handleRequest(req,res,db){
  console.log(`Request received: ${req.method} ${req.url}`);

  if (req.method === 'POST' && req.url === '/api/register') {
    // Inscription
    handleRegister(req, res, db);
  } else if (req.method === 'POST' && req.url === '/api/login') {
    // Connexion
    handleLogin(req, res, db);
  } else if (req.method === 'GET' && req.url === '/api/me') {
    // Vérification du token
    handleMe(req, res, db);
  } else {
    // Handle other requests
    res.statusCode = 404;
    res.end('Not Found');
  }
}

// Handle register request
function handleRegister(req, res, db) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { username, password } = JSON.parse(body);

    // Check for existing username
    db.query('SELECT * FROM client WHERE username = ?', [username], (err, results) => {
      if (err) {
        res.statusCode = 500;
        res.write(JSON.stringify({response : 'Internal Server Error'}));
        res.end();
      } else if (results.length > 0) {
        res.statusCode = 400;
        res.write(JSON.stringify({response : "Username already exists"}));
        res.end();
      } else {
        // Username is unique, proceed with registration
        bcrypt.hash(password, 10, (err, hashedPassword) => {
          if (err) {
            res.statusCode = 500;
            res.write(JSON.stringify({response : 'Internal Server Error'}));
            res.end();
          } else {
            db.query('INSERT INTO client (id_client, username, password) VALUES (UUID_TO_BIN(UUID()),?, ?)', [username,hashedPassword], (err, result) => {
              if (err) {
                res.statusCode = 500;
                res.write(JSON.stringify({response : 'Internal Server Error'}));
                res.end();
              } else {
                res.statusCode = 201;
                res.write(JSON.stringify({response : "User created"}));
                res.end();
              }
            });
          }
        });
      }
    });
  });
}

// Handle login request
function handleLogin(req, res, db) {
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString();
  });
  req.on('end', () => {
    const { username, password } = JSON.parse(body);
    db.query('SELECT hex(id_client) as id_client,username,password FROM client WHERE username = ?', username, (err, results) => {
      if (err) {
        res.statusCode = 500;
        res.write(JSON.stringify({response : 'Internal Server Error'}));
        res.end();
      } else if (results.length === 0) {
        res.statusCode = 401;
        res.write(JSON.stringify({response : 'Invalid credentials'}));
        res.end();
      } else {
        const user = results[0];
        console.log(user)
        bcrypt.compare(password, user.password, (err, isMatch) => {
          console.log(isMatch)
          if (err) {
            res.statusCode = 500;
            res.write(JSON.stringify({response : 'Internal Server Error'}));
        res.end();
          } else if (!isMatch) {
            res.statusCode = 401;
            res.write(JSON.stringify({response : 'Invalid credentials'}));
            res.end();
          } else {
            const token = jwt.sign({ userId: user.id_client }, jwtSecret, { expiresIn: '2min' });
            res.statusCode = 200;
            res.end(JSON.stringify({ "token" : token }));
          }
        });
      }
    });
  });
}

// Handle me request
function handleMe(req, res, db) {
  const token = req.headers.authorization;

  if (!token) {
    res.statusCode = 401;
    res.end('Unauthorized');
  } else {
    console.log("token !")
    try {
      const decodedToken = jwt.verify(token, jwtSecret);
      console.log(decodedToken.userId)
      db.query('SELECT hex(id_client) as id_client FROM client WHERE id_client = uuid_to_bin(?)', [decodedToken.userId], (err, results) => {
        if (err) {
          res.statusCode = 500;
          res.write(JSON.stringify({response : 'Internal Server Error'}));
        res.end();
        } else if (results.length === 0) {
          res.statusCode = 401;
          res.end('Invalid token');
        } else {
          const user = results[0];
          res.statusCode = 200;
          res.end(JSON.stringify(user));
        }
      });
    } catch (err) {
      res.statusCode = 401;
      res.end('Invalid token');
    }
  }
}


module.exports = {
  handleRequest
};