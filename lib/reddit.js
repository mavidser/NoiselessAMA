var OP;
var visited=0,answers=0;
var result;

function rearrange_threads (list) {
  level_stack = [0], current_shift=0,cur_level = 0,prev_level = 0;
  for (var i = 0; i < list.length; i++) {
    if(list[i].level == 1) {
      list[i].shift = 0;
    }
    if (level_stack[level_stack.length - 1] && 
        list[i].level > level_stack[level_stack.length - 1][0]) {

      if (list[i].level < prev_level) {
        current_shift-=(level_stack[level_stack.length - 1][1]);
        level_stack.pop();
      }
      list[i].shift = level_stack[level_stack.length - 1][1]-1;
      list[i].shift = current_shift;
    }
    if (list[i].total_children > 1) {
      current_shift+=(list[i].total_children - 1)
      level_stack.push([list[i].level,list[i].total_children - 1]);
    }
    prev_level = list[i].level;
  };
  return list;
}

function flatten (list) {  
  var temp;
  var level=0,cur_level=0,prv,nxt;;
  for(var i=0;i<list.length;i++) {
    try {
      temp = list[i].data.replies.data.children;
      delete list[i].data.replies.data.children;
      try {
        prv = list[i].level;
      } catch(e) {
        prv = 0;
      }

      try {
        nxt = list[i+1].level;
      } catch(e) {
        nxt = 0;
      }
      level+=1;
      var total_children=0;
      for(var j=0;j<temp.length;j++)
        if (temp[j].data)
          total_children+=1;
      list[i].total_children = total_children;
      for(var j=0;j<temp.length;j++) {
        if (j == 0)
          temp[j].prev = prv;
        if (j == temp.length-1) {
          temp[j].next = nxt;
          level = nxt;
        }
        temp[j].level = prv+1;
        list.splice(j+i+1, 0, temp[j]);
      }
      level=nxt;
    } catch(e) {
      // console.error(e);
    }
  }
  return list
}

function flatten_list_tree (list) {
  var list2 = [{data:list[1]}];
  for(var i=0;i<list2.length;i++) {
    list2[i].level=0;
  }

  list = flatten(list2);
  
  list.splice(0,1);
  
  for(var i=0;i<list.length;i++) {
    try {
      delete list[i].prev;
      delete list[i].next;
      delete list[i].kind;
      for(var key in list[i].data) {
        if(!(key=='body'|| key=='body_html' || key=='author' || key=='level' || key=='id')) {
          delete list[i]['data'][key];
        }
        if(key=='body_html') {
          list[i].data.body_html = list[i].data.body_html.replace(new RegExp('&lt;','g'),'<')
          list[i].data.body_html = list[i].data.body_html.replace(new RegExp('&gt;','g'),'>')
          list[i].data.body_html = list[i].data.body_html.replace(new RegExp('&amp;','g'),'&')
          list[i].data.body_html = list[i].data.body_html.replace(new RegExp('&quot;','g'),'"')
          list[i].data.body_html = list[i].data.body_html.replace(new RegExp('&#x27;','g'),"'")
          list[i].data.body_html = list[i].data.body_html.replace(new RegExp('&#x2F;','g'),'/')
          list[i].data.body_html = list[i].data.body_html.replace(new RegExp('\n','g'),'')

        }
      }
    }
    catch(e) {
      console.error(e);
    }
    if (list[i].data==null) {
      delete list[i];
    }
  }
  return list
}

function AnalyzeComment (parent,comment) {
  var ans=false,arr,res,newc;
  visited+=1;
  process.stdout.write('Total visited: '+visited+'\r');
  if (comment.children) {
    return [false,comment];
  }
  if (comment.replies && comment.replies.data.children) {
    for(var i=0;i<comment.replies.data.children.length;i++) {
      arr = AnalyzeComment(comment, comment.replies.data.children[i].data)
      res = arr[0];
      newc = arr[1]
      if(res) {
        ans=res;
      } else {
        comment.replies.data.children.splice(i, 1);
        i--;
      }
    }
    if (ans) {
      if (comment.author==OP) {
        answers++;
      }
      return [true,comment];
    }
  }
  if (comment.author==OP) {
    answers++;
    return [true,comment];
  } else {
    return [false,comment];
  }
  return [false,comment];
}

function removeNoise (comment_dict) {
  var res,newc;
  OP = comment_dict[0].data.children[0].data.author;
  title = comment_dict[0].data.children[0].data.title;
  console.log(title);
  comment = {replies: comment_dict[1],main:true};
  res, newc = AnalyzeComment(null,comment);
  console.log();
  console.log('Answers:',answers);
  newc = flatten_list_tree(newc);
  newc = rearrange_threads(newc);
  result.render('ama', {result: newc,op:OP, title: title}); 
}



var request = require('request');

function getAccessToken (mainres,id,callback) {
  url = 'https://www.reddit.com/api/v1/access_token'
  var access_token;
  request.post({url:url, form:{grant_type:'client_credentials'}}, function (err, res, body) {
    access_token = JSON.parse(body).access_token;
    console.log(access_token);
    return callback(mainres,id,access_token)
  }).auth(CLIENT_ID, CLIENT_SECRET, false);
  // return callback(mainres,id,access_token);
}
function getComments (mainres,id,access_token) {
  // url = 'http://localhost:8000/ama.json';
  url = 'https://oauth.reddit.com/comments/'+id+'?depth=10';
  headers = {'Authorization': "bearer " + access_token,
             'User-Agent': 'AGENT OF SHIELD'}
  request.get({url:url, headers:headers}, function (err, res, body) {
    result = mainres;
    // mainres.send(JSON.stringify(JSON.parse(body),null,2));
    removeNoise(JSON.parse(body));
  })
}

module.exports.parseAMA = function(req,res,callback) {
  id = req.params.id;
  getAccessToken(res,id,getComments);
}
