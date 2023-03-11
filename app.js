const express = require("express")
require("dotenv").config()


const app = express()

app.set("view engine", "ejs")
app.set('views','views')

app.use("/static", express.static("public"))

app.use(express.urlencoded({extended: true}))

const PORT = process.env.PORT

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})