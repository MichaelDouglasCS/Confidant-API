var user = require("../user/user");
var chat = require("../chat/chat");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// ------ MODEL --------- //
var socketSchema = Schema({
    userID: String,
    socketID: String
});

//Hide "_v", "password" and rename "_id" 
socketSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

var Socket = mongoose.model("Socket", socketSchema);

var connectedSockets = [];

var clientRecipient = function (userID) {
    let socketID = 0

    connectedSockets.forEach((socket) => {
        if (socket.userID == userID) {
            socketID = socket.socketID;
        }
    });

    return socketID
}

exports = module.exports = function (serverIO) {
    // Set client.io listeners.
    serverIO.on("connection", (client) => {

        if (connectedSockets.length == 0) {
            let newSocket = new Socket();
            newSocket.socketID = client.id;
            connectedSockets.push(newSocket);
        }

        client.emit("updateSocket", (userID) => {
            let isUpdate = false
            let newSocket = new Socket();
            newSocket.userID = userID;
            newSocket.socketID = client.id;

            connectedSockets.forEach((socket) => {
                if (socket.userID == newSocket.userID) {
                    socket.socketID = newSocket.socketID;
                    isUpdate = true;
                } else if (socket.socketID == newSocket.socketID) {
                    socket.userID = newSocket.userID;
                    isUpdate = true;
                }
            });

            if (!isUpdate) {
                connectedSockets.push(newSocket);
            }
        });

        client.on("updateSocketUser", (userID) => {
            let isUpdate = false
            let newSocket = new Socket();
            newSocket.userID = userID;
            newSocket.socketID = client.id;

            connectedSockets.forEach((socket) => {
                if (socket.userID == newSocket.userID) {
                    socket.socketID = newSocket.socketID;
                    isUpdate = true;
                } else if (socket.socketID == newSocket.socketID) {
                    socket.userID = newSocket.userID;
                    isUpdate = true;
                }
            });

            if (!isUpdate) {
                connectedSockets.push(newSocket);
            }
        });
        console.log("User Connected");

        //Start Conversation With an Confidant
        client.on("startConversation", (chatReceived, callback) => {
            let chatInfo = new chat.Chat(chatReceived);

            user.matchConfidantByKnowledgeId(chatInfo.knowledge.id)
                .then((confidantID) => {
                    if (confidantID) {
                        let socketID = clientRecipient(confidantID);

                        if (serverIO.sockets.connected[socketID]) {
                            serverIO.sockets.connected[socketID].emit("match", chatInfo, (response) => {
                                let chat = response[0]

                                if (chat) {
                                    callback(chat);
                                } else {
                                    callback(chat);
                                }
                            });
                        } else {
                            callback("Error, No Confidant Available");
                        }
                    } else {
                        callback("Error, No Confidant Available");
                    }
                }).catch((error) => callback(error));
        });

        //Send Message
        client.on("sendMessage", (messageReceived) => {
            let message = new chat.Message(messageReceived);

            let socketID = clientRecipient(message.recipientID);

            if (serverIO.sockets.connected[socketID]) {
                serverIO.sockets.connected[socketID].emit("message", message);
            }
        });

        client.on("disconnect", () => {
            connectedSockets.forEach((socket) => {
                if (socket.socketID == client.id) {
                    var index = connectedSockets.indexOf(socket);
                    connectedSockets.splice(index, 1);
                }
            });
            console.log("User Disconnected");
        });
    });
};
