import { UserSerializer } from '../../../src/utils/serialization/user.serializer';

describe('UserSerializer', () => {
	let serializer: UserSerializer;

	beforeEach(() => {
		serializer = new UserSerializer();
	});

	describe('serialize', () => {
		const admin_req = { user: { admin: true } };
		const non_admin_req = { user: { admin: false } };
		const user: any = {
			firstName: 'Egill',
			lastName: 'Sveinbjörnsson',
			email: 'egillsveinbjorns@gmail.com',
			updatedAt: '2018-03-30T20:30:48.557Z',
			createdAt: '2018-03-30T20:30:48.557Z',
			boxName: 'CrossFit Reykjavík',
			dateOfBirth: '1991-12-06T00:00:00.000Z',
			gender: 'male',
			height: 189,
			weight: 92000,
			avatarUrl: '/public/avatars/5abe9e97a3de7cd1faba082e.png',
			id: '5abe9e97a3de7cd1faba082e'
		};

		it('should only keep public properties if logged in user is not an admin', () => {
			const res = serializer.serialize(user, non_admin_req);

			expect(res).toHaveProperty('firstName');
			expect(res).toHaveProperty('lastName');
			expect(res).toHaveProperty('email');
			expect(res).toHaveProperty('updatedAt');
			expect(res).toHaveProperty('createdAt');
			expect(res).toHaveProperty('boxName');
			expect(res).toHaveProperty('dateOfBirth');
			expect(res).toHaveProperty('gender');
			expect(res).toHaveProperty('height');
			expect(res).toHaveProperty('weight');
			expect(res).toHaveProperty('avatarUrl');
			expect(res).not.toHaveProperty('id');
		});

		it('should include id if logged in user is an admin', () => {
			const res = serializer.serialize(user, admin_req);

			expect(res).toHaveProperty('firstName');
			expect(res).toHaveProperty('lastName');
			expect(res).toHaveProperty('email');
			expect(res).toHaveProperty('updatedAt');
			expect(res).toHaveProperty('createdAt');
			expect(res).toHaveProperty('boxName');
			expect(res).toHaveProperty('dateOfBirth');
			expect(res).toHaveProperty('gender');
			expect(res).toHaveProperty('height');
			expect(res).toHaveProperty('weight');
			expect(res).toHaveProperty('avatarUrl');
			expect(res).toHaveProperty('id');
		});
	});
});
