import * as jwt from 'jsonwebtoken';

const cert = 'publicKey';

export default {
	user: jwt.sign({ 'id': '5abe9e78bc1b6d35dc04aa4e', 'email': 'user@email.com', 'admin': false }, cert),
	admin: jwt.sign({ 'id': '5abe9e78bc1b6d35dc04a9f9', 'email': 'admin@email.com', 'admin': true }, cert)
};
