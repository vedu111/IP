import express from "express";
import articleRouter from "./routes/articles.js";
import articleModel from "./models/article.js"
import mongoose from 'mongoose';
import bodyParser from "body-parser";
import methodOverride from "method-override";
const app=express();
const port =3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));

mongoose.connect('mongodb://localhost:27017/blog', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to the database');
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})

app.get("/",async (req,res)=>{
    const articles= await articleModel.find().sort({createdAt:"desc"});
res.render("articles/index.ejs",{articles:articles});
});
app.use("/articles",articleRouter);