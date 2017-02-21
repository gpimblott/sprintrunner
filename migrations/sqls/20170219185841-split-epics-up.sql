CREATE TABLE epics(
                id SERIAL PRIMARY KEY,
                title char varying(150),
                description TEXT,
                acceptance_criteria TEXT,
                reason TEXT,
                created TIMESTAMP without time zone default (now() at time zone 'utc'),
                persona integer references personas(id) on delete cascade);


ALTER TABLE stories drop column type;

DROP TABLE if EXISTS story_link;

CREATE TABLE epic_story_link(
                id SERIAL PRIMARY KEY,
                story_id integer references stories(id) on delete cascade ,
                epic_id integer references epics(id) on delete cascade );

CREATE TABLE epic_label_link(
                id SERIAL PRIMARY KEY,
                label_id integer references labels(id) on delete cascade ,
                epic_id integer references epics(id) on delete cascade );