const fastify = require('fastify')({ logger: true });
require('dotenv').config();
const path = require('path');
const db = require('./db');

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '../build'),
  wildcard: false,
});

const PORT = process.env.PORT || 4000;

const start = async () => {
  try {
    await fastify.listen(PORT, '0.0.0.0');
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();

fastify.post('/api/users', (req, res) => {
  db.getUserByGoogleId(req, res)
    .then((user) => {
      if (user.rowCount) {
        res.status(200).send(user.rows[0].id);
        return;
      }
      return db.createUser(req, res);
    })
    .then((results) => {
      if (results) {
        res.status(201).send(results.rows[0].id);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/users/:id', (req, res) => {
  db.getUserById(req, res)
    .then((user) => res.status(200).send(user.rows[0]))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/users/find/:name', (req, res) => {
  db.getUserByName(req, res)
    .then((users) => res.status(200).send(users.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/doodles/likes/:userId/:doodleId', (req, res) => {
  db.addLikedDoodle(req, res)
    .then((doodle) => res.status(200).send(doodle.rows))
    .catch((err) => {
      console.error(err);
      res.status.send();
    });
});

fastify.get('/api/doodles/likes/:userId', (req, res) => {
  db.getLikedDoodles(req, res)
    .then((likedDoods) => res.status(200).send(likedDoods.map((dood) => dood.rows[0])))
    .catch((err) => {
      console.log(err);
      res.status.send();
    });
});

fastify.patch('/api/doodles/likes/:userId/:doodleId', (req, res) => {
  db.unLikedDoodle(req, res)
    .then((doodle) => res.status(200).send(doodle.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/images', (req, res) => {
  db.addImage(req, res)
    .then((image) => res.status(201).send(image))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/images/:id', (req, res) => {
  db.getUserUploads(req, res)
    .then((images) => res.status(200).send(images.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/doodles/:id', (req, res) => {
  db.getUserDoodles(req, res)
    .then((doodles) => res.status(200).send(doodles.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/doodles', (req, res) => {
  db.addDoodle(req, res)
    .then((results) => res.status(201).send(results.rows[0].id))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/originals/:id', (req, res) => {
  db.getImageById(req, res)
    .then((results) => res.status(200).send(results.rows[0].url))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/friends', (req, res) => {
  db.addFriend(req, res)
    .then((result) => res.status(201).send(result))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/friends/:id', (req, res) => {
  db.getFriends(req, res)
    .then((friends) => res.status(200).send(friends.map((friend) => friend.rows[0])))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/comments/:doodle_id', (req, res) => {
  db.getComments(req, res)
    .then((result) => res.status(200).send(result))
    .catch((err) => {
      console.error(err);
      res.status(500).send('Unable to retrieve comments');
    });
});

fastify.post('/api/comments', (req, res) => {
  db.addComments(req, res)
    .then((result) => res.status(201).send(result.rows[0].id))
    .catch((err) => {
      console.error(err);
      res.status(500).send('Unable to post Comments');
    });
});

fastify.get('/api/friends/requests/:id', (req, res) => {
  db.getFriendRequests(req, res)
    .then((requests) => res.status(200).send(requests.rows))
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.post('/api/bios', (req, res) => {
  db.addBio(req, res)
    .then(() => res.status(201).send())
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.get('/api/bios/:userId', (req, res) => {
  db.getBio(req, res)
    .then((bio) => {
      if (bio.rowCount) {
        res.status(200).send(bio.rows[0].bio);
      } else {
        res.status(200).send('');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send();
    });
});

fastify.delete('/api/doodles/:doodleid', (req, res) => {
  db.deleteDoodle(req, res)
    .then(() => res.status(200).send())
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

fastify.delete('/api/images/:imageId', (req, res) => {
  db.deleteImage(req, res)
    .then(() => res.status(200).send())
    .catch((err) => {
      console.log(err);
      res.status(500).send();
    });
});

fastify.get('/*', (req, res) => res.sendFile('index.html'));
