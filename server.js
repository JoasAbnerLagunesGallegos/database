const express = require('express');

class Server{
    constructor(){
        this.app = express(); //instancia de express
        this.port = 3000 // puerto para el servidor
        this.basePath = '/api/v1';
        this.usersPath = `${basePath}/users`; // http://localhost:3000/api/v1/users
        this.middlewares();
    }
    middlewares(){
        this.app.use(express.json()); // para poder intepretar texto
    }
    routes(){
        this.app.use(PATH, FUNCTION);
    }
    listen(){
        this.app.listen(this.port,() => {
            console.log("Listening on port " + this.port);
        })
    }
}

module.exports = Server;