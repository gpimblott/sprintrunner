# sprintrunner

Information here

##Installation

Clone this repo

``` 
npm install
```

## Running
After completing above installation instructions, to run locally without Basic Authentication:

``` 
DEBUG=sprintrunner:*
```

If you want to try out the stunning Basic Auth (useful for when you don't want everyone getting straight to your story overviews)
``` 
DEBUG=sprintrunner:*  npm start
```

### Deploying
I've been deploying this to cloud foundry so I use the following manifest file:

```
---
applications:
- name: sprintrunner
  command: npm start
  memory: 128M
  disk_quota: 128M
  buildpack: nodejs_buildpack
  env:

```