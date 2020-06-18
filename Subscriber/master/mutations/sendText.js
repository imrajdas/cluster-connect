const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = (data) => ({
	query: gql`
		mutation($user: String!, $text: String!) {
			postMessage(user: $user, text: $text) {
				id
			}
		}
	`,
	variables: data,
});
const nextHandler = (ws, data) => {
	//Business Logic
	console.log(data);
	ws.send(JSON.stringify({ type: 'text-send', data: 'Text Send' }));
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
