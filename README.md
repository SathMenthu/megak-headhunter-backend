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
  '/add-many-students' - import many students using by ADMIN with CSV file
```
##### Requirements for CSV file
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
