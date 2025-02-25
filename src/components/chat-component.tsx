import { useChatWebSocket } from "../hooks/use-chat-web-socket";

export function ChatComponent() {
	const {
		messages,
		input,
		handleInputChange,
		handleSubmit,
		status,
		error,
		isConnected,
	} = useChatWebSocket({
		api: "localhost:5173/agents/chat",
	});

	const isLoading = status === "streaming" || status === "submitted";

	return (
		<div className="flex flex-col p-4 max-w-xl mx-auto">
			{/* Connection status */}
			<div
				className={`text-sm mb-2 ${isConnected ? "text-green-600" : "text-red-600"}`}
			>
				{isConnected
					? "Connected to AI service"
					: "Disconnected from AI service"}
			</div>

			{/* Error message */}
			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					<p>Error: {error.message}</p>
				</div>
			)}

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

				{/* Loading indicator */}
				{isLoading && (
					<div className="flex items-center space-x-2 p-2">
						<div className="animate-pulse text-gray-500">AI is thinking...</div>
						<div className="flex space-x-1">
							<div
								className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
								style={{ animationDelay: "0ms" }}
							/>
							<div
								className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
								style={{ animationDelay: "150ms" }}
							/>
							<div
								className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
								style={{ animationDelay: "300ms" }}
							/>
						</div>
					</div>
				)}
			</div>

			{/* Chat input form */}
			<form onSubmit={handleSubmit} className="flex flex-col gap-2">
				<textarea
					value={input}
					onChange={handleInputChange}
					rows={3}
					className="w-full p-2 border rounded-md resize-none"
					placeholder="Type your message..."
					disabled={!isConnected}
				/>

				<div className="flex justify-between">
					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
						disabled={!input.trim() || isLoading || !isConnected}
					>
						{isLoading ? "Sending..." : "Send"}
					</button>
				</div>
			</form>
		</div>
	);
}
