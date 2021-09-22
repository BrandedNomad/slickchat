//imports
const express = require('express')
const {Server} = require("socket.io")
const path = require("path")

//Creating an express server
const app = express()
const pathToPublicDirectory = path.join(__dirname,'./public')
app.use(express.static(pathToPublicDirectory)) //setting up public directory
const expressServer = app.listen(3000,()=>{
    console.log("Server up and running on port 3000")
})

//wrapping express server inside of io server
const io = new Server(expressServer)

//io connection handler
//listens for any socket connecting to the server
io.on("connection",(socket)=>{
    console.log("Someone connected to the main namespace")
    socket.emit("connectionSuccess", "Successfully connected to server")

    //chat
    socket.on('newMessageToServer',(msg)=>{
        io.emit('messageToClients',{text:msg.text})
    })

    //join the rooms
    socket.join('level1')
    socket.to('level1').emit('joined','I have joined the level 1 room')
})

//Admin Channel
io.of('/admin').on('connection',(socket)=>{
    console.log("someone connected to the admin namespace")
    io.of('/admin').emit('connectionSuccess',"Welcome to the admin channel!")
})
