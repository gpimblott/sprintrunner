INSERT INTO story_status (name) VALUES ('unscheduled');
INSERT INTO story_status (name) VALUES ('accepted');
INSERT INTO story_status (name) VALUES ('planned');
INSERT INTO story_status (name) VALUES ('not started');
INSERT INTO story_status (name) VALUES ('started');
INSERT INTO story_status (name) VALUES ('delivered');
INSERT INTO story_status (name) VALUES ('finished');
INSERT INTO story_status (name) VALUES ('rejected');

UPDATE stories SET status_id=(SELECT id FROM story_status WHERE name='unscheduled');



