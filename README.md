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



