## Book Trading app

Use:
  - Node and Express for backend
  - Angular & Bootstrap for frontend
  - mongodb to store data.
  - satellizer for auth (githib and twitter)


##### Heroku Settings or Environment Variables  
|  Name                |  Description              
|----------------------|------------------------------------------------------------------
| MONGO_URI            |  Mongodb connection string (including user/pass if needed)  
| GITHUB_CLIENT_ID     |  Github client id from https://github.com/settings/developers
| GITHUB_SECRET        |  Github secret from https://github.com/settings/developers 
| TWITTER_KEY          |  Twitter key from https://apps.twitter.com/
| TWITTER_SECRET       |  Twitter secret from https://apps.twitter.com/
| TOKEN_SECRET         |  Your own secret string to encrypt token (can be anything)

##### Install to run

npm i   
node server.js  

##### Install for dev

First install node, bower (global) and gulp-cli (global).  
Then:  
npm i && bower i && gulp

Demo here : https://nico-pint.herokuapp.com
