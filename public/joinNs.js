function joinNameSpace(endpoint){
    //check if nameSpaceSocket is an actual socket, and if it is
    //first close the socket before creating a new one.
    if(nameSpaceSocket){
        nameSpaceSocket.close();
    }
    //establishes a connection to the namespace provided
    nameSpaceSocket = io(`http://localhost:3000${endpoint}`)
    //Sets a listener that listens for the requested namespace
    nameSpaceSocket.on("nameSpaceRoomLoad",(nameSpaceRooms)=>{

        //Populate the UI with room names associated with namespace
        let roomList = document.querySelector('.room-list');
        roomList.innerHTML = ""
        nameSpaceRooms.forEach((room)=>{
            let glyph
            if(room.privatRoom){
                glyph = 'lock'
            }else{
                glyph = "globe"
            }
            roomList.innerHTML += `<li class="room"><span class="glyphicon glyphicon-${glyph}">${room.roomTitle}</span></li>`
        })

        //Add click listeners to each room name
        let roomNodes = document.getElementsByClassName("room");
        Array.from(roomNodes).forEach((element)=>{
            element.addEventListener('click',(event)=>{
                console.log("someone clicked on ", event.target.innerHTML)
            })
        })

        //sets the initial room when user first clicks on the namespace
        let topRoom = document.querySelector('.room');
        let topRoomName = topRoom.innerText;
        joinRoom(topRoomName)
    })




    //Seeing that messages will always be sent and received within a room
    //the following two methods are added to this function

    //receives messages from the server
    nameSpaceSocket.on('messageToClients',(msg)=>{
        const newMsg = buildHTML(msg)
        document.querySelector('#messages').innerHTML += newMsg
    })

    //Sends messages to the server
    document.querySelector('.message-form').addEventListener('submit',(event)=>{
        event.preventDefault()
        const newMessage = document.querySelector('#user-message').value;
        nameSpaceSocket.emit('newMessageToServer',{text:newMessage})
    })
}

function buildHTML(msg){
    const convertedDate = new Date(msg.time).toLocaleString()
    const newHTML = `
    <li>
        <div class="user-image">
            <img src="${msg.avatar}"/>
        </div>
        <div>
            <div class="user-name-time">${msg.username} <span>${convertedDate}</span></div>
            <div class="message-text">${msg.text}</div>
        </div>
    </li>
    `
    return newHTML
}
