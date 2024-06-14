require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const Person = require("./models/person");

const app = express();
const PORT = process.env.PORT;

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());

morgan.token("body", (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms :body")
);

app.get("/", (req, res) => {
  res.send("<h1>Phonebook</h1>");
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
});

app.get("/info", (req, res) => {
  const date = new Date();

  Person.find({}).then((persons) => {
    res.send(
      `<p>Phonebook has info for ${persons.length} people</p><p>${date}</p>`
    );
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).send({ message: "id does not exist" });
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({ error: "missing data" });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person.save().then((savedPerson) => {
    res.json(savedPerson);
  });
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatedPerson) => {
      res.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const errorHandler = (error, req, res, next) => {
  console.log("NAME: ", error.name, "MESSAGE:", error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
