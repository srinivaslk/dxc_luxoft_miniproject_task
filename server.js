const express = require('express');
const randomId = require('random-id');
const app = express(),
      bodyParser = require("body-parser"),
      fs = require('fs'),
      port = 3080;
      const constants = require("./constants/constants");
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const customCss = fs.readFileSync((process.cwd()+"/swagger.css"), 'utf8');

const mariadb = require('mariadb');

const pool = mariadb.createPool({
     host: constants.HOST, 
     user:constants.USER, 
     password: constants.PASSWORD,
     database: constants.DATABASE,
     connectionLimit: 5
});

let conn;
app.use(bodyParser.json());
app.use((req, res, next) => {
res.header("Access-Control-Allow-Origin", "*");
res.header(
"Access-Control-Allow-Headers",
"Origin, X-Requested-With, Content-Type, Accept, Authorization"
);
if (req.method === "OPTIONS") {
res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
return res.status(200).json({});
}
next();
});
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {customCss}));

app.get('/api/users', (req, res) => {
  (async () => {
    try {
      conn = await pool.getConnection();
      const rows = await conn.query("SELECT * from dxc_luxoft_user");     
      console.log('api/users called!!!!!')
      if(rows.length === 0)
      {
        res.json({
          statusCode: 200,  
          status: "Ok",
          message: "Doesn't have user data."
      });
      }
      else
      {
		  /*Write a function to sort User Details fetched from Table (Don’t get the sorted output from query,
          * instead this function should sort the user details).
		  */
		let sortData = rows.sort((a, b) => a.name.localeCompare(b.name)) 
		 res.json({
            statusCode: 200,  
            status: "Ok",
            userData: sortData
        });
        //res.json(sortData);
        //res.json(sortData);
      }
      
      } catch (err) {
        const errObj = err

        if(Object.keys(errObj).length === 0)
        {
          res.json({
            statusCode: 200,  
            status: "Failed",
            message: "Doesn't have user data."
        });
        } else
        {
          res.json(err); 
        }
      } finally {
      if (conn) return conn.end();
      }
    

  })();
  
});

app.post('/api/user', (req, res) => {
  (async () => {
    const params = req.body.task;
    try {
      let name = params.name;
      let email = params.email;
      let password = params.password;
      let role = params.role;
      conn = await pool.getConnection();
      let sql = "INSERT INTO dxc_luxoft_user (name, email, password, role) VALUES ('"+name+"','"+email+"','"+password+"','"+role+"')";
    const data = await conn.query(sql, function (err, result) {
      if (err) throw err;
      console.log("row inserted");
    });
    
    console.log(data);
    res.json(data);
    } catch (err) {
    throw err;
    } finally {
    if (conn) return conn.end();
    }
   
 })();
   
})
app.get('/api/users/:id', (req, res) => {
  (async () => {
    try {
      conn = await pool.getConnection();
      let filter_id = req.params.id;
      const rows = await conn.query("SELECT * from dxc_luxoft_user where id = '"+filter_id+"'");     
      if(rows.length === 0)
      {
        res.json({
          statusCode: 200,  
          status: "Failed",
          message: "Doesn't have mateched userId."
      });
      }
      else
      {
        res.json(rows);
      }
      } catch (err) {
        const errObj = err

        if(Object.keys(errObj).length === 0)
        {
          res.json({
            statusCode: 200,  
            status: "Failed",
            message: "Doesn't have mateched userId."
        });
        } else
        {
          res.json(err); 
        }
      } finally {
      if (conn) return conn.end();
      }
    

  })();
});


app.post('/api/user/login', (req, res) => {
  (async () => {
    const params = req.body.userLogin;
    try {
      let email = params.email;
      let pword = params.password;
    conn = await pool.getConnection();
    const data = await conn.query("SELECT name,email,role from dxc_luxoft_user WHERE email = '"+email+"' and password= '"+pword+"' "); 
    if(data[0].role === 'EMPLOYEE')
    {
      res.json({
            statusCode: 200,  
            status: "Ok",
            userData: data
        });
    }
    else if(data[0].role === 'ADMIN')
    {
      const allData = await conn.query("SELECT * from dxc_luxoft_user"); 
      res.json({
            statusCode: 200,  
            status: "Ok",
            userData: allData
        });

    }

    
    } catch (err) {
      const errObj = err

        if(Object.keys(errObj).length === 0)
        {
          res.json({
            statusCode: 200,  
            status: "Failed",
            message: "Invalid Email, Password."
        });
        } else
        {
          res.json(err); 
        }
         
    //throw err;
    } finally {
    if (conn) return conn.end();
    }
   
 })();
   
})

app.get('/', (req,res) => {
  res.send(`<h1>API Running on port ${port}</h1>`);
});

app.listen(port, () => {
    console.log(`Server listening on the port::::::${port}`);
});

module.exports = app;