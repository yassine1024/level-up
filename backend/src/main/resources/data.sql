-- Real persisted curriculum data (replaces runtime seeding in CatalogDataInitializer).
INSERT INTO lesson_levels (id, name, sort_order) VALUES ('A1', 'Beginner', 1);

INSERT INTO lesson_units (level_id, number, title) VALUES ('A1', 1, 'Greetings and Introductions');
INSERT INTO lesson_units (level_id, number, title) VALUES ('A1', 2, 'Everyday English');

INSERT INTO lessons (unit_id, number, title, content_version, published)
SELECT id, 1, 'Hello and Introductions', 0, TRUE FROM lesson_units WHERE level_id = 'A1' AND number = 1;

INSERT INTO lessons (unit_id, number, title, content_version, published)
SELECT id, 2, 'Personal Information', 0, TRUE FROM lesson_units WHERE level_id = 'A1' AND number = 1;

INSERT INTO lessons (unit_id, number, title, content_version, published)
SELECT id, 3, 'Countries and Nationalities', 0, TRUE FROM lesson_units WHERE level_id = 'A1' AND number = 1;

INSERT INTO lessons (unit_id, number, title, content_version, published)
SELECT id, 1, 'Daily Routines', 0, TRUE FROM lesson_units WHERE level_id = 'A1' AND number = 2;

INSERT INTO lessons (unit_id, number, title, content_version, published)
SELECT id, 2, 'Time and Schedules', 0, TRUE FROM lesson_units WHERE level_id = 'A1' AND number = 2;

INSERT INTO lessons (unit_id, number, title, content_version, published)
SELECT id, 3, 'Everyday Activities', 0, TRUE FROM lesson_units WHERE level_id = 'A1' AND number = 2;
