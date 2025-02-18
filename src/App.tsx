import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { client } from "./lib/api-client";

function App() {
	const [name, setName] = useState("unknown");

	const fetchName = async () => {
		const response = await client.agents.create.$post({
			json: {
				name: "test",
			},
		});

		const data = await response.json();
		console.log("data", data);
		setName(data.result.name);
	};

	return (
		<div className="flex justify-center items-center h-screen">
			<Card>
				<CardHeader>
					<CardTitle>Hello World {name}</CardTitle>
				</CardHeader>
				<CardContent>
					<Button onClick={fetchName}>Click me</Button>
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
