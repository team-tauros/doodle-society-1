# Doodle Society

Ever wanted to draw on your friend's face? Now you can with little to no reprecussions. Come join our doodle society. Share images of yourself for others to mercilessly doodle upon. Share your favorite doodles with your friends. Send doods!

## Team

  - __Scrum Master__: Jeremy Webber
  - __Development Team Members__: Michael Bazile, Kenny Dang, Harley Padua, Nico Paulino, Jeremy Webber 

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Team](#team)
1. [Contributing](#contributing)

## Usage

> Some usage instructions

## Requirements

- Node 0.10.x
- Postgresql 9.1.x

## Development

### Installing Dependencies

From within the root directory:

```sh
npm install
```
Make sure you have PostgreSQL installed and have a password set for your root user.

While still in the root directory, shell into your PostgreSQL server and run:

```sh
CREATE DATABASE doodle;
```
After doodle database is successfully created, connect to it by running:

```sh
\c doodle
```

Load up the schema by running:

```sh
\i schema.sql
```

Create the trigrams extension in doodle database by running:

```sh
CREATE EXTENSION pg_trgm
```

Create a Cloudinary account. Take note of your cloud name. Create an upload preset with ... Take note of its name as well. 

Create a .env file in the root directory:

```sh
DBUSER=postgres
DBPASS=YOUR_PASSWORD
CLOUDNAME=YOUR_CLOUD_NAME
CLOUDPRESET=YOUR_CLOUD_PRESET
```

Fill in the appropriate values.

To run a live-updating version of Doodle Society for development run:

```sh
npm run start-dev
```

Make sure to also run the API server:

```sh
npm start
```

And you're ready to go!

### Roadmap

View the project roadmap [here](https://github.com/TeamNoodle/doodle-society/issues)


## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.
