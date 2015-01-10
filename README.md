Noiseless AMA
-------------
Removes noise from any Reddit AMA and presents them in a linear Question-Answer format.

Built with:

- Node.js
- Express.js
- Jade

Deploying
---------

###Locally

Get [OAuth keys from reddit](https://www.reddit.com/prefs/apps/) (type=Personal Use Script) and deploy using:

```bash
$ REDDIT_CLIENT_ID=[Your ID here] REDDIT_CLIENT_SECRET=[Your SECRET_ID here] node app.js
```

###Heroku

```bash
$ heroku config:set REDDIT_CLIENT_ID=[Your ID here]
$ heroku config:set REDDIT_CLIENT_SECRET=[Your SECRET_ID here]
$ git add .
$ git commit -m "Reddit OAuth keys added"
$ git push heroku master
```
