const inicioDebug = require('debug')('app:inicio');
// const dbDebug = require('debug')('app:db');
const express = require("express");
const app = express();
const Joi = require("joi");
// const logger = require("./Logger");
const morgan = require("morgan");
const config = require("config");

app.use(express.json()); //Body

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//Configuracion de entorno
console.log("Aplicación: " + config.get("nombre"));
console.log("BD Server: " + config.get("configDB.host"));

//Uso de un middleware de terceros -MORGAN
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  // console.log("Morgan habilitado....");
  inicioDebug('Morgan esta habilitado...')
}

//Trabajos con la base de datos
dbDebug('Conectando con la base de datos....')

// app.use(logger);
//                                                     //Funciones MIDDLEWARE (Es lo que se procesa antes de enviar una respuesta al usuario)
// app.use(function(req,res,next){
//   console.log('Autenticando....');
//   next();
// })

const usuarios = [
  { id: 1, nombre: "Grover" },
  { id: 2, nombre: "Pablo" },
  { id: 3, nombre: "Ana" },
];

app.get("/", (req, res) => {
  res.send("Hola mundo desde express");
}); //Peticion

app.get("/api/usuarios", (req, res) => {
  res.send(usuarios);
});

app.get("/api/usuarios/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) res.status(404).send("El usuario no fue encontrado");
  res.send(usuario);
});

app.post("/api/usuarios", (req, res) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).max(10).required(),
  });

  const { error, value } = validarUsuario(req.body.nombre);
  if (!error) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: value.nombre,
    };
    usuarios.push(usuario);
    res.send(usuario);
  } else {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
  }

  // if (!req.body.nombre || req.body.nombre.length <= 2) {
  //   //400 bad request
  //   res.status(400).send("Debe ingresar un nombre, que tenga mínimo 3 letras.");
  //   return;
  // }
});

app.put("/api/usuarios/:id", (req, res) => {
  //Encontrar si existe el objeto usuario
  // let usuario = usuarios.find((u) => u.id === parseInt(req.params.id));
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no fue encontrado");
    return;
  }

  const schema = Joi.object({
    nombre: Joi.string().min(3).max(10).required(),
  });

  const { error, value } = validarUsuario(req.body.nombre);
  if (error) {
    const mensaje = error.details[0].message;
    res.status(400).send(mensaje);
    return;
  }
  usuario.nombre = value.nombre;
  res.send(usuario);
});

app.delete("/api/usuarios/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no fue encontrado");
    return;
  }

  const index = usuarios.indexOf(usuario);
  usuarios.splice(index, 1);
  res.send(usuario);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}...`);
});

function existeUsuario(id) {
  return usuarios.find((u) => u.id === parseInt(id));
}

function validarUsuario(nom) {
  const schema = Joi.object({
    nombre: Joi.string().min(3).max(10).required(),
  });

  return schema.validate({ nombre: nom });
}
