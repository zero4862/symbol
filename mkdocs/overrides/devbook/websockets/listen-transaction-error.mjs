const NODE_URL = process.env.NODE_URL
	|| 'https://reference.symboltest.net:3001';
const WS_URL = NODE_URL.replace('http', 'ws') + '/ws';
console.log(`Using node ${NODE_URL}`);

const MONITOR_ADDRESS = process.env.MONITOR_ADDRESS
	|| 'TCHBDENCLKEBILBPWP3JPB2XNY64OE7PYHHE32I';
console.log(`Monitoring address: ${MONITOR_ADDRESS}`);

const websocket = new WebSocket(WS_URL);

// Connect and receive uid
const uid = await new Promise((resolve) => {
	websocket.addEventListener('message', (event) => {
		const msg = JSON.parse(event.data);
		resolve(msg.uid);
	}, { once: true });
});
console.log(`Connected to ${WS_URL} with uid ${uid}`);

// Subscribe to status channel
const channel = `status/${MONITOR_ADDRESS}`;
websocket.send(JSON.stringify({uid, subscribe: channel}));
console.log('Subscribed to status channel');

// Handle incoming messages
websocket.addEventListener('message', (event) => {
	const msg = JSON.parse(event.data);
	const txHash = msg.data.hash;
	const code = msg.data.code;
	console.log(
		`Transaction ${txHash.substring(0, 16)}... `
		+ `rejected with code: ${code}`
	);
});

// Unsubscribe on exit
process.on('SIGINT', () => {
	websocket.send(JSON.stringify({uid, unsubscribe: channel}));
	console.log('Unsubscribed from status channel');
	websocket.close();
	process.exit(0);
});
