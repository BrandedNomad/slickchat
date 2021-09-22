
class Room {
    constructor(roomId, roomTitle, namespace, privateRoom = false){
        this.roomId = roomId;
        this.roomTitle = roomTitle;
        this.namespace = namespace;
        this.privatRoom = privateRoom;
        this.history = []
    }

    addMessage(message){
        this.history.push(message)
    }

    clearHistory(){
        this.history = []
    }
}

module.exports = Room
