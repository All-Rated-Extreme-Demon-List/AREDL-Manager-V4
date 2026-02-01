import { Client } from "@/app"
import path from "path";
import fs from "fs";
import { Logger } from "commandkit";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { websocketURL } from "@/../config.json";
import WebSocket from "ws";

// Define the websocket handler interface
export interface WebsocketHandler {
    notification_type: string;
    handle: (client: Client, data: any) => Promise<void> | void;
}

// Type guard to validate the handler
function isWebsocketHandler(obj: any): obj is WebsocketHandler {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.notification_type === 'string' &&
        typeof obj.handle === 'function'
    );
}

export const initWebsocket = async (client: Client) => {
	// Initialize WebSocket handlers
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);
	const websocketsPath = path.join(__dirname, '..', 'app', 'websocket');
	if (fs.existsSync(websocketsPath)) {
		const websocketsFiles = fs
			.readdirSync(websocketsPath)
			.filter((file) => file.endsWith('.ws.ts'));

		Logger.info(`Loading ${websocketsFiles.length} websocket handlers...`);
		
		for (const file of websocketsFiles) {
			try {
				const websocketHandler = await import('../app/websocket/' + file).then((module) => module.default);
				
				if (!isWebsocketHandler(websocketHandler)) {
					Logger.warn(`Invalid websocket handler in websocket/${file}: missing notification_type or handle`);
					continue;
				}
				
				client.websockets.set(websocketHandler.notification_type, websocketHandler);
				Logger.info(`    Loaded ${websocketHandler.notification_type} from websocket/${file}`);
			} catch (error) {
				Logger.error(`Failed to load websocket handler from websocket/${file}:`);
				Logger.error(error)
			}
		}
	} else {
		Logger.error("Failed to load websocket handlers: websocket path does not exist")
		Logger.error(`Path: ${websocketsPath}`)
	}
}

export const initAPIWebsocket = async (client: Client) => {
	Logger.info('Initializing API WebSocket connection...');
	const ws = new WebSocket(websocketURL, {
		headers: { Authorization: `Bearer ${process.env.API_TOKEN!}` },
	});

	await new Promise<void>((resolve, reject) => {
		ws.once('open', () => {
			Logger.info('Connected to notifications WebSocket');
			resolve();
		});

		ws.once('error', (err) => {
			Logger.error('WebSocket connection error:');
			Logger.error(err)
			reject(err);
		});
	});

	ws.on('message', (data) => {
		try {
			const parsed_data = JSON.parse(data.toString());
			client.websockets.forEach((handler: WebsocketHandler, type: string) => {
				if (parsed_data.notification_type === type) {
					handler.handle(client, parsed_data.data);
				}
			});
		} catch (err) {
			Logger.error('Failed to parse websocket message:');
			Logger.error(err);
		}
	});

	ws.on('close', (code, reason) => {
		Logger.warn(
			`Websocket closed (${code}): ${reason}. Reconnecting in 5s…`,
		);
		setTimeout(
			() => module.exports.initAPIWebsocket(client, process.env.API_TOKEN!),
			5000,
		);
	});
}