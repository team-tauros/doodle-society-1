const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.RDS_USERNAME,
  host: process.env.RDS_HOSTNAME || 'localhost',
  database: process.env.RDS_DB_NAME || 'doodle',
  password: process.env.RDS_PASSWORD,
  port: 5432,
  ssl: process.env.SSL || false,
});

//  retrieve a user by their googleId
const getUserByGoogleId = (req) => {
  const { googleId } = req.body;

  return pool.query('SELECT * FROM users WHERE googleId = $1', [googleId]);
};

// retrieve all users
const getUsers = (req) => {
  return pool.query('SELECT * FROM users');
}

//  retrieve a user by their id
const getUserById = (req) => {
  const id = parseInt(req.params.id);

  return pool.query('SELECT * FROM users WHERE id = $1', [id]);
};

//  delete a doodle based on its id
//  uses the same id to delete all likes for that doodle
const deleteDoodle = (req) => {
  const { doodleid } = req.params;
  return pool.query(`DELETE FROM doodles WHERE id = ${doodleid}`)
    .then(() => pool.query(`DELETE FROM likes WHERE doodle_id = ${doodleid}`));
};

// delete an image based on its id
const deleteImage = (req) => {
  const { imageId } = req.params;
  return pool.query(`DELETE FROM images WHERE id = ${imageId}`);
};

//  do a fuzzy search for a user's name
const getUserByName = (req) => {
  let { name } = req.params;
  //  wrap name in %'s to use it as a substring to search for
  name = `%${name}%`;
  //  get all users whose name either contains the exact substring defined by %name%
  //  or whose name is fuzzily similar to name, returning up to 8 most similar
  return pool.query('SELECT * FROM users WHERE name ILIKE $1 OR $1 % name ORDER BY SIMILARITY(name, $1) DESC LIMIT 8', [name]);
};

//  add a comment
const addComments = (req) => {
  const { comment, doodle_id, user_id } = req.body;
  return pool.query('INSERT INTO comments (comment, doodle_id, user_id) VALUES ($1, $2, $3) RETURNING id', [comment, doodle_id, user_id]);
};

