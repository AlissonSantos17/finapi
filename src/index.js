const express = require('express');
const { request } = require('https');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const costumers = [];

// Middleware
function verifyIfExistsAccountCpf(req, res, next) {
  const { cpf } = req.headers;

  const costumer = costumers.find((costumer) => costumer.cpf === cpf);

  if (!costumer) {
    return res.status(400).json({ error: 'Costumer not found' });
  }

  req.costumer = costumer;

  return next();
}

/**
 * cpf - string
 * name - string
 * id - uuid
 * statement - []
 */

app.post('/account', (req, res) => {
  const { cpf, name } = req.body;

  const costumerAlreadyExists = costumers.some(
    (costumer) => costumer.cpf === cpf
  );

  if (costumerAlreadyExists) {
    return res.status(400).json({ error: 'Costumer alread exists' });
  }

  costumers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return res.status(201).send(costumers);
});

app.get('/statement', verifyIfExistsAccountCpf, (req, res) => {
  const { costumer } = req;
  return res.json(costumer.statement);
});

app.listen(3333);
