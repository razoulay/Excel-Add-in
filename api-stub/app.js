var express = require("express");
var app = express();
var https = require('https')
var fs = require('fs')
var cors = require('cors');

const port = process.env.PORT || 4302;

let configData = require('./config.json');

app.use(express.json());
app.use(cors());

const { MiddlewareApi } =  require('./middleware.js');

app.post('/login', function(request, response){
  console.log(request.body);      // your JSON
  console.log(`username : ${request.body.username}`);      // your JSON
  console.log(`password : ${request.body.password}`);      // your JSON

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.authenticate(request.body.username, request.body.password)
    .then((result) => {
      console.log('\nresult is : ' + result);
      if (result.rows.length > 0) {
        response.send({
          "userToken": result.rows[0].user_token,
          "allowUpdateOrders": result.rows[0].allow_update_orders
          }
        );
      } else {
        response.send({
          "userToken": '',
          "allowUpdateOrders": false
          }
        );
      }
  })
  .catch((strErr) => {
    console.error('\n!!! ERROR !!!');
    console.error(strErr);
    response.send(strErr);
  });
});

app.get('/orders', function(request, response){
  console.log(`userToken : ${request.query.userToken}`);      // your JSON

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.getOrders(request.query.userToken)
    .then((result) => {
      console.log('\nresult is : ' + result);
      response.send(result);
  })
  .catch((strErr) => {
    console.error('\n!!! ERROR !!!');
    console.error(strErr);
    response.send(strErr);
  });
});

app.post('/order', function(request, response){
  console.log(request.body);      // your JSON

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.addOrder(request.body)
    .then((result) => {
      console.log('\nresult is : ' + result);
      response.send(result);
  })
  .catch((strErr) => {
    console.error('\n!!! ERROR !!!');
    console.error(strErr);
    response.send(strErr);
  });
});

app.post('/order/:id', function(request, response){
  console.log(request.params.id);
  console.log(request.body);      // your JSON

  const id = parseInt(request.params.id, 10);
  console.log("id : " + id);
  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.updateOrder(id, request.body)
    .then((result) => {
      console.log('\nresult is : ' + result);
      response.send(result);
  })
  .catch((strErr) => {
    console.error('\n!!! ERROR !!!');
    console.error(strErr);
    response.send(strErr);
  });
});

app.delete('/order/:id', function(request, response){
  console.log(request.params.id);
  console.log(request.body);      // your JSON

  const id = parseInt(request.params.id, 10);
  console.log("id : " + id);
  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.deleteOrder(id, request.body)
    .then((result) => {
      console.log('\nresult is : ' + result);
      response.send(result);
  })
  .catch((strErr) => {
    console.error('\n!!! ERROR !!!');
    console.error(strErr);
    response.send(strErr);
  });
});


https.createServer({
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt')
}, app)
.listen(port, () => {
  console.log("Server running on port :" + port);
});
