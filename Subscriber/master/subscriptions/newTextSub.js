const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = (data) => ({
	query: gql`
		subscription($user: String!) {
			messagePosted(user: $user) {
				id
				user
				text
				createdAt
			}
		}
	`,
	variables: data,
});

const nextHandler = (ws, data) => {
	//Business Logic
	try {
		console.log('\n\n**VALID JSON DATA**\n\n');
		console.log(JSON.parse(data.data.messagePosted.text));
	} catch {}
	ws.send(JSON.stringify({ type: 'apply-yaml', data: JSON.stringify(data.data.messagePosted.text) }));
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
