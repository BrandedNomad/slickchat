const username = prompt("What is your username?")

//used for establishing the initial connection
const socket = io('http://localhost:3000',{
    //the query object is sent via
    query:{
        username
    }
});
let nameSpaceSocket = ""


//Listen for nameSpaceList, which is a list of all the namespaces
// returned by the server after the initial connection to the main name space
socket.on('nameSpaceList',(nameSpaceData)=>{

    //populate the UI with the namespaces
    let nameSpacesDiv = document.querySelector(".namespaces");
    nameSpacesDiv.innerHTML = "";
    nameSpaceData.forEach((namespace)=>{
        nameSpacesDiv.innerHTML += `<div class="namespace" ns="${namespace.endpoint}"><img src="${namespace.img}"/></div>`
    })

    //add a click-listener for each namespace
    //clicking on the namespace will reveal a
    //list of the available rooms in that namespace
    Array.from(document.getElementsByClassName('namespace')).forEach((element)=>{
        element.addEventListener('click',(event)=>{
            //Get the namespace of each element
            const nameSpaceEndpoint = element.getAttribute('ns')
            joinNameSpace(nameSpaceEndpoint)

        })
    })

    //This function sets the initial room that the user joins on loading the site
    //
    joinNameSpace('/wiki')

})


