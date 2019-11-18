--
-- File generated with SQLiteStudio v3.2.1 on Mon Nov 18 13:40:31 2019
--
-- Text encoding used: System
--
PRAGMA foreign_keys = off;
BEGIN TRANSACTION;

-- Table: item
CREATE TABLE item (item_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, user_id INTEGER REFERENCES user (user_id) NOT NULL, item_name VARCHAR (50) NOT NULL, item_description VARCHAR (250) NOT NULL, item_img_loc VARCHAR (50) NOT NULL);

-- Table: trade
CREATE TABLE trade (swap_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, buying_id INTEGER REFERENCES item (item_id) NOT NULL, selling_id INTEGER REFERENCES item (item_id) NOT NULL);

-- Table: user
CREATE TABLE user (user_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, username VARCHAR (32) NOT NULL, password VARCHAR (32) NOT NULL, forename VARCHAR (32) NOT NULL, surname VARCHAR (32) NOT NULL, email VARCHAR (50) NOT NULL);

COMMIT TRANSACTION;
PRAGMA foreign_keys = on;
