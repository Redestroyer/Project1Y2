import Express from "express";

const App = Express();

import BodyParser from "body-parser";

App.use(BodyParser.json());

App.get("/", (req, res) => {
    res.send("Hello, World!");
});

export default App;
