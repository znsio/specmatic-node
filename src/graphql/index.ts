import type { ChildProcess } from "node:child_process";
import terminate from "terminate";
import logger from "../common/logger";
import { callGraphQl } from "../common/runner";
import { gracefulShutdown } from "../core/shutdownUtils";

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
	const cmd = `stub ${host ? `--host ${host}` : ""} ${port ? `--port ${port}` : ""} ${data ? `--data ${data}` : ""} ${args.join(" ")}`;

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
					if (/^\s*$/.test(message)) {
						return;
					}

					if (errorMessages.test(message)) {
						logger.error(`GraphQl Stub Error: ${message}`);
						return reject(message);
					}

					if (/Stub server is running/.test(message)) {
						logger.info(`GraphQl Stub: ${message}`);
						const [, host, port] = hostPortRegex.exec(message) ?? [];
						if (port) {
							return resolve(
								new GraphQlStub(host, Number.parseInt(port), javaProcess, data),
							);
						}
						return reject(
							"No port or host information available, but graphql stub server is running",
						);
					}

					logger.debug(`GraphQl Stub: ${message}`);
				} else if (/SLF4J/.test(message)) {
					logger.debug(`GraphQl Stub: ${message}`);
				} else {
					logger.error(`GraphQl Stub Error: ${message}`);
					return reject(message);
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

