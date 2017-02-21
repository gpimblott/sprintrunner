alter table stories drop column persona;
alter table stories add column persona TEXT;

drop table IF EXISTS personas;