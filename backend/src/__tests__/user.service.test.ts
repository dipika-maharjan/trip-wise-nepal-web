import { UserService } from '../services/user.service';
import { HttpError } from '../errors/http-error';

// Mock UserRepository and dependencies for isolated unit tests
const mockUser = { _id: 'user123', email: 'test@example.com', password: 'hashed_valid', name: 'Test', role: 'user' };
const mockRepo = {
  getUserByEmail: jest.fn(async (email) => email === 'exists@example.com' ? mockUser : null),
  createUser: jest.fn(async (data) => ({ ...data, _id: 'user123' })),
  getUserById: jest.fn(async (id) => id === 'user123' ? mockUser : null),
  updateUser: jest.fn(async (id, data) => ({ ...mockUser, ...data })),
};

jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (pw) => 'hashed_' + pw),
  compare: jest.fn(async (pw, hash) => pw === 'valid' && hash === 'hashed_valid'),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked_jwt'),
  verify: jest.fn(() => ({ id: 'user123' })),
}));

describe('UserService', () => {
  let userService: UserService;
  beforeEach(() => {
    userService = new UserService(mockRepo as any);
    jest.clearAllMocks();
  });

  it('should throw error if email is missing in sendResetPasswordEmail', async () => {
    await expect(userService.sendResetPasswordEmail(undefined)).rejects.toThrow(HttpError);
  });

  it('should throw error if email already exists on createUser', async () => {
    await expect(userService.createUser({ email: 'exists@example.com', password: 'pw' } as any)).rejects.toThrow(HttpError);
  });

  it('should create user if email does not exist', async () => {
    const user = await userService.createUser({ email: 'new@example.com', password: 'pw' } as any);
    expect(user.email).toBe('new@example.com');
    expect(user.password).toContain('hashed_');
  });

  it('should throw error if loginUser with non-existent email', async () => {
    mockRepo.getUserByEmail.mockResolvedValueOnce(null);
    await expect(userService.loginUser({ email: 'nope@example.com', password: 'pw' } as any)).rejects.toThrow(HttpError);
  });

  it('should throw error if loginUser with invalid password', async () => {
    mockRepo.getUserByEmail.mockResolvedValueOnce(mockUser);
    const bcrypt = require('bcryptjs');
    bcrypt.compare.mockResolvedValueOnce(false);
    await expect(userService.loginUser({ email: 'test@example.com', password: 'wrong' } as any)).rejects.toThrow(HttpError);
  });

  it('should return token and user for valid login', async () => {
    mockRepo.getUserByEmail.mockResolvedValueOnce(mockUser);
    const bcrypt = require('bcryptjs');
    bcrypt.compare.mockResolvedValueOnce(true);
    const result = await userService.loginUser({ email: 'test@example.com', password: 'valid' } as any);
    expect(result.token).toBe('mocked_jwt');
    expect(result.user.email).toBe('test@example.com');
  });
});
