var express = require("express");
var app = express();
var https = require('https')
var fs = require('fs')
var cors = require('cors');

var nodemailer = require('nodemailer');
const previewEmail = require('preview-email');
var openurl = require("openurl");

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
          "allowUpdateOrders": result.rows[0].allow_update_orders,
	  "userType": result.rows[0].usertype
          }
        );
      } else {
        response.send({
          "userToken": '',
          "allowUpdateOrders": false,
	  "userType": ''
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


app.get('/getUsername', function(request, response){
  
  console.log(`username : ${request.query.userToken}`);        // your JSON

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.getUsername(request.query.userToken)
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


app.get('/getFilterOrders', function(request, response){
  console.log(`AssetType : ${request.query.AssetType}`);      // your JSON

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.getFilterOrders(request.query.Bank, request.query.AssetType)
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

app.get('/RMorders', function(request, response){
  console.log(`userToken : ${request.query.userToken}`);      // your JSON

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.getRMOrders(request.query.userToken)
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

app.get('/getAllocationsByOrderId', function(request, response){
 console.log("app.js - Order id: "+ request.query.id ) 

  const api = new MiddlewareApi(configData.postgres_connection_string);
  api.getAllocationsByOrderId(request.query.orderId)
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

app.post('/sendEmail_ORIGINAL', function(request, response){
 console.log("app.js - sendEmail: " )
 var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                        user: 'fgroupbp@gmail.com', // Your email id
                        pass: 'Fortune12' // Your password
                }
        });
        var myObj = request.body;
        var txt = "<style> table {font-family: arial, sans-serif; border-collapse: collapse; width: 100%;} td, th {order: 1px solid #00ff40;text-align: left;padding: 8px;} tr:nth-child(even) {background-color: #00ff40;} </style><table>" + " <tr> <th>Accounts</th> <th>Quantity</th> </tr>"
                for (x in myObj) {
                        console.log(x=='rows')
                        if (x == 'rows' ){
                                for (let y = 0; y < myObj[x].length; y++){
                                        console.log("myObj[y]: "+myObj[x][y].id)
                                        txt += "<tr><td>" + myObj[x][y].id + "</td><td>" + myObj[x][y].amount_ordered  + "</td></tr>";

                                }
                        }
                }
        txt += "</table>"

        var mailOptions = {
                from: 'fgroupbp@gmail.com', // sender address
                to: 'razoulay@ffstrategies.net', // list of receivers
                subject: 'Message from my app', // Subject line
                //text: text //, // plaintext body
                html: txt
                // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
        };
        transporter.sendMail(mailOptions, function(error, info){
                if(error){
                        console.log(error);
                        response.json({yo: 'error'});
                }else{
                        console.log('Message sent: ' + info.response);
                        response.json({yo: info.response});
                };
        });
  

});

app.post('/sendEmail', function(request, response){
 console.log("app.js - sendEmail: " )
 openurl.mailto(["john@example.com"],
    { subject: "Hello!", body: "This is\nan automatically sent email!\n" });
	

});


https.createServer({
  key: fs.readFileSync('./ssl/server.key'),
  cert: fs.readFileSync('./ssl/server.crt')
}, app)
.listen(port, () => {
  console.log("Server running on port :" + port);
});
