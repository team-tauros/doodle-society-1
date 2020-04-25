const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DBUSER,
  host: process.env.DBHOST || 'localhost',
  database: 'doodle',
  password: process.env.DBPASS,
  port: 5432,
  ssl: process.env.SSL || false,
});

//  get all the users
const getUsers = () => pool.query('SELECT * FROM users ORDER BY id ASC');

//  retrieve a user by their id number
const getUserByGoogleId = (req) => {
  const { googleId } = req.body;

  return pool.query('SELECT * FROM users WHERE googleId = $1', [googleId]);
};

const getUserById = (req) => {
  const id = parseInt(req.params.id);

  return pool.query('SELECT * FROM users WHERE id = $1', [id]);
};

const deleteDoodle = (req) => {
  const { doodleid } = req.params;
  return pool.query(`DELETE FROM doodles WHERE id = ${doodleid}`)
    .then(() => pool.query(`DELETE FROM likes WHERE doodle_id = ${doodleid}`));
};

const deleteImage = (req) => {
  const { imageId } = req.params;
  return pool.query(`DELETE FROM images WHERE id = ${imageId}`);
};

const getUserByName = (req) => {
  let { name } = req.params;
  name = `%${name}%`;
  return pool.query('SELECT * FROM users WHERE name ILIKE $1 OR $1 % name ORDER BY SIMILARITY(name, $1) DESC LIMIT 8', [name]);
};

const addComments = (req) => {
  const { comment, doodle_id, user_id } = req.body;
  return pool.query('INSERT INTO comments (comment, doodle_id, user_id) VALUES ($1, $2, $3) RETURNING id', [comment, doodle_id, user_id]);
};

const getComments = (req) => {
  const { doodle_id } = req.params;
  return pool.query('SELECT comments.*, users.name AS username, users.imageUrl AS avatar FROM comments, users WHERE comments.doodle_id = $1 AND comments.user_id = users.id', [doodle_id])
    .then((comments) => Promise.all(comments.rows.map((comment) => pool.query('SELECT * FROM users WHERE id = $1', [comment.user_id])))
      .then((users) => {
        users = users.map((user) => user.rows[0]);
        return comments.rows.map((comment, i) => [comment, users[i]]);
      }));
};

//  add a user to the db
const createUser = (req) => {
  const {
    googleId,
    email,
    name,
    imageUrl,
  } = req.body;
  return pool.query('INSERT INTO users (googleId, email, name, imageUrl) VALUES ($1, $2, $3, $4) RETURNING id',
    [googleId, email, name, imageUrl]);
};

//  add a friend relation to the db
//  only reciprocal relationships will be true friends
const addFriend = (req) => {
  const { user_id, friend_id } = req.body;
  return pool.query('SELECT FROM friends WHERE user_id = $1 AND friend_id = $2', [user_id, friend_id])
    .then((result) => {
      if (result.rowCount) {
        return Promise.resolve('exists');
      }
      return pool.query('INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)', [user_id, friend_id]);
    });
};

//  get all friends associated with an id that have added that id back
const getFriends = (req) => {
  const { id } = req.params;
  //  get all user id's that user has added as friends
  return pool.query('SELECT friend_id FROM friends WHERE user_id = $1', [id])
    .then((friends) => Promise.all(friends.rows.map((friend) => pool.query('SELECT user_id FROM friends WHERE user_id = $1 AND friend_id = $2', [friend.friend_id, id]))))
    .then((confirmedFriends) => {
      //  filter out any empty results, then map to user id's
      const confirmedFriendIds = confirmedFriends
        .filter((cF) => cF.rowCount)
        .map((cF) => cF.rows[0].user_id);
      //  get all the users associated with confirmed id's
      return Promise.all(confirmedFriendIds.map((cFId) => pool.query('SELECT * FROM users WHERE id = $1', [cFId])));
    });
};

const getFriendRequests = (req) => {
  const { id } = req.params;
  return pool.query('SELECT users.* FROM friends, users WHERE friends.friend_id = $1 AND friends.user_id = users.id', [id]);
};

const removeFriend = (req) => {
  const { user_id, friend_id } = req.body;
  return pool.query('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [user_id, friend_id]);
};

const addImage = (req) => {
  const { url, uploader_id } = req.body;
  return pool.query('INSERT INTO images (url, uploader_id) VALUES ($1, $2) RETURNING id', [url, uploader_id]);
};

const addDoodle = (req) => {
  const {
    url,
    caption,
    original_id,
    doodler_id,
  } = req.body;

  return pool.query('INSERT INTO doodles (url, caption, original_id, doodler_id) VALUES ($1, $2, $3, $4) RETURNING id',
    [url, caption, original_id, doodler_id]);
};


const addLikedDoodle = (req) => {
  const { userId, doodleId } = req.params;

  return pool.query('SELECT count FROM doodles WHERE id = $1', [doodleId])
    .then((doodCount) => pool.query('UPDATE doodles set count = $1 WHERE id = $2', [doodCount.rows[0].count + 1, doodleId]))
    .then(() => pool.query('INSERT INTO likes (user_id, doodle_id) VALUES ($1, $2) RETURNING id', [userId, doodleId]));
};

const unLikedDoodle = (req) => {
  const { userId, doodleId } = req.params;

  return pool.query('SELECT count FROM doodles WHERE id = $1', [doodleId])
    .then((doodCount) => pool.query('UPDATE doodles set count = $1 WHERE id = $2', [doodCount.rows[0].count - 1, doodleId]))
    .then(() => pool.query('DELETE FROM likes WHERE doodle_id = $1 AND user_id = $2', [doodleId, userId]));
};

const getLikedDoodles = (req) => {
  const { userId } = req.params;

  return pool.query('SELECT doodle_id FROM likes WHERE user_id = $1', [userId])
    .then((doodleId) => Promise.all(doodleId.rows.map((id) => pool.query('SELECT * from doodles WHERE id = $1', [id.doodle_id]))));
};

const getUserUploads = (req) => {
  const { id } = req.params;
  return pool.query('SELECT * FROM images WHERE uploader_id = $1 ORDER BY created_at DESC', [id]);
};

const getImageById = (req) => {
  const { id } = req.params;
  return pool.query('SELECT url FROM images WHERE id = $1', [id]);
};

const getUserDoodles = (req) => {
  const { id } = req.params;
  return pool.query('SELECT doodles.*, users.name AS username, images.url AS original_url FROM doodles, users, images WHERE doodles.doodler_id = $1 AND users.id = $1 AND doodles.original_id = images.id ORDER BY created_at DESC', [id]);
};

const addBio = (req) => {
  const { user_id, bio } = req.body;
  return pool.query('SELECT id FROM bios WHERE user_id = $1', [user_id])
    .then((result) => {
      if (result.rowCount) {
        return pool.query('UPDATE bios SET bio = $1 WHERE user_id = $2', [bio, user_id]);
      }
      return pool.query('INSERT INTO bios (bio, user_id) VALUES ($1, $2)', [bio, user_id]);
    });
};

const getBio = (req) => {
  const { userId } = req.params;
  return pool.query('SELECT * FROM bios WHERE user_id = $1', [userId]);
};

module.exports = {
  getUsers,
  getUserByGoogleId,
  getUserById,
  getUserByName,
  createUser,
  addFriend,
  getFriends,
  getFriendRequests,
  removeFriend,
  addImage,
  addDoodle,
  getUserUploads,
  getUserDoodles,
  getImageById,
  addLikedDoodle,
  getLikedDoodles,
  unLikedDoodle,
  addComments,
  getComments,
  addBio,
  getBio,
  deleteDoodle,
  deleteImage,
};
