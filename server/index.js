const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const path = require('path');
const db = require('./db');
const Pusher = require('pusher');
const client = require('twilio')(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '../build'),
  wildcard: false,
});
fastify.register(require('fastify-xml-body-parser'));
fastify.register(require('fastify-cors'), {
  origin: '*'
})

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await fastify.listen(PORT, '0.0.0.0');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: 'us2',
});

start();

fastify.post('/api/users', (req, res) => {
  //  check if user who just logged in is already in db
  db.getUserByGoogleId(req, res)
    .then((user) => {
      //  if user is already in db, send back their id
      if (user.rowCount) {
        res.status(200).send(user.rows[0].id);
        return;
      }
      //  otherwise, create the user
      return db.createUser(req, res);
    })
    .then((results) => {
      //  if a user was created, send back their id
      if (results) {
        res.status(201).send(results.rows[0].id);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/users', (req, res) => {
  //  get all usernames
  db.getUsers(req, res)
    .then((user) => {
    res.status(200).send(user.rows)
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/users/:id', (req, res) => {
  //  get a user by their id, then send that user's info back
  db.getUserById(req, res)
    .then((user) => res.status(200).send(user.rows[0]))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/users/find/:name', (req, res) => {
  //  get a user by their name, then send that user's info back
  db.getUserByName(req, res)
    .then((users) => res.status(200).send(users.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/doodles/likes/:userId/:doodleId', (req, res) => {
  //  add a doodle like
  db.addLikedDoodle(req, res)
    .then((doodle) => res.status(200).send(doodle.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/doodles/likes/:userId', (req, res) => {
  //  get all of a user's likes
  db.getLikedDoodles(req, res)
    .then((likedDoods) => res.status(200).send(likedDoods.map((dood) => dood.rows[0])))
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

fastify.patch('/api/doodles/likes/:userId/:doodleId', (req, res) => {
  //  remove a doodle like
  db.unLikedDoodle(req, res)
    .then((doodle) => res.status(200).send(doodle.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/images', (req, res) => {
  //  add an image
  db.addImage(req, res)
    .then((image) => res.status(201).send(image))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/images/:id', (req, res) => {
  //  get a user's uploads
  db.getUserUploads(req, res)
    .then((images) => res.status(200).send(images.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/doodles/:id', (req, res) => {
  //  get a user's doodles
  db.getUserDoodles(req, res)
    .then((doodles) => res.status(200).send(doodles.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/doodles', (req, res) => {
  // add a doodle
  db.addDoodle(req, res)
    .then((results) => res.status(201).send(results.rows[0].id))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/originals/:id', (req, res) => {
  //  get an image's url
  db.getImageById(req, res)
    .then((results) => res.status(200).send(results.rows[0].url))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/friends', (req, res) => {
  //  add a friend request to db
  db.addFriend(req, res)
    .then((result) => res.status(201).send(result))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/friends/:id', (req, res) => {
  //  get a user's confirmed friends
  db.getFriends(req, res)
    .then((friends) => res.status(200).send(friends.map((friend) => friend.rows[0])))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/comments/:doodle_id', (req, res) => {
  //  get a doodle's comments
  db.getComments(req, res)
    .then((result) => res.status(200).send(result))
    .catch((err) => {
      console.error(err);
      res.status(500).send('Unable to retrieve comments');
    });
});

fastify.post('/api/comments', (req, res) => {
  //  add a comment to db
  db.addComments(req, res)
    .then((result) => res.status(201).send(result.rows[0].id))
    .catch((err) => {
      console.error(err);
      res.status(500).send('Unable to post Comments');
    });
});

fastify.get('/api/friends/requests/:id', (req, res) => {
  //  get a user's incoming friend requests
  db.getFriendRequests(req, res)
    .then((requests) => res.status(200).send(requests.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/bios', (req, res) => {
  //  add a user bio
  db.addBio(req, res)
    .then(() => res.status(201).send())
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/bios/:userId', (req, res) => {
  //  get a user's bio
  db.getBio(req, res)
    .then((bio) => {
      if (bio.rowCount) {
        res.status(200).send(bio.rows[0].bio); // send back bio if it exists
      } else {
        res.status(200).send(''); //  otherwise send back an empty string
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.delete('/api/doodles/:doodleid', (req, res) => {
  //  delete a doodle
  db.deleteDoodle(req, res)
    .then(() => res.status(200).send())
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

fastify.delete('/api/images/:imageId', (req, res) => {
  //  delete an image
  db.deleteImage(req, res)
    .then(() => res.status(200).send())
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

fastify.post('/live', (req, res) => {
  pusher.trigger('painting', 'draw', req.body);
  res.send(req.body);
});

fastify.get('/*', (req, res) => res.sendFile('index.html'));

fastify.post('/api/messages', (req, res) => {
  console.log(req.body.to);
  client.messages
    .create({
      body: "check out this cool site https://google.com",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: req.body.to,
    })
    .then((message) => {
      console.log(message.sid);
    })
    .catch(err => {
      console.log(err);
      res.send("Dood not sent");
    });
});

fastify.get('/api/images', (req, res) => {
  //  get all uploads
  db.getAllUploads(req, res)
    .then((images) => res.status(200).send(images.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/message', (req, res) => {
  console.log('connected with server')
  const payload = req.body;
  pusher.trigger('chat', 'message', payload);
  res.send(payload)
});
