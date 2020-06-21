const appolo = require('apollo-link');
const gql = require('graphql-tag');

const operation = () => ({
	query: gql`
		{
			messages {
				id
				user
				text
				createdAt
			}
		}
	`,
});

const nextHandler = (ws, data) => {
	//Business Logic
	console.log(JSON.stringify(data));
	ws.send(JSON.stringify({ type: 'messages', data: 'Fetched All Messages' }));
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
module.exports = (link, ws) => {
	appolo.execute(link, operation()).subscribe({
		next: (data) => nextHandler(ws, data),
		error: (err) => errHandler(ws, err),
		complete: () => cmpHandler(ws),
	});
};
