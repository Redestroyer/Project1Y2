import App from "./app";
import Config from "./config";

const port = Config.port;

App.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});