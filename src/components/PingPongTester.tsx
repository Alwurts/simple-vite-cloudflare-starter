import { useRef } from "react";
import { useEffect } from "react";

export function PingPongTester() {
	const socketRef = useRef<WebSocket | null>(null);

	useEffect(() => {
		const ws = new WebSocket("ws://localhost:5173/agents/chat");
		socketRef.current = ws;
		console.log("ws", ws);

		const onOpen = (event: Event) => {
			console.log("open");
			//ws.send(JSON.stringify({ type: "ping" }));
		};
		const onMessage = (event: MessageEvent<string>) => {
			console.log("message", event.data);
		};
		const onClose = (event: Event) => {
			console.log("close");
		};

		ws.addEventListener("message", onMessage);
		ws.addEventListener("open", onOpen);
		ws.addEventListener("close", onClose);
		return () => {
			ws.close();
			ws.removeEventListener("open", onOpen);
			ws.removeEventListener("close", onClose);
			ws.removeEventListener("message", onMessage);
		};
	}, []);

	return (
		<div className="p-4 border rounded-lg shadow-sm">
			<h2 className="text-xl font-bold mb-4">WebSocket Ping/Pong Tester</h2>

			<div className="mb-4">
				<button
					type="button"
					onClick={() => socketRef.current?.send("ping")}
					className="px-3 py-1 bg-green-500 text-white rounded disabled:opacity-50"
				>
					Send Ping
				</button>
			</div>
		</div>
	);
}
