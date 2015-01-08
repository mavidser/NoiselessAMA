var OP;
var visited=0,answers=0;


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
  var ans=false,res;
  visited+=1;
  // console.log(comment.id);
  process.stdout.write('Total visited: '+visited+'\r');
  if (comment.children) {
    return false;
  }
  if (comment.replies && comment.replies.data.children) {
    for(var i=0;i<comment.replies.data.children.length;i++) {
      // console.log('Analyzing child no.',i)
      res = AnalyzeComment(comment, comment.replies.data.children[i].data)
      if(res) {
        ans=res;
      }
    }
    if (ans) {
      if (comment.author==OP) {
        answers++;
      }
      return true;
    }
  }
  if (comment.author==OP) {
    answers++;
    saveNode(comment);
    return true;
  } else {
    return false;
  }
  console.log('WHHHHHHHHHHHHHHHAT',comment.id);
  return false;

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
  var Title = new Comment(id = comment_dict[0].data.children[0].data.id,
                          parent_id = null,
                          children = null,
                          author = comment_dict[0].data.children[0].data.author,
                          text = comment_dict[0].data.children[0].data.selftext
                          )
  console.log(comment_dict[0].data.children[0].data.id);
  OP = comment_dict[0].data.children[0].data.author;
  comment = {replies: comment_dict[1]}
  AnalyzeComment(null,comment)
  console.log();
  console.log('Answers:',answers);
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
  //   return callback(mainres,id,access_token)
  // }).auth(CLIENT_ID, CLIENT_SECRET, false);
}
function getComments (mainres,id,access_token) {
  // console.log(access_token);
  // url = 'https://oauth.reddit.com/comments/'+id+'?depth=5';
  url = 'http://localhost:8000/ama.json';
  // console.log(url);
  headers = {'Authorization': "bearer " + access_token,
             'User-Agent': 'AGENT OF SHIELD'}
  request.get({url:url, headers:headers}, function (err, res, body) {
    mainres.send(JSON.stringify(JSON.parse(body),null,2));
    removeNoise(JSON.parse(body));
  })
}

module.exports.parseAMA = function(req,res,callback) {
  id = req.params.id;
  getAccessToken(res,id,getComments);
  // res.send('test');
  // console.log('yo');
}