// get all comments for a given doodle
const getComments = (req) => {
  const { doodle_id } = req.params;
  //  get all comments for the doodle, including user's name and avatar url from the users table
  return pool.query('SELECT comments.*, users.name AS username, users.imageUrl AS avatar FROM comments, users WHERE comments.doodle_id = $1 AND comments.user_id = users.id', [doodle_id])
    .then((comments) => Promise.all(comments.rows.map((comment) => pool.query('SELECT * FROM users WHERE id = $1', [comment.user_id]))) //  get the entire user object for each comment
      .then((users) => {
        users = users.map((user) => user.rows[0]);
        //  return an array of tuples of structure [comment, user]
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
  //  first check if a friend request has already been sent
  return pool.query('SELECT FROM friends WHERE user_id = $1 AND friend_id = $2', [user_id, friend_id])
    .then((result) => {
      //  if a request has already been sent, return 'exists'
      if (result.rowCount) {
        return Promise.resolve('exists');
      }
      //  otherwise, create the friend relation
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

//  get all friend requests sent to a user, regardless of whether they have been accepted
const getFriendRequests = (req) => {
  const { id } = req.params;
  return pool.query('SELECT users.* FROM friends, users WHERE friends.friend_id = $1 AND friends.user_id = users.id', [id]);
};

//  delete a friend relation (has not been used yet)
const removeFriend = (req) => {
  const { user_id, friend_id } = req.body;
  return pool.query('DELETE FROM friends WHERE user_id = $1 AND friend_id = $2', [user_id, friend_id]);
};

//  add an image
const addImage = (req) => {
  const { url, uploader_id } = req.body;
  return pool.query('INSERT INTO images (url, uploader_id) VALUES ($1, $2) RETURNING id', [url, uploader_id]);
};

//  add a doodle
const addDoodle = (req) => {
  const {
    url,
    caption,
    original_id,
    doodler_id,
    lat,
    lng,
  } = req.body;

  return pool.query('INSERT INTO doodles (url, caption, original_id, doodler_id, lat, lng) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
    [url, caption, original_id, doodler_id, lat, lng]);
};

//  like a doodle
const addLikedDoodle = (req) => {
  const { userId, doodleId } = req.params;
  //  get current likes count for doodle
  return pool.query('SELECT count FROM doodles WHERE id = $1', [doodleId])
    .then((doodCount) => pool.query('UPDATE doodles set count = $1 WHERE id = $2', [doodCount.rows[0].count + 1, doodleId])) // increment count
    .then(() => pool.query('INSERT INTO likes (user_id, doodle_id) VALUES ($1, $2) RETURNING id', [userId, doodleId])); //  insert pair of user id and doodle id to likes table
};

//  unlike a doodle
const unLikedDoodle = (req) => {
  const { userId, doodleId } = req.params;
  //  get current likes count for doodle
  return pool.query('SELECT count FROM doodles WHERE id = $1', [doodleId])
    .then((doodCount) => pool.query('UPDATE doodles set count = $1 WHERE id = $2', [doodCount.rows[0].count - 1, doodleId])) // decrement count
    .then(() => pool.query('DELETE FROM likes WHERE doodle_id = $1 AND user_id = $2', [doodleId, userId])); //  delete pair of user id and doodle id from likes table
};

//  get all a user's likes using that user's id
const getLikedDoodles = (req) => {
  const { userId } = req.params;
  //  get all id's for doodles user has liked
  return pool.query('SELECT doodle_id FROM likes WHERE user_id = $1', [userId])
    .then((doodleId) => Promise.all(doodleId.rows.map((id) => pool.query('SELECT * from doodles WHERE id = $1', [id.doodle_id])))); //  get each doodle by id
};

//  get all images a user has uploaded using their id, from most recent to least recent
const getUserUploads = (req) => {
  const { id } = req.params;
  return pool.query('SELECT * FROM images WHERE uploader_id = $1 ORDER BY created_at DESC', [id]);
};

//  get an image's url based on its id
const getImageById = (req) => {
  const { id } = req.params;
  return pool.query('SELECT url FROM images WHERE id = $1', [id]);
};

//  get all doodles a user has made
const getUserDoodles = (req) => {
  const { id } = req.params;
  //  query all the doodles, plus the associated username and original image url, from most recent to least recent
  return pool.query('SELECT doodles.*, users.name AS username, images.url AS original_url FROM doodles, users, images WHERE doodles.doodler_id = $1 AND users.id = $1 AND doodles.original_id = images.id ORDER BY created_at DESC', [id]);
};

//  add a user bio
const addBio = (req) => {
  const { user_id, bio } = req.body;
  //  check whether user already has a bio
  return pool.query('SELECT id FROM bios WHERE user_id = $1', [user_id])
    .then((result) => {
      //  if bio exists, update it
      if (result.rowCount) {
        return pool.query('UPDATE bios SET bio = $1 WHERE user_id = $2', [bio, user_id]);
      }
      //  otherwise create a new bio entry
      return pool.query('INSERT INTO bios (bio, user_id) VALUES ($1, $2)', [bio, user_id]);
    });
};

//  get a user's bio using their id
const getBio = (req) => {
  const { userId } = req.params;
  return pool.query('SELECT * FROM bios WHERE user_id = $1', [userId]);
};

//  get all images from database
const getAllUploads = (req) => {
  return pool.query('SELECT * FROM images');
};

// update live doodle in database
const updateLiveDoodle = (req) => {
  const { url } = req.body;
  return pool.query(`UPDATE live SET url = '${url}' WHERE id = ${1}`);
};

//  get live doodle from database
const getLiveDoodle = (req) => {
  return pool.query('SELECT * FROM live');
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
  getAllUploads,
  updateLiveDoodle,
  getLiveDoodle,
};
