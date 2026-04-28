import bodyParser from "body-parser";
import express from "express";

const app = express();
const port = 8080;
app.use(bodyParser.json())

let menu = [
    { id: 0o1, name: "the fucking gem from bejeweled" },
    { id: 0o2, name: "Bandai HG00 026 1/100 GN-008 Seravee Gundam with Seraphim Unit" }
]

app.get("/", (req, res) => {
  res.send("THIS! MESSAGE! IS! FALSE!");
});

app.listen(port, () => {
  console.log(`nuo içtlçj~jdfg ~ljkndfga j~fdj]~kçlmrkf~çd]s${port}lç hkdfgbh etl hfoiçrfe`);
});