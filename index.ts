import AppDataSource from "./data-source";
import Server from "./server";

AppDataSource.initialize().then(async () => {
    const App = await Server(AppDataSource);

    await App.listen({ port: 3000 });
}).catch(console.error);
