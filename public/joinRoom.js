const joinRoom = (roomName) =>{
    //Send roomName to the server
    nameSpaceSocket.emit('joinRoom', roomName)

    //Populate ui with chat history
    nameSpaceSocket.on("historyCatchUp",(history)=>{
       let element = document.getElementById("messages")

        history.forEach((msg)=>{
            element.innerHTML += buildHTML(msg)
        })

        //element.scrollTo(0,element.scrollHeight)
    })

    nameSpaceSocket.on('updateMembers',(newNumberOfMembers)=>{
        // update the room member total who have joined.
        document.querySelector('.curr-room-num-users').innerHTML = `${newNumberOfMembers} <span class="glyphicon glyphicon-user"></span>`
        document.querySelector('.curr-room-text').innerText = `${roomName}`
    })

}
