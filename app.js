const express = require('express');
const fs = require("fs");
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
const port = process.env.port || 4000;
const { Client, Pool } = require('pg');

//read credentials from .env file
const credentials = {
    user: process.env.db_user_, 
    host: process.env.db_host_, 
    database: process.env.db_database_,
    password: process.env.db_password_, 
    port: process.env.db_port_
};

const showResults = (response, error, results) => {
    if (error) {
        console.log(error);
        results.status(200).json([]);
    }
    response.status(200).json(results.rows);
}
async function getPersons(req, res) {
    const pool = new Pool(credentials);
    const text = `SELECT * FROM persons order by id limit 50`;
    pool.query(text, (error, results) => {
        showResults(res, error, results);
    });
}
async function getPerson(req, res) {
    const id = parseInt(req.params.id)
    const pool = new Pool(credentials);
    const text = `SELECT * FROM persons WHERE id = $1`;
    const values = [id];
    return pool.query(text, values, (error, results) => {
        showResults(res, error, results);
    });
}

async function addPerson(req, res) {
    const { id, name, phone, age } = req.body
    const pool = new Pool(credentials);
    const text = `
      INSERT INTO persons (id, name, phone, age)
      VALUES ($1, $2, $3, $4)
      RETURNING id`;
    const values = [id, name, phone, age];
    return pool.query(text, values, (error, results) => {
        if (error) {
            console.log(error);
        }
        res.status(200).json(`Person added with ID: ${results.rows[0].id}`);
    });
}

async function updatePerson(req, res) {
    const { id, name, phone, age } = req.body
    const pool = new Pool(credentials);
    const text = `UPDATE persons SET (name, phone, age) = 
                  ($2, $3, $4) WHERE id = $1`;
    const values = [id, name, phone, age];
    return pool.query(text, values, (error, results) => {
        if (error) {
            res.status(200).json(error);
            return;
        }
        res.status(200).json(`Person with ID: ${id} updated`);
    });
}

async function deletePerson(req, res) {
    const id = parseInt(req.body.id)
    const pool = new Pool(credentials);
    const text = `DELETE FROM persons WHERE id = $1`;
    const values = [id];
    return pool.query(text, values, (error, results) => {
        if (error) {
            res.status(200).json(error);
            return;
        }
        res.status(200).json(`Person with ID: ${id} deleted`);
    });
}

app.get('/api/persons', (req, res) => getPersons(req, res));
app.get('/api/persons/:id', (req, res) => getPerson(req, res));
app.post('/api/persons', (req, res) => addPerson(req, res));
app.put('/api/persons/:id', (req, res) => updatePerson(req, res));
app.delete('/api/persons/:id', (req, res) => deletePerson(req, res));

app.use(express.static(__dirname + "/www"));

app.listen(port, function () {
    console.log("Server listening at port " + port)
})