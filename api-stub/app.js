var express = require("express");
var app = express();

const port = process.env.PORT || 3000;

let configData = require('./config.json');

app.use(express.json());

const { MiddlewareApi } =  require('./middleware.js');

app.post('/login', function(request, response){
  console.log(request.body);      // your JSON
  console.log(`username : ${request.body.username}`);      // your JSON
  console.log(`password : ${request.body.password}`);      // your JSON

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.authenticate(request.body.username, request.body.password)
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

app.get('/orders', function(request, response){
  console.log(request.body);      // your JSON
  console.log(`user_token : ${request.body.user_token}`);      // your JSON

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.getOrders(request.body.user_token)
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


app.listen(port, () => {
    console.log("Server running on port :" + port);
});