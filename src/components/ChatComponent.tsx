import { useChatWebSocket } from "../hooks/useChatWebSocket";
export function ChatComponent() {
	const { messages, input, handleInputChange, handleSubmit } = useChatWebSocket(
		{
			api: "localhost:5173/agents/chat",
		},
	);

	return (
		<div className="flex flex-col p-4 max-w-xl mx-auto">
			{/* Messages display */}
			<div className="bg-gray-100 p-4 rounded-lg mb-4 h-80 overflow-y-auto">
				{messages.map((message) => (
					<div
						key={message.id}
						className={`mb-3 p-2 rounded-md ${
							message.role === "user" ? "bg-blue-100 ml-4" : "bg-white mr-4"
						}`}
					>
						<div className="font-semibold text-xs mb-1">
							{message.role === "user" ? "You" : "AI Assistant"}
						</div>
						<div className="whitespace-pre-wrap">{message.content}</div>
					</div>
				))}
			</div>

			{/* Chat input form */}
			<form onSubmit={handleSubmit} className="flex flex-col gap-2">
				<textarea
					value={input}
					onChange={handleInputChange}
					rows={3}
					className="w-full p-2 border rounded-md resize-none"
					placeholder="Type your message..."
				/>

				<div className="flex justify-between">
					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
						disabled={!input.trim()}
					>
						Send
					</button>
				</div>
			</form>
		</div>
	);
}
