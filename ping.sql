CREATE TABLE results(
    hostname VARCHAR,
    round_trip_time REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comments(
    hostname VARCHAR,
    comment TEXT,
    commenter VARCHAR,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);