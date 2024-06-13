import type { ChildProcess } from "node:child_process";
import logger from "../common/logger";
import { callGraphQl } from "../common/runner";
import { gracefulShutdown } from "../core/shutdownUtils";
import terminate from "terminate";

export class GraphQlStub {
	host: string;
	port: number;
	data?: string;
	process: ChildProcess;
	constructor(
		host: string,
		port: number,
		process: ChildProcess,
		data?: string,
	) {
		this.host = host;
		this.port = port;
		this.process = process;
		this.data = data;
	}
}

const startGraphQlStub = (
	host?: string,
	port?: string,
	data?: string,
	args: (string | number)[] = [],
): Promise<GraphQlStub> => {
	let cmd = " stub ";
	if (host) cmd += `--host ${host} `;
	if (port) cmd += `--port ${port} `;
	if (data) cmd += `--data ${data} `;
	cmd += args.join(" ");

	logger.info("GraphQl Stub: Starting server");
	logger.debug(`GraphQl Stub: Executing "${cmd}"`);

	return new Promise((resolve, reject) => {
		let reportedPort: number;
		const javaProcess = callGraphQl(
			cmd,
			(err: any) => {
				if (err) {
					logger.error(`GraphQl Stub: Exited with error ${err}`);
				}
			},
			(message, error) => {
				if (!error) {
					if (message.includes("Starting the server on port")) {
						logger.info(`GraphQl Stub: ${message}`);
						const stubInfo = message.split("port ")[1];
						if (stubInfo.length < 2)
							reject("Cannot determine port from graphql stub output");
						else reportedPort = Number.parseInt(stubInfo[1].trim());
					} else if (message.includes("Address already in use")) {
						logger.error(`GraphQl Stub: ${message}`);
						reject(message);
					} else if (message.includes("Stub server is running")) {
						const host = message.split("on ")[1].split(":")[0].trim();
						if (port) {
							resolve(new GraphQlStub(host, reportedPort, javaProcess, data));
						} else {
							reject(
								"No port or host information available, but graphql stub server is running",
							);
						}
					} else {
						logger.debug(`GraphQl Stub: ${message}`);
					}
				} else {
					logger.error(`GraphQl Stub: ${message}`);
					reject(message);
				}
			},
		);
	});
};

const stopGraphQlStub = async (graphQlStub: GraphQlStub) => {
	logger.debug(
		`GraphQl Stub: Stopping server at ${graphQlStub.host}:${graphQlStub.port}`,
	);
	const javaProcess = graphQlStub.process;
	javaProcess.stdout?.removeAllListeners();
	javaProcess.stderr?.removeAllListeners();
	javaProcess.removeAllListeners("close");
	logger.debug("Trying to stop stub process gracefully ...");
	try {
		await gracefulShutdown(javaProcess);
	} catch (e) {
		terminate(javaProcess.pid!);
	}
	logger.info(
		`GraphQl Stub: Stopped server at ${graphQlStub.host}:${graphQlStub.port}`,
	);
};

export { startGraphQlStub, stopGraphQlStub };
