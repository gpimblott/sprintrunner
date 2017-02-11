alter table stories add column team_id INTEGER references teams(id) ON DELETE CASCADE;
alter table stories add column status_id INTEGER references story_status(id) ON DELETE CASCADE;
alter table stories add column estimate INTEGER  default (null);
alter table stories add column created TIMESTAMP without time zone default (now() at time zone 'utc');

update stories set created=now();