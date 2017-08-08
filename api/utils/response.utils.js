/*jshint esnext: true */
const SUCCESS_RESPONSE_CODE = 0;
const SUCCESS_RESPONSE_MESSAGE = "Success";

const INTERNAL_ERROR_RESPONSE_CODE = 500;
const INTERNAL_ERROR_RESPONSE_MESSAGE = "Internal server error.";

const NOT_FOUND_ERROR_RESPONSE_CODE = 404;
const NOT_FOUND_ERROR_RESPONSE_MESSAGE = "The requested method were not found.";

const INVALID_TOKEN_ERROR_RESPONSE_CODE = 403;
const INVALID_TOKEN_ERROR_RESPONSE_MESSAGE = "Informed token is invalid or expired.";

const TOKEN_NOT_FOUND_ERROR_RESPONSE_CODE = 403;
const TOKEN_NOT_FOUND_ERROR_RESPONSE_MESSAGE = "Access forbidden, no token informed.";

const ENTITY_ALREADY_EXISTS_ERROR_RESPONSE_CODE = 409;
const ENTITY_ALREADY_EXISTS_ERROR_RESPONSE_MESSAGE = "Cannot process POST, entity already exists.";

const ENTITY_NOT_FOUND_ERROR_RESPONSE_CODE = 404;
const ENTITY_NOT_FOUND_ERROR_RESPONSE_MESSAGE = "The requested entity is not found.";


/**
 * Method to build a Base response to service
 *
 * @author maurocc@br.ibm.com (Mauro Cesar Calegari)
 * @since 29/05/2017
 *
 * History:
 * 29/05/2017 - Mauro Cesar Calegari - Initial creation.
 * 
 */
let buildBaseResponse = function(error) {
    let baseResponse = {
        serviceStatus: {
            code: SUCCESS_RESPONSE_CODE,
            message: SUCCESS_RESPONSE_MESSAGE
        }
    };

    if (error) {
        if (error.errorCode) {
            baseResponse.serviceStatus.code = error.errorCode;
        } else {
            baseResponse.serviceStatus.code = INTERNAL_ERROR_RESPONSE_CODE;
        }
        if (error.errorMessage) {
            baseResponse.serviceStatus.message = error.errorMessage;
        } else {
            if (error.message) {
                baseResponse.serviceStatus.message = error.message;
            } else {
                baseResponse.serviceStatus.message = INTERNAL_ERROR_RESPONSE_MESSAGE;
            }
        }
    }

    return baseResponse;
};

/**
 * Method to build a 404 - Not found response to service
 *
 * @author maurocc@br.ibm.com (Mauro Cesar Calegari)
 * @since 29/05/2017
 *
 * History:
 * 29/05/2017 - Mauro Cesar Calegari - Initial creation.
 * 
 */
let buildNotFoundResponse = function() {
    var error = {
        errorCode: NOT_FOUND_ERROR_RESPONSE_CODE,
        errorMessage: NOT_FOUND_ERROR_RESPONSE_MESSAGE
    }

    return buildBaseResponse(error);
};

/**
 * Method to build a 401 - Token invalid or expired
 *
 * @author maurocc@br.ibm.com (Mauro Cesar Calegari)
 * @since 29/05/2017
 *
 * History:
 * 29/05/2017 - Mauro Cesar Calegari - Initial creation.
 * 
 */
let buildInvalidTokenResponse = function() {
    var error = {
        errorCode: INVALID_TOKEN_ERROR_RESPONSE_CODE,
        errorMessage: INVALID_TOKEN_ERROR_RESPONSE_MESSAGE
    }

    return buildBaseResponse(error);
};

/**
 * Method to build a 403 - Token invalid or expired
 *
 * @author maurocc@br.ibm.com (Mauro Cesar Calegari)
 * @since 29/05/2017
 *
 * History:
 * 29/05/2017 - Mauro Cesar Calegari - Initial creation.
 * 
 */
let buildTokenNotFoundResponse = function() {
    var error = {
        errorCode: TOKEN_NOT_FOUND_ERROR_RESPONSE_CODE,
        errorMessage: TOKEN_NOT_FOUND_ERROR_RESPONSE_MESSAGE
    }

    return buildBaseResponse(error);
};

/**
 * Method to build a 409 - Entity Already Exists
 *
 * @author dannielwbn@br.ibm.com (Danniel Willian Brandão do Nascimento)
 * @since 07/06/2017
 *
 * History:
 * 07/06/2017 - Danniel Willian Brandão do Nascimento - Initial creation.
 * 
 */
let entityAlreadyExistsResponse = function() {
    var error = {
        errorCode: ENTITY_ALREADY_EXISTS_ERROR_RESPONSE_CODE,
        errorMessage: ENTITY_ALREADY_EXISTS_ERROR_RESPONSE_MESSAGE
    }

    return buildBaseResponse(error);
};

/**
 * Method to build a 404 - Entity Not Found
 *
 * @author dannielwbn@br.ibm.com (Danniel Willian Brandão do Nascimento)
 * @since 07/06/2017
 *
 * History:
 * 07/06/2017 - Danniel Willian Brandão do Nascimento - Initial creation.
 * 
 */
let entityNotFoundResponse = function() {
    var error = {
        errorCode: ENTITY_NOT_FOUND_ERROR_RESPONSE_CODE,
        errorMessage: ENTITY_NOT_FOUND_ERROR_RESPONSE_MESSAGE
    }

    return buildBaseResponse(error);
};


// ----- MODULE EXPORTS -------- //
module.exports = {
    buildBaseResponse: buildBaseResponse,
    buildNotFoundResponse: buildNotFoundResponse,
    buildInvalidTokenResponse: buildInvalidTokenResponse,
    buildTokenNotFoundResponse: buildTokenNotFoundResponse,
    entityAlreadyExistsResponse,
    entityNotFoundResponse
};