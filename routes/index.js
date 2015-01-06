exports.index = function(req, res){
  res.render('index', {title: 'Home'});
};

exports.ama = function(req, res){
  // var id = req.params.id;
  // console.log(id);
  var url = req.query['id'];
  console.log(url);
  var id = url.match(/reddit\.com\/r\/IAmA\/comments\/(\w)*\//gi);
  console.log(id);
  console.log(id[0].slice(27,-1));
  res.send('hello world');
};
