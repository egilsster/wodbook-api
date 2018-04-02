import * as jwt from 'jsonwebtoken';

const cert = 'publicKey';
export const userId = '5abe9e78bc1b6d35dc04aa4e';
export const adminId = '5abe9e78bc1b6d35dc04a9f9';

export default {
	user: jwt.sign({ 'id': userId, 'email': 'user@email.com', 'admin': false }, cert),
	admin: jwt.sign({ 'id': adminId, 'email': 'admin@email.com', 'admin': true }, cert)
};
