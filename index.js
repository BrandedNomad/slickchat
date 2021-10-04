//imports
const express = require('express')
const {Server} = require("socket.io")
const path = require("path")
let namespaces = require('./data/namespaces')



//Creating an express server
const app = express()
const pathToPublicDirectory = path.join(__dirname,'./public')
app.use(express.static(pathToPublicDirectory)) //setting up public directory
const expressServer = app.listen(3000,()=>{
    console.log("Server up and running on port 3000")
})

//wrapping express server inside of io server
const io = new Server(expressServer)


/**
 * @MainNameSpace
 * @Description This is the main namespace that handles the initial connection
 * of clients. Whenever a client first connects to the server, the server responds
 * by creating a list of existing and available namespaces, which is then sent
 * back to the client
 */
io.on("connection",(socket)=>{
    //build an array to send back with the img and endpoint for each NS
    let nameSpaceData = namespaces.map((namespace)=>{
        return {
            img:namespace.img,
            endpoint:namespace.endpoint
        }
    })

    socket.emit("nameSpaceList",nameSpaceData)
})

//Loop through each namespace and listen for a connection
namespaces.forEach((namespace)=>{
    const thisNameSpace = io.of(namespace.endpoint)
    thisNameSpace.on('connection',(nameSpaceSocket)=>{

        //When da socket connects to on of the chatgroup namespaces
        //send that namespace group info back
        nameSpaceSocket.emit("nameSpaceRoomLoad",namespace.rooms);
        nameSpaceSocket.on('joinRoom',(roomToJoin)=>{


            //Join the room
            nameSpaceSocket.join(roomToJoin)
           //Return the number of users in a room using the [ack] callback
            let numberOfUsers = io.of(namespace.endpoint).adapter.rooms.get(roomToJoin).size
            //numberOfUsersCallback(numberOfUsers)
            io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers',numberOfUsers)

            //retrieve chat history of the room
            //first we need to find the room object for this room
            const nsRoom = namespace.rooms.find((room)=>{
                return room.roomTitle === roomToJoin
            })

            //second, we need to send the chat history to the client
            nameSpaceSocket.emit('historyCatchUp',nsRoom.history)

            //Send back number of users in thsi room to all Sockets connected to the room

        })

        nameSpaceSocket.on("newMessageToServer",(msg)=>{
            //format message
            const fullMsg = {
                text:msg.text,
                time:Date.now(),
                username:"charl",
                avatar:"https://via.placeholder.com/30"
            }
            //figure out which room it was sent from
            let roomKeys = []
            nameSpaceSocket.rooms.forEach((room)=>{
                roomKeys.push(room)
            })
            let roomTitle = roomKeys[1]

            //we need to find the room object for this room
            const nsRoom = namespace.rooms.find((room)=>{
                return room.roomTitle === roomTitle
            })

            nsRoom.addMessage(fullMsg)
            console.log(nsRoom)
            //forward the message to everyone in that room
            io.of(namespace.endpoint).to(roomTitle).emit("messageToClients",fullMsg)
        })
    })


})
