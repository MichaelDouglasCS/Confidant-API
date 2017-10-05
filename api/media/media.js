/*jshint esnext: true */

/**
 * Model object to represent the User Schema
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
var mongoose = require("mongoose");
let firebaseStorage = require("../../config/firebase-storage");
var fs = require("fs");
var Schema = mongoose.Schema;

// ------ MODEL --------- //
var mediaSchema = mongoose.Schema({
    fileURL: String
});

//Hide "_v", "password" and rename "_id" 
mediaSchema.set("toJSON", {
    transform: function (doc, ret, options) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
    }
});

var Media = mongoose.model("Media", mediaSchema);

// ----- PUBLIC METHODS ------- //
/**
 * Upload Picture
 *
 * @author Michael Douglas
 * @since 31/07/2017
 *
 * History:
 * 31/07/2017 - Michael Douglas - Initial creation.
 *
 */
let upload = function (file) {
    return new Promise((resolve, reject) => {
        var oldPath = file.path;
        var path = __dirname + "/temp/" + file.originalname;
        //Storage Picture Temporary to Upload
        fs.rename(oldPath, path, function (err) {
            if (err) {
                reject(err)
            } else {
                // Upload a local file to a new file to be created in your bucket.
                firebaseStorage.bucket.upload(path, { destination: "/UsersFiles/" + file.originalname }, function (err, file) {
                    if (!err) {
                        firebaseStorage.bucket.file(file.name).getSignedUrl({
                            action: "read",
                            expires: "03-09-2491"
                        }).then(signedUrls => {
                            console.log(" -----------------------------//--------------------------- ");
                            console.log(" --------> UPLOAD TO: " + file.name);
                            console.log(" -----------------------------//--------------------------- ");
                            
                            var media = new Media();
                            media.fileURL = signedUrls[0]
                            
                            resolve(media)
                            //Remove Picture Storaged
                            fs.unlinkSync(path);
                        });
                    } else {
                        reject(err)
                    }
                });
            }
        });
    });
};

// ----- MODULE EXPORTS -------- //
module.exports = {
    upload: upload
};
