exports.index = function(req, res){
  res.render('index', {title: 'Home'});
};

exports.submit = function(req, res){
  // var id = req.params.id;
  // console.log(id);
  var url = req.query['id'];
  console.log(url);
  var id = url.match(/reddit\.com\/r\/(\w)*\/comments\/(\w)*/gi);
  console.log(id);
  id = id[0].slice(id[0].lastIndexOf('/')+1);
  res.redirect('/ama/'+id);
};

exports.ama = function(req, res){
  require('../lib/reddit').parseAMA(req,res);
};
