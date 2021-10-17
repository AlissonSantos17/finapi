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

function getBalance(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    } else {
      return acc - operation.amount;
    }
  }, 0);
  return balance;
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

app.use(verifyIfExistsAccountCpf);

app.get('/statement', (req, res) => {
  const { costumer } = req;
  return res.json(costumer.statement);
});

app.get('/statement/date', (req, res) => {
  const { costumer } = req;
  const { date } = req.query;

  const dateFormat = new Date(date + ' 00:00');

  const statemet = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );

  return res.json(statemet);
});

app.post('/deposit', (req, res) => {
  const { description, amount } = req.body;

  const { costumer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  costumer.statement.push(statementOperation);

  return res.status(201).send();
});

app.post('/withdraw', (req, res) => {
  const { amount } = req.body;
  const { costumer } = req;

  const balance = getBalance(costumer.statement);

  if (balance < amount) {
    res.status(400).json({ error: 'Insuficient funds!' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  costumer.statement.push(statementOperation);

  return res.status(201).send();
});

app.listen(3333);
