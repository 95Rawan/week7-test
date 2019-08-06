BEGIN;
DROP TABLE IF EXISTS city, users CASCADE;

CREATE TABLE city
(
    id SERIAL PRIMARY KEY,
    name VARCHAR (150) NOT NULL,
    country VARCHAR (150) NOT NULL
);

INSERT INTO city (name,country)
VALUES
    ('Jerusalem', 'Palestine'),
    ('Haifa','Palestine'),
    ('Gaza', 'Palestine');

CREATE TABLE users
(
    id SERIAL PRIMARY KEY,
    email VARCHAR (150) NOT NULL unique,
    password VARCHAR (150) NOT NULL
);

COMMIT;
