var OP;
var visited=0,answers=0;
var result

function flatten (list) {  
  var temp;
  var level=0,cur_level=0,prv,nxt;;
  for(var i=0;i<list.length;i++) {
    console.log('message');
    try {
      // console.log('message',list[i].data.id);
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
      console.error(e);
    }
    // console.log(list);
  }
  // console.log(list);
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
        if(!(key=='body'|| key=='bodyhtml' || key=='author' || key=='level' || key=='id')) {
          delete list[i]['data'][key];
          console.log('dd');
        }
      }
    }
    catch(e) {console.error(e);}
    if (list[i].data==null) {
      delete list[i];
    }
  }
  return list
}

// var Comment = function (id,parent_id,children,author,text) {
function Comment(id,parent_id,children,author,text) {
  // this.id = id;
  // this.parent_id = parent_id;
  // this.children = children
  // this.author = author;
  // this.text  = text;
  return {
    id: id,
    parent_id: parent_id,
    children: children,
    author: author,
    text: text
  };
};

function saveNode (argument) {
  // body...
}

function AnalyzeComment (parent,comment) {
  var ans=false,arr,res,newc;
  visited+=1;
  // console.log(comment.id);
  process.stdout.write('Total visited: '+visited+'\r');
  if (comment.children) {
    return [false,comment];
  }
  if (comment.replies && comment.replies.data.children) {
    for(var i=0;i<comment.replies.data.children.length;i++) {
      // console.log('Analyzing child no.',i)
      arr = AnalyzeComment(comment, comment.replies.data.children[i].data)
      res = arr[0];
      newc = arr[1]
      if(res) {
        ans=res;
        // console.log('true:',comment.id);
      } else {
        comment.replies.data.children[i].data = null;
      }
    }
    if (comment.main) {
      // console.log(comment)
      // result.send(JSON.stringify(comment,null,2))
    }
    if (ans) {
      if (comment.author==OP) {
        answers++;
      }
      return [true,comment];
    } else {
      // comment.replies = null;
    }
  }
  if (comment.author==OP) {
    answers++;
    saveNode(comment);
    return [true,comment];
  } else {
    return [false,comment];
  }
  return [false,comment];
}

// function AnalyzeComment (parent,comment) {
//   visited+=1;
//   process.stdout.write('Total visited: '+visited+'\r');
//   var ans=false,res;
//   console.log(comment.id, comment.body, comment.replies.data.children.length);
//   if(comment.replies && comment.replies.data.children) {
//     for(var i=0;i< comment.replies.data.children.length;i++) {
//       res = AnalyzeComment(comment,comment.replies.data.children[i].data);
//       if(res) {
//         ans = true;
//       }
//     }
//   } else if(comment.data.children) {
//     for(var i=0;i< comment.data.children.length;i++) {
//       res = AnalyzeComment(comment,comment.data.children[i].data);
//       if(res) {
//         ans = true;
//       }
//     }
//   } else {
//     // console.log('message');
//     if(comment.author == OP) {
//       return true;
//     } else {
//       return false;
//     }
//   }
//   if(ans) {
//     return true;
//   } else {
//     if(comment.author == OP) {
//       return true;
//     } else {
//       return false;
//     }
//   }
// }


function removeNoise (comment_dict) {
  var res,newc;
  var Title = new Comment(id = comment_dict[0].data.children[0].data.id,
                          parent_id = null,
                          children = null,
                          author = comment_dict[0].data.children[0].data.author,
                          text = comment_dict[0].data.children[0].data.selftext
                          )
  console.log(comment_dict[0].data.children[0].data.id);
  OP = comment_dict[0].data.children[0].data.author;
  comment = {replies: comment_dict[1],main:true};
  res, newc = AnalyzeComment(null,comment);
  console.log();
  console.log('Answers:',answers);

  // newc.splice(0,1)
  
  newc = flatten_list_tree(newc);
  
  result.send(JSON.stringify(newc,null,2));

  // result.render('ama', {result: newc[1].replies.data.children, title: 'Test'});
  // for(var i=0;i<10000;i++) {
    // process.stdout.write(i+'\r');
  // }
}



var request = require('request');

function getAccessToken (mainres,id,callback) {
  url = 'https://www.reddit.com/api/v1/access_token'
  var access_token;
  // request.post({url:url, form:{grant_type:'client_credentials'}}, function (err, res, body) {
  //   access_token = JSON.parse(body).access_token;
  //   console.log(access_token);
  //   return callback(mainres,id,access_token)
  // }).auth(CLIENT_ID, CLIENT_SECRET, false);
  return callback(mainres,id,access_token);
}
function getComments (mainres,id,access_token) {
  // console.log(access_token);
  // url = 'https://oauth.reddit.com/comments/'+id+'?depth=5';
  url = 'http://localhost:8000/ama.json';
  // console.log(url);
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
  // res.send('test');
  // console.log('yo');
}
