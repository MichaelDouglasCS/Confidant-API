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
let validator = require("validator");

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
    let errors = { status: 402 };
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
    let errors = { status: 403 };
    errors.errorMessage = "The email is already in use.";
    return errors;
};

/**
 * A method to throw an exception when was not possible get the email.
 *
 * @author Michael Douglas
 * @since 03/08/2017
 *
 * History:
 * 03/08/2017 - Michael Douglas - Initial creation.
 *
 */
let emailNotFound = function() {
    let errors = { status: 404 };
    errors.errorMessage = "Sorry! Not was possible get the email.";
    return errors;
};

/**
 * A method to throw an exception when occurred an error on Facebook.
 *
 * @author Michael Douglas
 * @since 03/08/2017
 *
 * History:
 * 03/08/2017 - Michael Douglas - Initial creation.
 *
 */
let facebookError = function() {
    let errors = { status: 405 };
    errors.errorMessage = "Sorry! Occurred an error on Facebook, please, try again.";
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
    let errors = { status: 406 };
    errors.errorMessage = "Internal Error.";
    return errors;
};

/**
 * A method to throw an exception when token not were informed.
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
let tokenNotInformed = function() {
    let errors = { status: 407 };
    errors.errorMessage = "Access forbidden, no token informed.";
    return errors;
};

/**
 * A method to throw an exception when token were invalid.
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
let invalidToken = function() {
    let errors = { status: 408 };
    errors.errorMessage = "Informed token is invalid.";
    return errors;
};

// ----- MODULE EXPORTS -------- //
module.exports = {
    userNotFound: userNotFound,
    emailIsNotValid: emailIsNotValid,
    emailNotFound: emailNotFound,
    emailAlreadyInUse: emailAlreadyInUse,
    facebookError: facebookError,
    internalError: internalError
};