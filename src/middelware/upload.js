
import  multer from 'multer';
// import path from 'path';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        cb(null, "uploads");
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + ".jpg");
    }
});

export const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        // Set the filetypes, it is optional
        if(
            file.mimetype == "image/png"||file.mimetype == "image/jpg")
        { 
            cb(null,true)

        }
        else 
        {
            console.log("only png and jpg file upload"),

            cb(null, false)
            
        }
    
        // cb(
        //     "Error: File upload only supports the " +
        //         "following filetypes - " +
        //         filetypes
        // );
    },
    limits:{
        fileSize:1024*1024*2
    }

//     // mypic is the name of file attribute
// }).single("mypic");

// app.get("/", function (req, res) {
//     res.render("Signup");
 });

 export default upload;
 
 
