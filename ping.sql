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

INSERT INTO results VALUES('www.google.com',16.3999999999999985,'2024-11-24 01:49:43');
INSERT INTO results VALUES('www.google.com',22.8000000000000007,'2024-11-24 01:49:43');
INSERT INTO results VALUES('www.google.com',19.1999999999999992,'2024-11-24 01:49:43');
INSERT INTO results VALUES('www.google.com',15.0,'2024-11-24 01:49:43');
INSERT INTO results VALUES('www.yahoo.com',22.6999999999999992,'2024-11-24 01:49:54');
INSERT INTO results VALUES('www.yahoo.com',26.0,'2024-11-24 01:49:54');
INSERT INTO results VALUES('www.yahoo.com',22.8999999999999985,'2024-11-24 01:49:54');
INSERT INTO results VALUES('www.yahoo.com',26.6000000000000014,'2024-11-24 01:49:54');
INSERT INTO results VALUES('localhost',0.0200000000000000004,'2024-11-24 01:50:01');
INSERT INTO results VALUES('localhost',0.0449999999999999983,'2024-11-24 01:50:01');
INSERT INTO results VALUES('localhost',0.0929999999999999993,'2024-11-24 01:50:01');
INSERT INTO results VALUES('localhost',0.0350000000000000033,'2024-11-24 01:50:01');
INSERT INTO results VALUES('www.google.com',23.1999999999999992,'2024-11-24 01:50:50');
INSERT INTO results VALUES('www.google.com',18.6999999999999992,'2024-11-24 01:50:50');
INSERT INTO results VALUES('www.google.com',20.5,'2024-11-24 01:50:50');
INSERT INTO results VALUES('www.google.com',17.6000000000000014,'2024-11-24 01:50:50');
INSERT INTO results VALUES('www.google.com',17.3000000000000007,'2024-11-24 01:51:46');
INSERT INTO results VALUES('www.google.com',14.1999999999999992,'2024-11-24 01:51:46');
INSERT INTO results VALUES('www.google.com',15.6999999999999992,'2024-11-24 01:51:46');
INSERT INTO results VALUES('www.google.com',18.0,'2024-11-24 01:51:46');

INSERT INTO comments VALUES('localhost','Why are people pinging localhost?','','2024-11-24 01:50:38');
INSERT INTO comments VALUES('www.google.com','I search here all the time.','Satisfied user','2024-11-24 01:51:10');
INSERT INTO comments VALUES('www.google.com','Good for you.','','2024-11-24 01:51:26');
INSERT INTO comments VALUES('www.google.com','Slow for anyone else?','Networking d00d','2024-11-24 01:52:22');