const express = require('express');
const { request } = require('https');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const custumers = [];

// Middleware
function verifyIfExistsAccountCpf(req, res, next) {
  const { cpf } = req.headers;

  const custumer = custumers.find((custumer) => custumer.cpf === cpf);

  if (!custumer) {
    return res.status(400).json({ error: 'Custumer not found' });
  }

  req.custumer = custumer;

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

  const custumerAlreadyExists = custumers.some(
    (custumer) => custumer.cpf === cpf
  );

  if (custumerAlreadyExists) {
    return res.status(400).json({ error: 'Custumer alread exists' });
  }

  custumers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return res.status(201).send(custumers);
});

app.use(verifyIfExistsAccountCpf);

app.get('/statement', (req, res) => {
  const { custumer } = req;
  return res.json(custumer.statement);
});

app.get('/statement/date', (req, res) => {
  const { custumer } = req;
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

  const { custumer } = req;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  custumer.statement.push(statementOperation);

  return res.status(201).send();
});

app.post('/withdraw', (req, res) => {
  const { amount } = req.body;
  const { custumer } = req;

  const balance = getBalance(custumer.statement);

  if (balance < amount) {
    res.status(400).json({ error: 'Insuficient funds!' });
  }

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };

  custumer.statement.push(statementOperation);

  return res.status(201).send();
});

app.put('/account', (req, res) => {
  const { name } = req.body;
  const { custumer } = req;

  custumer.name = name;

  return res.status(201).send();
});

app.get('/account', (req, res) => {
  const { custumer } = req;

  return res.json(custumer);
});

app.listen(3333);
