DROP TABLE IF EXISTS epic_story_link;

DROP TABLE IF EXISTS epics;

ALTER TABLE stories add column type integer default 1;

CREATE TABLE story_link(
                id SERIAL PRIMARY KEY,
                parent_id integer references stories(id),
                child_id integer references stories(id)  );