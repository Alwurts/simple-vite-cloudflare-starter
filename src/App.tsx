import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function App() {
	return (
		<div className="flex justify-center items-center h-screen">
			<Card>
				<CardHeader>
					<CardTitle>Hello World</CardTitle>
				</CardHeader>
				<CardContent>
					<Button>Click me</Button>
				</CardContent>
			</Card>
		</div>
	);
}

export default App;
