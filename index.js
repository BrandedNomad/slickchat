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
    console.log(socket.handshake)
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

        //get username from client
        const username =  nameSpaceSocket.handshake.query.username;
        //When da socket connects to on of the chatgroup namespaces
        //send that namespace group info back
        nameSpaceSocket.emit("nameSpaceRoomLoad",namespace.rooms);
        nameSpaceSocket.on('joinRoom',(roomToJoin)=>{

            //get the room title of current room
            //and then leave that room before joining another room
            let roomToLeave = Array.from(nameSpaceSocket.rooms)[1]
            //console.log(roomToLeave)
            if(roomToLeave !== undefined) {
                console.log("roomToLeave is undefined")
                nameSpaceSocket.leave(roomToLeave)
                updateUsersInRoom(namespace, roomToLeave)
            }


            //Join the rooms
            nameSpaceSocket.join(roomToJoin)
            updateUsersInRoom(namespace,roomToJoin)
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
                username:username,
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
            //forward the message to everyone in that room
            io.of(namespace.endpoint).to(roomTitle).emit("messageToClients",fullMsg)
        })
    })


})

function updateUsersInRoom(namespace, roomToJoin){
    //Return the number of users in a room using the [ack] callback
    let numberOfUsers = 0
    try{
        //if the room is empty the following method will return an error .size undefined
        //so it needs to be called in a try catch block
        numberOfUsers = io.of(namespace.endpoint).adapter.rooms.get(roomToJoin).size
    }catch(error){
        //
    }

    //numberOfUsersCallback(numberOfUsers)
    io.of(namespace.endpoint).in(roomToJoin).emit('updateMembers',numberOfUsers)
}
