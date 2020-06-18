const { createLink } = require('./util');
const { getMessages } = require('./queries');
const { sendText } = require('./mutations');
const { newUserSub, newTextSub } = require('./subscriptions');
const server = require('./agentServer');

// const link = createLink('ws://localhost:8080/graphql');
const gqlServer = `ws://${process.env.GQL_SERVER}`;
console.log(gqlServer);
const link = createLink(gqlServer);
const agentHandler = (ws) => {
	newUserSub(link, ws, { user: 'Hello' });
	newTextSub(link, ws, { user: 'Hello' });
	ws.on('message', (data) => {
		console.log(data);
		try {
			const parsed = JSON.parse(data);
			console.log('Parsed');
			if (parsed.type === 'send-text') {
				console.log('Sending Text');
				sendText(link, ws, { user: parsed.user, text: parsed.text });
			} else if (parsed.type === 'get-all') {
				console.log('Fetching All Messages');
				getMessages(link, ws);
			}
		} catch {}
	});
};

server('0.0.0.0', '8000', agentHandler);
