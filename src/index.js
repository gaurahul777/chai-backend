import dotenv from "dotenv";
// require('dotenv').config({path:'./env'});
import connectDB from "./db/index.js";
import { app } from "./app.js";
// import { DB_NAME } from "./constants";
const { MONGODB_URI, PORT } = process.env;

dotenv.config({
  path: "./.env",
});

connectDB()
.then(()=>{
    app.on("error", (err) => {
        console.error("🔥 App crashed due to error:", err);
        process.exit(1); // optional: exit the app
      });

    app.listen(PORT || 8000,()=>{
        console.log(`Server is running at port : ${PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed !!",err);
})

/*
(async()=>{
    try {
     await   mongoose.connect(`${MONGODB_URI}/${DB_NAME}`)
     app.on("error",(error)=>{
        console.log("ERROR : ",error);
        throw error
     })


app.listen( PORT,()=>{
    console.log(`App is listening on port : ${PORT}`)
})

    } catch (error) {
       console.log("ERROR:",error) ;
       throw error
    }
})()    */
