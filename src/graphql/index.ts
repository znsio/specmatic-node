import type { ChildProcess } from "node:child_process";
import logger from "../common/logger";
import { callGraphQl } from "../common/runner";
import { gracefulShutdown } from "../core/shutdownUtils";
import terminate from "terminate";

const hostPortRegex = new RegExp(/.*(https?:\/\/.*):(\d+).*/);
const errorMessages = new RegExp(
	`(${[
		"Address already in use",
		"Invalid syntax with offending token",
		"The system cannot find the file specified",
	].join("|")})`,
);

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
		const javaProcess = callGraphQl(
			cmd,
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			(err: any) => {
				if (err) {
					logger.error(`GraphQl Stub: Exited with error ${err}`);
				}
			},
			(message, error) => {
				if (!error) {
					switch (true) {
						case /^\s*$/.test(message):
							break;

						case errorMessages.test(message): {
							logger.error(`GraphQl Stub Error: ${message}`);
							reject(message);
							break;
						}

						case /Stub server is running/.test(message): {
							logger.info(`GraphQl Stub: ${message}`);
							const [, host, port] = hostPortRegex.exec(message) ?? [];
							if (port) {
								resolve(
									new GraphQlStub(
										host,
										Number.parseInt(port),
										javaProcess,
										data,
									),
								);
							}
							reject(
								"No port or host information available, but graphql stub server is running",
							);
							break;
						}

						default: {
							logger.debug(`GraphQl Stub: ${message}`);
							break;
						}
					}
				} else {
					switch (true) {
						case /SLF4J/.test(message): {
							logger.debug(`GraphQl Stub: ${message}`);
							break;
						}

						default: {
							logger.error(`GraphQl Stub Error: ${message}`);
							reject(message);
							break;
						}
					}
				}
			},
		);
	});
};

const stopGraphQlStub = async (graphQlStub: GraphQlStub) => {
	if (!graphQlStub?.process) {
		return;
	}
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
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		terminate(javaProcess.pid!);
	}
	logger.info(
		`GraphQl Stub: Stopped server at ${graphQlStub.host}:${graphQlStub.port}`,
	);
};

export { startGraphQlStub, stopGraphQlStub };
