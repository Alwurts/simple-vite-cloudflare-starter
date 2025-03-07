import { useCallback, useRef, useState, useEffect } from "react";
import type { ChatMessage, WsChatRoomMessage } from "@/types/chat";
import { nanoid } from "nanoid";

//const RETRY_DELAYS = [1000, 2000, 5000, 10000]; // Increasing delays between retries in ms

export function useChatWS() {
	const wsRef = useRef<WebSocket | null>(null);
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [input, setInput] = useState("");
	const [connectionStatus, setConnectionStatus] = useState<
		"disconnected" | "connecting" | "connected"
	>("disconnected");

	const startWebSocket = useCallback(() => {
		// Get the host from env and remove http:// or https://
		/* const apiHost =
			process.env.NEXT_PUBLIC_DO_CHAT_API_HOST?.replace(/^https?:\/\//, "") ??
			""; */
		const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
		const ws = new WebSocket(`${wsProtocol}://localhost:5173/agents/chat`);

		ws.onopen = () => {
			console.log("WebSocket connected");
			setConnectionStatus("connected");
		};

		ws.onmessage = (event) => {
			try {
				const wsMessage: WsChatRoomMessage = JSON.parse(event.data);

				switch (wsMessage.type) {
					case "message-broadcast": {
						const newMessage = wsMessage.message;
						console.log("new message", newMessage);
						setMessages((prev) => [...prev, newMessage]);
						break;
					}
					case "messages-sync": {
						const newMessages = wsMessage.messages;
						console.log("new messages", newMessages);
						setMessages(newMessages);
						break;
					}
					default:
						console.warn("Unknown message type:", wsMessage.type);
				}
			} catch (error) {
				console.error("Failed to parse message:", error);
			}
		};

		ws.onerror = (error) => {
			console.error("WebSocket error:", error);
			setConnectionStatus("disconnected");
		};

		ws.onclose = () => {
			setConnectionStatus("disconnected");
		};

		return ws;
	}, []);

	// Initialize WebSocket connection
	useEffect(() => {
		wsRef.current = startWebSocket();
		return () => wsRef.current?.close();
	}, [startWebSocket]);

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLTextAreaElement>) => {
			setInput(e.target.value);
		},
		[],
	);

	const handleSubmit = useCallback(
		async (e?: { preventDefault?: () => void }) => {
			e?.preventDefault?.();

			if (!input.trim()) {
				return;
			}

			if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
				console.error("WebSocket is not connected");
				return;
			}

			const newMessage: ChatMessage = {
				id: nanoid(),
				content: input.trim(),
				createdAt: Date.now(),
				role: "user",
			};

			const wsMessage: WsChatRoomMessage = {
				type: "message-receive",
				message: newMessage,
			};

			wsRef.current.send(JSON.stringify(wsMessage));
			setMessages((prev) => [...prev, newMessage]);
			setInput("");
		},
		[input],
	);

	const connect = useCallback(() => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			return;
		}
		wsRef.current?.close();
		wsRef.current = startWebSocket();
	}, [startWebSocket]);

	const disconnect = useCallback(() => {
		wsRef.current?.close();
		wsRef.current = null;
		setConnectionStatus("disconnected");
	}, []);

	return {
		messages,
		input,
		setInput,
		handleInputChange,
		handleSubmit,
		connectionStatus,
		connect,
		disconnect,
	};
}
