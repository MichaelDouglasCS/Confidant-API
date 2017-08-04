// userType.enum.js

/**
 * Enum to represent type of user
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 * 
 */
let Enum = require("enum");

let TypeOfUser = new Enum({
    USER: "user",
    CONFIDANT: "confidant"
});

module.exports = {
    TypeOfUser: TypeOfUser
};