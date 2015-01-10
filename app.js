var express = require('express');
var jade = require('jade');
var path = require('path');
var routes = require('./routes');
var app = express();

app.set('view engine', 'jade')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.set('port', (process.env.PORT || 8000));

var http = require('http').Server(app);
app.get("/",routes.index);
app.get("/ama?",routes.submit);
app.get("/ama/:id",routes.ama);

http.listen(app.get('port'),function(){
console.log("Server listening on localhost:"+app.get('port'));
});
