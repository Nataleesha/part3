const express = require("express");
const morgan = require("morgan");

const app = express();
const PORT = 3001;

let contacts = require("./data.json");

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
  res.send(contacts);
});

app.get("/info", (req, res) => {
  const date = new Date();
  res.send(
    `<p>Phonebook has info for ${contacts.length} people</p><p>${date}</p>`
  );
});

app.get("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  const person = contacts.find((contact) => contact.id === id);
  if (person) {
    res.send(person);
  } else {
    res.statusMessage = "No person found";
    res.status(404).send("<p>404 - No person found</p>");
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = Number(req.params.id);
  contacts = contacts.filter((contact) => contact.id !== id);

  res.status(204).end();
});

app.post("/api/persons", (req, res) => {
  const person = req.body;

  if (!person.name || !person.number) {
    res.status(400).send({ error: "missing data" });
  } else if (
    contacts.find(
      (contact) => contact.name.toLowerCase() === person.name.toLowerCase()
    )
  ) {
    res.status(400).send({ error: "name already is in phonebook" });
  } else {
    const newPerson = { id: Math.floor(Math.random() * 999999), ...person };
    contacts = contacts.concat(newPerson);
    res.json(newPerson);
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
