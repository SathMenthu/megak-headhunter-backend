#Description
This app is server side of application created by group 8 of first edition of MegaK Javascript Bootcamp. It is created to show our skills not only by code but also by creating a system to show MegaK participants to HR agents and representatives looking for "ready to hire" developers.

##TechStack
Our serverside app is made among other things by following technologies:
- Nestjs
- Typescript
- TypeORM
- MariaDB
- Passport
- JWT

Frontend side of application will be having two similar applications to choose from. One is created in React, the second one uses Vue as its core. Right now the preferred one is VUE due to its level of completion. After finishing the app, there will be only up to you which one do you want to use.  
Here are urls to frontend application:
VUE - https://github.com/SathMenthu/megak_headhunter_frontend_b
REACT - https://github.com/SathMenthu/megak-headhunter-frontend/tree/develop

## Requirements
```bash
Node: v16.14.2
```

## Installation
```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## How to run/setup project

1. npm init
![npmi](https://user-images.githubusercontent.com/33133742/180031762-6a48a650-58aa-413b-98c3-55e07feb3fea.gif)

2. Setup Prettier on Webstorm
![prettier](https://user-images.githubusercontent.com/33133742/180031847-a8e53ed2-fe53-4eae-b65c-74138868eb5e.gif)

3. Setup config (fill fields by your data)
![config](https://user-images.githubusercontent.com/33133742/180031922-f536f263-703c-4faa-8d30-533bde2463fe.gif)

We assume, that you found out, that config.example.ts file is an example file to create new config.ts file and fill the object as shown on the film above.

You should also set up following variables in config.ts file.
- secretConfig object - You need to assign two of its elements (**HASH_SECRET_KEY** and **TOKEN_SECRET**) with a string, the longer and more complicated the better.
- mainConfigInfo object - You need to assign a string to element **yourDomainName**. For localhost with a port 3000 it's "http://localhost:3000"
- papaParseConfig object - You can assign number of lines of CSV file parsed by server from the file sent by admin to insert new Students to system. Default is set to 175 due to various spam restrictions that may occur (still it can be to many, so be careful). If you are not afraid or your email account and/or domain are disposable, feel free to change it. Sky is the limit (as it was for ikarus).  

### email config
After setting up the app you need to set up the email sending middleware. You can also do it in config.ts file.
config.example.ts is set up to work with localhost with working  mailslurper a local SMTP mail server. You don't have to do nothing but one thing to make it work. Only setting you can be willing to change is **mailPreview** option in mailConfig object. It sets app to open email content on new tab on your browser. So if you want to add 100 students get ready to open 100 tabs... or set this option to false. 
If You don't have mailslurper it's easy to start. Just click download button on this site https://www.mailslurper.com/ and after extracting the files run mailslurper.exe file on you machine. Your dummy email server frontend should be found on http://localhost:8080 
Sending email via this server you need to click "Refresh" button to see if it was sent. 

If You want to use another server you wanto to use your email settings You should be able to figure names out, we'll hel you with three of them:
- mailSecure - if true connection will use TLS when connecting to server. If false then TSL is used if server supports the STARTTLS extension. Most cases the value is true when connecting to port 465 and false connecting to ports 25 or 587.
- mailTlsRejectUnauthorized - if is not set false, the server automatically rejects clients with invalid certificates. Yes that's you on localhost in most cases. 
- adminEmail - is also the default email that emails will be sent.

**We do not recommend using outside email SMTP servers on localhost due to lack od ssl certificates and great deal of problems caused by it**

That is it, the app should work fine with our fronted apps. If you want to check endpoints, they're underneath. There is only one more thing You need to read. How should CSV file look like. It's all there underneath in "Import Students" section. 

### Default Info
 
 
```bash
- Port: 3004
- CORS Port: 3000
- Global prefix: '/api'
- JSON limit: 5mb
- Rate limiter: 100 requests / 30 minutes
```



### Endpoints

#### User
```bash
  @GET
  '/user' - returns all users
  '/user/:id' - returns target user
  @POST
  '/user' - create an user
  @PATCH
  '/user/:id' - update target user
  @DELETE
  '/user/:id' - delete target user
```
#### Auth
```bash
  @GET
  '/me' - auth user via jwt token, returns user data
  '/logout' - logout target user via jwt token
  @POST
  '/login' - login user, returns user data and set token on cookies
```


#### Import Students
```bash
  @POST
  '/add-many-students' - import many students using by ADMIN with CSV file. 
```

##### Requirements to form on frontend
There should a CSV file with candidates, it should be sent by Multiform.  Name of only one input should be "file", and be set to File.

###### Requirements for CSV file
The file should have Header fields named 
- email

This should be a valid email address
- courseCompletion

This should be a number between 0 and 5 both included
- courseEngagement

This should be a number between 0 and 5 both included
- projectDegree

This should be a number between 0 and 5 both included
- teamProjectDegree

This should be a number between 0 and 5 both included
- bonusProjectUrls

This should be valid github URLs leading to project from stage 7 of MegaK separated by comma, example of array: 

```https://github.com/SathMenthu/megak-headhunter-backend,https://github.com/iwomipl/Movie-Wars-Front```

- Separator for CSV file should be semicolon;

Example of CSV file Should look like this:
```bash
email;courseCompletion;courseEngagement;projectDegree;teamProjectDegree;bonusProjectUrls
a@be.c;1;1;1;1;https://github.com/SathMenthu/megak-headhunter-backend
b@c.d;5;4;0;2;https://github.com/SathMenthu/megak-headhunter-frontend
a@c.b;2;2;4;5;https://github.com/SathMenthu/megak-headhunter-backend
r@t.s;4;0;1;2;https://github.com/SathMenthu/megak-headhunter-backend,https://github.com/iwomipl/Movie-Wars-Front
sk.d;4;1;2;3;https://github.com/SathMenthu/megak-headhunter-backend
koniec@sprawdzania.pl;5;5;5;5;https://github.com/SathMenthu/megak-headhunter-backend,https://github.com/iwomipl/Movie-Wars-Front
```

#### Forgot Password
```bash
  @POST
  '/forgot-pass' - in Body {email:  'userEmail'}
```

#### email settings
Sending emails from localhost is now using home.pl smtp server without SSL. 
- When the app will land on production the settings will be easily changed in config.ts file. 
- If You are willing to see emails, that has been sent to users, just set mailPreview flag to true in config.ts file.

If case You are using mailSlurper to grab emails going out of server, You can use one of two configs in mailConfig.ts and config.example.ts files. Configs described as a localhost config should let You easily switch to localhost. If You want to use Outside SMTP server settings, You need to comment config described as "localhost - config" uncomment and fill out proper fields' config described as an "Outside SMTP Server" in both files.

#### Endpoint to confirm registration
```bash
  @POST
  '/confirm-registration?id=<uuid>&token=<uuid>' - confirm registration endpoint
```


#### Endpoint to retrieve password
```bash
  @POST
  '/retrieve-password?id=<uuid>&token=<uuid>' - retrieve password endpoint
```