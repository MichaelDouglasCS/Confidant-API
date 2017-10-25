var user = require("../user/user");
var mongoose = require("mongoose");
var fs = require("fs");
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

        client.emit("updateSocket", client.id, (userID) => {
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

        client.on("updateSocketTeste", (userID) => {
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
        client.on("startConversation", (chatInfo, callback) => {
            let userID = chatInfo.userID;
            let knowledgeID = chatInfo.knowledgeID;

            user.listById(userID)
                .then((userDB) => {
                    let profile = userDB.profile;

                    user.matchConfidantByKnowledgeId(knowledgeID)
                        .then((confidantID) => {
                            if (confidantID) {
                                let socketID = clientRecipient(confidantID);

                                if (serverIO.sockets.connected[socketID]) {
                                    serverIO.sockets.connected[socketID].emit("match", profile, (response) => {
                                        console.log(response);
                                    });
                                } else {
                                    console.log("Error, No Confidant Available");
                                }
                            } else {
                                console.log("Error, No Confidant Available");
                            }
                        }).catch((error) => {
                            // client.emit("findConfidantError", error);
                            console.log("Error: " + error);
                        });
                }).catch((error) => {
                    // client.emit("findConfidantError", error);
                    console.log("Error: " + error);
                });
        });

        client.on("disconnect", () => {
            connectedSockets.forEach((socket) => {
                if (socket.socketID == client.id) {

                    if (socket.userID) {
                        socket.socketID = undefined;
                    } else {
                        var index = connectedSockets.indexOf(socket);
                        connectedSockets.splice(index, 1);
                    }
                }
            });
            console.log("User Disconnected");
        });
    });
};
