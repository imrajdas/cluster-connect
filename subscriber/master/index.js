const { createLink } = require('./util');
const { getMessages } = require('./queries');
const { sendText } = require('./mutations');
const { clusterSubscription } = require('./subscriptions');
const server = require('./agentServer');
const createCluster = require('./mutations/createCluster');

// const link = createLink('ws://localhost:8080/graphql');
const gqlServer = `ws://${process.env.GQL_SERVER}`;
console.log(gqlServer);
const link = createLink(gqlServer);
const agentHandler = (ws) => {
	clusterSubscription(link, ws);
	ws.on('message', (data) => {
		console.log(data);
		try {
			const parsed = JSON.parse(data);
			if (parsed.type === 'create-cluster') {
				const dt = JSON.parse(parsed.data);
				console.log('Creating Cluster', dt);
				createCluster(link, ws, { input: { id: dt.id, data: dt.data } });
			}
		} catch {}
	});
};

server('0.0.0.0', '8000', agentHandler);
