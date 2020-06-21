const ws = require('ws');
const { WebSocketLink } = require('apollo-link-ws');
const { SubscriptionClient } = require('subscriptions-transport-ws');

module.exports = (url) => {
	const client = new SubscriptionClient(
		url,
		{
			reconnect: true,
		},
		ws
	);

	return new WebSocketLink(client);
};
