DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS doodles;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS bios;

CREATE TABLE users (
  id serial PRIMARY KEY,
  googleId VARCHAR (50) UNIQUE NOT NULL,
  email VARCHAR (50) NOT NULL,
  name VARCHAR (50) NOT NULL,
  imageUrl VARCHAR (255) NOT NULL
);

CREATE TABLE friends (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  friend_id int NOT NULL
);

CREATE TABLE images (
  id serial PRIMARY KEY,
  url VARCHAR (255) NOT NULL,
  uploader_id int NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE doodles (
  id serial PRIMARY KEY,
  url TEXT NOT NULL,
  caption VARCHAR(255),
  original_id int NOT NULL,
  doodler_id int NOT NULL,
  lat numeric (15, 11),
  lng numeric (15, 11),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  count int DEFAULT 0 NOT NULL 
);

CREATE TABLE likes (
  id serial PRIMARY KEY,
  user_id int NOT NULL,
  doodle_id int NOT NULL
);

CREATE TABLE comments (
  id serial PRIMARY KEY,
  comment VARCHAR(500),
  doodle_id int NOT NULL,
  user_id int NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bios (
  id serial PRIMARY KEY,
  bio VARCHAR(500),
  user_id int NOT NULL
);

INSERT INTO doodles (url, caption, original_id, doodler_id, lat, lng) VALUES ('https://i.pinimg.com/originals/f5/05/24/f50524ee5f161f437400aaf215c9e12f.jpg', 'blank canvas', 1, 1, null, null);
