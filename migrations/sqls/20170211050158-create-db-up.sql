CREATE TABLE stories(
                id SERIAL PRIMARY KEY,
                type integer default(1),
                title char varying(150),
                description TEXT );

CREATE TABLE story_link(
                id SERIAL PRIMARY KEY,
                parent_id integer references stories(id),
                child_id integer references stories(id)  );

CREATE TABLE teams(
                id SERIAL PRIMARY KEY,
                name char varying(150),
                description TEXT );

CREATE TABLE labels(
                id SERIAL PRIMARY KEY,
                name char varying(150));

CREATE TABLE story_label_link(
                id SERIAL PRIMARY KEY,
                label_id INTEGER references labels(id) ON DELETE CASCADE,
                story_id INTEGER references stories(id) ON DELETE CASCADE);


CREATE TABLE story_status(
                id SERIAL PRIMARY KEY,
                name char varying(150));


