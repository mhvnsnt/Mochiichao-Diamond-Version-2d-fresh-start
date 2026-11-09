# src/data/core/schedules/ — availability schedule content

Home for availability schedule data validated by
`src/data/core/schemas/schedules.schema.json` (teardown-persona5 PR-P3,
shared with teardown-yakuza Y6).

**Owner-slot fence:** this directory lands EMPTY of canon rows. Schedule
content for named cast — who is where, on which weekday pattern, day part,
weather, season and story flag — is authored per settlement in story
order as the sequenced build reaches each town. No agent invents a named
character's schedule to fill this directory.

Composition rule (teardown-yakuza Y6, the acceptance test): no re-dress
lands for a settlement without its schedule cells, and no schedule cells
land for a settlement without its re-dress.
