ALTER TABLE epics add column theorder INTEGER default (0);

update epics e
    set theorder = e2.seqnum
    from (select e2.*, row_number() over () as seqnum
          from epics e2
         ) e2
    where e2.id = e.id;