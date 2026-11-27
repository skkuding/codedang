-- Bruno fixture: a Blueprint with two sections for "Update Blueprint Course - Fixture Sections".
-- Section creation has no API yet, so load this into a LOCAL TEST DATABASE only.
-- Prerequisites and the exact command: see the docs of "Blueprint Course/folder.bru".
--   docker exec -i codedang-test-database psql -v ON_ERROR_STOP=1 -U postgres -d skkuding \
--     < "collection/instructor/Blueprint Course/blueprint-sections.fixture.sql"
-- Re-running replaces only the previous fixture (Blueprint course_num BRU3201 and its sections).
BEGIN;

DELETE FROM "group"
WHERE id IN (
  SELECT ci.group_id
  FROM course_info ci
  JOIN blueprint_course bc ON bc.id = ci.blueprint_course_id
  WHERE bc.course_num = 'BRU3201'
);
DELETE FROM blueprint_course WHERE course_num = 'BRU3201';

WITH instructor AS (
  SELECT id FROM "user" WHERE username = 'instructor'
), blueprint AS (
  INSERT INTO blueprint_course (
    course_title, course_num, semester, week, professor,
    email, website, office, phone_num, created_by_id, update_time
  )
  SELECT 'Bruno Sections Fixture', 'BRU3201', '2026 Fall', 16, 'Fixture Professor',
         'fixture@skku.edu', 'https://fixture.example', 'Fixture Room', '010-0000-0000', id, now()
  FROM instructor
  RETURNING id, course_num, semester, week, professor, email, website, office, phone_num
), section AS (
  INSERT INTO "group" (group_name, description, config, group_type, update_time)
  VALUES
    ('Bruno Fixture Section 41', 'fixture section 41',
     '{"showOnList":true,"allowJoinFromSearch":true,"allowJoinWithURL":false,"requireApprovalBeforeJoin":true}',
     'Course', now()),
    ('Bruno Fixture Section 42', 'fixture section 42',
     '{"showOnList":false,"allowJoinFromSearch":false,"allowJoinWithURL":true,"requireApprovalBeforeJoin":false}',
     'Course', now())
  RETURNING id, group_name
), section_info AS (
  INSERT INTO course_info (
    group_id, blueprint_course_id, class_num, course_num, semester, week,
    professor, email, website, office, phone_num
  )
  SELECT s.id, b.id, right(s.group_name, 2)::int, b.course_num, b.semester, b.week,
         b.professor, b.email, b.website, b.office, b.phone_num
  FROM section s CROSS JOIN blueprint b
  RETURNING group_id
)
INSERT INTO user_group (user_id, group_id, is_group_leader, update_time)
SELECT i.id, si.group_id, true, now()
FROM section_info si CROSS JOIN instructor i;

COMMIT;
