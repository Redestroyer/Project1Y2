export type Config = {
    port: number;
};

export function getEnvPort(): number | undefined {
    const port = process.env.PORT;
    if (port) try {
        return parseInt(port);
    } catch {
        return undefined;
    }
}

const Config: Config = {
    port: getEnvPort() || 8080,
};

export default Config;