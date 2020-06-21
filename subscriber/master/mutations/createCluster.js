const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = (data) => ({
	query: gql`
		mutation($input: clusterInput!) {
			createCluster(input: $input) {
				id
				data
			}
		}
	`,
	variables: data,
});
const nextHandler = (ws, data) => {
	//Business Logic
	console.log(data);
	ws.send(JSON.stringify({ type: 'create-cluster', data: 'Cluster Created' }));
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
module.exports = (link, ws, data) => {
	appolo.execute(link, operation(data)).subscribe({
		next: (data) => nextHandler(ws, data),
		error: (err) => errHandler(ws, err),
		complete: () => cmpHandler(ws),
	});
};
