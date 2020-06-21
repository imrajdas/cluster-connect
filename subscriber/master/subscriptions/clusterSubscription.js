const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = (data) => ({
	query: gql`
		subscription {
			clusterSubscription {
				id
				data
			}
		}
	`,
});

const nextHandler = (ws, data) => {
	//Business Logic
	try {
		console.log('\n\n**VALID JSON DATA**\n\n');
		console.log(JSON.parse(data.data.clusterSubscription.data));
	} catch {}
	ws.send(JSON.stringify(data.data.clusterSubscription));
};
const errHandler = (ws, err) => {
	//Business Logic
	console.log(err);
	ws.send(JSON.stringify({ type: 'error', data: 'ERRORRRR' }));
};
const cmpHandler = () => {
	//Business Logic
	console.log('Done');
};

module.exports = (link, ws, data = {}) => {
	appolo.execute(link, operation(data)).subscribe({
		next: (data) => nextHandler(ws, data),
		error: (err) => errHandler(ws, err),
		complete: () => cmpHandler(ws),
	});
};
