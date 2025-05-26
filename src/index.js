import express from "express";
import {dirname, join} from "path";
import { fileURLToPath } from "url";
import indexRoutes from "./routes/index.js";
import "./db.js";

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.set('views', join(__dirname, "views"));
app.set('view engine', 'ejs');
app.use(indexRoutes)
app.use(express.static(join(__dirname, "public")));
app.use((req, res, next) => {
    res.status(404).render("404", { title: "404" });
})

app.listen(3000)
console.log("listening on port", 3000)