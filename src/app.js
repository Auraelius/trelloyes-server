// Get our off-the-shelf components
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const uuid = require('uuid/v4');

// get our custom components
const logger = require('./logger');
const cardRouter = require('./card/card-router')
const validateBearerToken = require('./validate-bearer-token')

// Let's configure the app based on the process environment
const { NODE_ENV } = require('./config')
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

// temporarily get access to our data store
const { cards, lists } = require('./store'); // will be moved into router

// Ok, let's get started
const app = express()

// main request pipeline
app.use(morgan(morganOption))
app.use(cors())
app.use(helmet())
app.use(express.json());
app.use(validateBearerToken)
app.use(cardRouter)

// the following stuff still needs to be refactored into its own router
app.get('/list', (req, res) => {
  res
    .json(lists);
});

app.get('/list/:id', (req, res) => {
  const { id } = req.params;
  const list = lists.find(li => li.id == id);

  // make sure we found a list
  if(!list) {
    logger.error(`List with id ${id} not found.`);
    return res
      .status(404)
      .send('List Not Found');
  }

  res.json(list);
});

app.post('/list', (req, res) => {
  const { header, cardIds = [] } = req.body;
  if(!header) {
    logger.error(`Header is required`);
    return res
      .status(400)
      .send('Invalid data');
  }

  // check card ids
  if( cardIds.length > 0 ) {
    let valid = true;
    cardIds.forEach(cid => {
      const card = cards.find(c => c.id == cid);
      if(!card) {
        logger.error(`Card with id ${cid} not found in cards array.`);
        valid = false;
      } 
    });

    if(!valid) {
      return res
        .status(400)
        .send('Invalid data');
    }
  }

  // get an id
  const id = uuid();

  const list = {
    id,
    header,
    cardIds
  };

  lists.push(list);

  logger.info(`List with id ${id} created`);
  
  res
    .status(201)
    .location(`http://localhost:8000/list/${id}`)
    .json({id});

});

app.delete('/list/:id', (req, res) => {
  const { id } = req.params;

  const listIndex = lists.findIndex(li => li.id === id);

  if( listIndex === -1 ) {
    logger.error(`List with id ${id} not found.`);
    return res
      .status(404)
      .send('Not Found');
  }

  lists.splice(listIndex, 1);

  logger.info(`List with id ${id} deleted.`);
  res
    .status(204)
    .end();

});

app.use(function errorHandler(error, req, res, next) {
    let response
    if (NODE_ENV === 'production') {
      response = { error: { message: 'server error' } }
    } else {
      logger.error(error);
      console.error(error)
      response = { message: error.message, error }
    }
    res.status(500).json(response)
})

module.exports = app