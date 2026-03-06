import asyncio
import json
import os

from websockets import connect

NODE_URL = os.getenv('NODE_URL', 'https://reference.symboltest.net:3001')
WS_URL = NODE_URL.replace('http', 'ws', 1) + '/ws'
print(f'Using node {NODE_URL}')

MONITOR_ADDRESS = os.getenv(
	'MONITOR_ADDRESS',
	'TCHBDENCLKEBILBPWP3JPB2XNY64OE7PYHHE32I'
)
print(f'Monitoring address: {MONITOR_ADDRESS}')


async def main():
	async with connect(WS_URL) as websocket:
		# Connect and receive uid
		response = json.loads(await websocket.recv())
		uid = response['uid']
		print(f'Connected to {WS_URL} with uid {uid}')

		# Subscribe to status channel
		channel = f'status/{MONITOR_ADDRESS}'
		await websocket.send(json.dumps(
			{'uid': uid, 'subscribe': channel}
		))
		print('Subscribed to status channel')

		# Handle incoming messages
		try:
			async for raw_message in websocket:
				msg = json.loads(raw_message)
				tx_hash = msg['data']['hash']
				code = msg['data']['code']
				print(
					f'Transaction {tx_hash[:16]}... '
					f'rejected with code: {code}'
				)

		# Unsubscribe on exit
		finally:
			await websocket.send(json.dumps(
				{'uid': uid, 'unsubscribe': channel}
			))
			print('Unsubscribed from status channel')


try:
	asyncio.run(main())
except KeyboardInterrupt:
	pass
except Exception as error:
	print(error)
