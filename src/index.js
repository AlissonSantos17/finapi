const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(express.json());

const costumers = [];

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
    return res.status(400).json({ error: 'Costumer alread exists!' });
  }

  costumers.push({
    cpf,
    name,
    id: uuidv4(),
    statement: [],
  });

  return res.status(201).send(costumers);
});

app.listen(3333);
