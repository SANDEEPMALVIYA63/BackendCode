import mongoose from "mongoose";

const dbConnection=(url)=>
{
    try 
    {
       mongoose.connect(url);
       console.log("DB Connected"); 
    } 
    catch (error) 
    {
       console.log(error.message);
        
    }
}

export default dbConnection;