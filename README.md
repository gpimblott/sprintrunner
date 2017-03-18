# sprintrunner

SprintRunner is designed to be a lightweight Agile sprint planning tool for teams.  It based on a number of key concepts:

* Multiple teams working from a single backlog of Epics and Stories
* Stories are allocated to teams and prgoress through a simple workflow
* It's very opinionated about the writing of Epics and Stories 
    * "As a..."
    * "I need to..."
    * "So that..."
    * "Acceptance Criteria"
* Forces definition of Personas
* Continuous display of 'just enough' metrics information to keep management happy
* Definition and visualisation of work against milestones
* It uses Google Authentication for users

##Installation

Clone this repo.  It's a NodeJS application and requires PostgreSQL.

Setup the following environment variables:

```
GOOGLE_CLIENTID - For Google Authentication
GOOGLE_CLIENT_SECRET - For Google Authentication
DATABASE_URL - Where your database is
USE_SSL - For database connection (Heroku needs this)\

DEFAULT_LABELS - Most commonly used labels
MILESTONE_LABELS - The labels for 3 Milestones

```


## Running
After completing above installation instructions run server.js

