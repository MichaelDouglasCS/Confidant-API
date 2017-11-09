/*jshint esnext: true */

/**
 * Model object to represent the Knowledge Schema
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var mongoose = require("mongoose");
var media = require("../media/media");
var knowledge = require("../knowledge/knowledge");
var Schema = mongoose.Schema;

// ------ MODEL --------- //
var chatProfileSchema = Schema({
    id: String,
    nickname: String,
    picture: media.schema
});

var messageSchema = Schema({
    chatID: String,
    id: String,
    timestamp: Number,
    recipientID: String,
    senderID: String,
    content: String,
    isSended: Boolean,
    isReceived: Boolean,
    isReaded: Boolean
});

var chatSchema = Schema({
    id: String,
    createdDate: Number,
    updatedDate: Number,
    userProfile: chatProfileSchema,
    confidantProfile: chatProfileSchema,
    reason: String,
    knowledge: knowledge.schema,
    messages: [messageSchema]
});

//Hide "_v", "password" and rename "_id" 
chatSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        delete ret._id;
        delete ret.__v;
    }
});

var Chat = mongoose.model("Chat", chatSchema);
var ChatProfile = mongoose.model("ChatProfile", chatProfileSchema);
var Message = mongoose.model("Message", messageSchema);

// ----- MODULE EXPORTS -------- //
module.exports = {
    schema: chatSchema,
    Chat: Chat,
    ChatProfile: ChatProfile,
    Message: Message
};
