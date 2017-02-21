CREATE TABLE personas(
                id SERIAL PRIMARY KEY,
                name char varying(150),
                avatar bytea DEFAULT NULL,
                details TEXT,
                goal TEXT);


ALTER TABLE stories drop column persona;

ALTER TABLE stories add column persona INTEGER references personas(id) ON DELETE CASCADE;