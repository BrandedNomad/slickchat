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

    //search for messages
    let searchBox = document.querySelector("#search-box");
    searchBox.addEventListener('input',(e)=>{
        let messages = Array.from(document.getElementsByClassName("message-text"))
        messages.forEach((msg)=>{
            if(msg.innerText.indexOf(e.target.value.toLowerCase()) === -1){
                //the msg does not contain the user search term!
                msg.style.display = "none"
            }else{
                msg.style.display = "block"
                console.log("yes",msg)
            }
        })

    })

}
