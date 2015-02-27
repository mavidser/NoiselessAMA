var OP;
var visited,answers;

function rearrange_threads (list) {
  var current_shift = 0;
  for (var i = 0; i < list.length; i++) {
    if (list[i].level == 1)
      current_shift = 0;
    list[i].shift = current_shift;
    current_shift += (list[i].total_children)
    current_shift--;
  };
  return list;
}

function flatten (list) {  
  var temp;
  var level=0,cur_level=0,prv,nxt;;
  for(var i=0;i<list.length;i++) {
    try {
      list[i].total_children = 0;
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
      if (comment.author in OP || comment.author_flair_text!=null) {
        answers++;
        if (comment.author_flair_text!=null)
          comment.author = comment.author_flair_text;
        OP[comment.author] = true;
      }
      return [true,comment];
    }
  }
  if (comment.author in OP || comment.author_flair_text!=null) {
    answers++;
    if (comment.author_flair_text!=null)
      comment.author = comment.author_flair_text;
    OP[comment.author] = true;
    return [true,comment];
  } else {
    return [false,comment];
  }
  return [false,comment];
}

function removeNoise (res,comment_dict) {
  var res,newc, multipleAnswerers;
  var op = comment_dict[0].data.children[0].data.author;
  OP = {};
  if (comment_dict[0].data.children[0].data.author_flair_text)
    OP[comment_dict[0].data.children[0].data.author_flair_text] = true;
  else
    OP[op] = true;
  title = comment_dict[0].data.children[0].data.title;
  console.log(title);
  comment = {replies: comment_dict[1],main:true};
  res, newc = AnalyzeComment(null,comment);
  console.log();
  console.log('Answers:',answers);
  newc = flatten_list_tree(newc);
  newc = rearrange_threads(newc);
  if(Object.keys(OP).length > 1) {
    multipleAnswerers = true;
  }
  console.log(OP,multipleAnswerers,OP.length)
  res.render('ama', {result: newc,op:OP, title: title,multiA: multipleAnswerers}); 
}

var request = require('request');

function getComments (res,id) {
  // url = 'http://localhost:8000/ama2.json';
  url = 'https://reddit.com/comments/'+id+'.json?depth=20&&limit=5000'
  headers = {'User-Agent': 'AGENT OF SHIELD'}
  request.get({url:url, headers:headers}, function (error, result, body) {
    removeNoise(res,JSON.parse(body));
  })
}

module.exports.parseAMA = function(req,res) {
  id = req.params.id;
  visited = 0, answers = 0;
  getComments(res,id);
}
