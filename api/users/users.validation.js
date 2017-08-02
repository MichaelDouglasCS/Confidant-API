/*jshint esnext: true */

/**
 * Module containing functions used to validate requests related to Users operations
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 * 
 */
let validator = require('validator');

// ------- PUBLIC METHODS -------- //

/**
 * A method to throw an exception when the user where not found.
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
let userNotFound = function() {
    let errors = { status: 401 };
    errors.errorCode = 401;
    errors.errorMessage = "Incorrect email or password.";
    return errors;
};

/**
 * A method to throw an exception when the email is invalid.
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
let emailIsNotValid = function() {
    let errors = { status: 401 };
    errors.errorCode = 402;
    errors.errorMessage = "Please, fill the field with a valid email.";
    return errors;
};

/**
 * A method to throw an exception when the email is already in use.
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
let emailAlreadyInUse = function() {
    let errors = { status: 401 };
    errors.errorCode = 403;
    errors.errorMessage = "The email is already in use.";
    return errors;
};

/**
 * A method to throw an exception when occured an internal error.
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
let internalError = function() {
    let errors = { status: 401 };
    errors.errorCode = 404;
    errors.errorMessage = "Internal Error.";
    return errors;
};

// ----- MODULE EXPORTS -------- //
module.exports = {
    userNotFound: userNotFound,
    emailIsNotValid: emailIsNotValid,
    emailAlreadyInUse: emailAlreadyInUse,
    internalError: internalError
};