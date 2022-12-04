const express = require('express');  
const app = express(); 
const port = 4000; 
app.get('/', (req, res) => {
   res.send('Get Received')
 })
app.get("/about", function (req, res) {
  res.send("About");
});
 app.post('/', (req, res) => {
   res.send('Post')
 })
app.listen(port, function () {  
 console.log("Server listening at "+  port)  
})