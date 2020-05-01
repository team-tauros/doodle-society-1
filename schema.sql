DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS friends;
DROP TABLE IF EXISTS images;
DROP TABLE IF EXISTS doodles;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS bios;
DROP TABLE IF EXISTS live;

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

CREATE TABLE live (
  id serial PRIMARY KEY,
  url VARCHAR (255) NOT NULL,
  original_id int DEFAULT 1 NOT NULL
);

INSERT INTO doodles (url, caption, original_id, doodler_id, lat, lng) VALUES ('https://i.pinimg.com/originals/f5/05/24/f50524ee5f161f437400aaf215c9e12f.jpg', 'blank canvas', 99999, 99999, null, null);
INSERT INTO images (url, uploader_id) VALUES ('http://images6.fanpop.com/image/photos/40400000/Girls-of-Pok-mon-girls-of-pokemon-40434103-564-482.jpg', 99997);
INSERT INTO images (url, uploader_id) VALUES ('https://img.pokemondb.net/artwork/large/tauros.jpg', 99998);
INSERT INTO images (url, uploader_id) VALUES ('https://img1.kpopmap.com/2018/10/IU-Profile.png', 99999);
-- INSERT INTO images (url, uploader_id) VALUES ('https://i.pinimg.com/originals/f5/05/24/f50524ee5f161f437400aaf215c9e12f.jpg', 99999);
INSERT INTO users (id, googleId, email, name, imageUrl) VALUES (99999, 99999, 'fakeemail', 'fakename', 'https://i.pinimg.com/originals/f5/05/24/f50524ee5f161f437400aaf215c9e12f.jpg');
INSERT INTO live (url, original_id) VALUES ('https://i.pinimg.com/originals/f5/05/24/f50524ee5f161f437400aaf215c9e12f.jpg', 1);