import type { UseChatMessageRequest, WsOutgoingMessage } from "@/types/chat";
import { useChat, type UseChatOptions } from "@ai-sdk/react";
import { useEffect, useRef, useState } from "react";

type UseChatWebSocketOptions = Omit<
	UseChatOptions & Parameters<typeof useChat>[0],
	"fetch"
>;

export function useChatWebSocket({
	api,
	...chatOptions
}: UseChatWebSocketOptions) {
	const socketRef = useRef<WebSocket | null>(null);
	const [isConnected, setIsConnected] = useState(false);

	// Connect to WebSocket with automatic reconn\ection
	const connectWebSocket = () => {
		/* if (socketRef.current?.readyState === WebSocket.OPEN) {
			return;
		} */

		try {
			const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
			const socketUrl = `${wsProtocol}://${api}`;
			const socket = new WebSocket(socketUrl);
			socketRef.current = socket;

			socket.addEventListener("open", () => {
				setIsConnected(true);
				console.log("WebSocket connected");
			});
			socket.addEventListener("message", (event) => {
				console.log("WebSocket message received:", event.data);
			});
			socket.addEventListener("close", (event) => {
				setIsConnected(false);
				console.log(`WebSocket closed with code ${event.code}`);
			});

			socket.addEventListener("error", (error) => {
				console.error("WebSocket error:", error);
			});
		} catch (error) {
			console.error("Failed to create WebSocket:", error);
		}
	};

	// Connect on component mount
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		connectWebSocket();

		return () => {
			// Clean up on unmount
			if (socketRef.current) {
				socketRef.current.close();
			}
		};
	}, []);

	// Custom fetch function that uses WebSocket
	async function webSocketFetch(
		_request: RequestInfo | URL,
		options: RequestInit = {},
	) {
		const { method, body, signal } = options;
		const id = crypto.randomUUID();
		const abortController = new AbortController();

		signal?.addEventListener("abort", () => {
			abortController.abort();
		});

		let controller: ReadableStreamDefaultController;

		const stream = new ReadableStream({
			start(c) {
				controller = c;
			},
		});

		socketRef.current?.addEventListener(
			"message",
			(event) => {
				const data = JSON.parse(event.data) as WsOutgoingMessage;
				if (data.type === "use_chat_response" && data.id === id) {
					controller.enqueue(new TextEncoder().encode(data.body));
					if (data.done) {
						controller.close();
						abortController.abort();
					}
				}
			},
			{ signal: abortController.signal },
		);

		const newMessageRequest: UseChatMessageRequest = {
			type: "use_chat_request",
			id,
			init: {
				method,
				body,
			},
		};

		socketRef.current?.send(JSON.stringify(newMessageRequest));

		return new Response(stream);
	}

	// Use the standard useChat hook with our custom fetch
	const chatHelpers = useChat({
		fetch: webSocketFetch,
		...chatOptions,
	});

	// Return the chat helpers with additional WebSocket-specific functions
	return {
		...chatHelpers,
		isConnected,
	};
}
