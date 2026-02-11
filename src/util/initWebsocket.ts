import { Client } from "discord.js";
import WebSocket from "ws";
import { isWebsocketHandler } from "../types/websocket.d";
import { Logger } from "commandkit";
import { handlers } from "../app/websocket/index";
import { websocketURL } from "@/../config.json";

/**
 * Load all WebSocket handlers from the websocket index
 * and store them in client.websockets Collection
 */
export async function initWebsocket(client: Client): Promise<void> {
    Logger.info(`[WebSocket] Loading ${handlers.length} handler(s)...`);

    for (const handler of handlers) {
        try {
            if (isWebsocketHandler(handler)) {
                client.websockets.set(handler.notification_type, handler);
                Logger.info(
                    `[WebSocket] Loaded handler: ${handler.notification_type}`
                );
            } else {
                Logger.warn(`[WebSocket] Invalid handler format`);
            }
        } catch (error) {
            Logger.error(`[WebSocket] Error loading handler:`);
            Logger.error(error);
        }
    }

    Logger.info(
        `[WebSocket] Successfully loaded ${client.websockets.size} handler(s)`
    );
}

/**
 * Connect to the API WebSocket and route incoming messages to handlers
 */
export async function initAPIWebsocket(client: Client): Promise<void> {
    const apiToken = `Bearer ${process.env.API_TOKEN}`;
    if (!apiToken) {
        Logger.error(
            "[WebSocket] API_TOKEN not found in environment variables"
        );
        return;
    }

    function connectWebSocket(): void {
        try {
            const ws = new WebSocket(websocketURL, {
                headers: {
                    Authorization: apiToken,
                },
            });

            ws.on("open", () => {
                Logger.info("[WebSocket] Connected to API WebSocket");
            });

            ws.on("message", async (data: WebSocket.Data) => {
                try {
                    const message = JSON.parse(data.toString());
                    const notificationType = message.notification_type;

                    if (!notificationType) {
                        Logger.warn(
                            "[WebSocket] Message missing notification_type:"
                        );
                        Logger.warn(message);
                        return;
                    }

                    const handler = client.websockets.get(notificationType);

                    if (!handler) {
                        Logger.warn(
                            `[WebSocket] No handler found for notification_type: ${notificationType}`
                        );
                        return;
                    }

                    await handler.handle(client, message);
                } catch (error) {
                    Logger.error("[WebSocket] Error processing message:");
                    Logger.error(error);
                }
            });

            ws.on("error", (error) => {
                Logger.error("[WebSocket] Error:");
                Logger.error(error);
            });

            ws.on("close", () => {
                Logger.info(
                    "[WebSocket] Disconnected from API WebSocket. Reconnecting in 5 seconds..."
                );
                setTimeout(connectWebSocket, 5000);
            });
        } catch (error) {
            Logger.error("[WebSocket] Failed to connect:");
            Logger.error(error);
            setTimeout(connectWebSocket, 5000);
        }
    }

    connectWebSocket();
}
