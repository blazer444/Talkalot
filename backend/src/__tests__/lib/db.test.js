import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

// Mock mongoose
const mockConnect = jest.fn();
const mockConnection = {
  host: 'localhost:27017'
};

jest.unstable_mockModule('mongoose', () => ({
  default: {
    connect: mockConnect,
    connection: mockConnection
  }
}));

jest.unstable_mockModule('../../lib/env.js', () => ({
  ENV: {
    MONGO_URI: 'mongodb://localhost:27017/testdb'
  }
}));

describe('Database Connection', () => {
  let connectDB;
  let originalExit;

  beforeEach(async () => {
    jest.resetModules();
    mockConnect.mockClear();
    
    // Mock process.exit
    originalExit = process.exit;
    process.exit = jest.fn();

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Re-import after mocking
    const dbModule = await import('../../lib/db.js');
    connectDB = dbModule.connectDB;
  });

  afterEach(() => {
    process.exit = originalExit;
    jest.restoreAllMocks();
  });

  describe('Successful connection', () => {
    it('should connect to MongoDB with URI from ENV', async () => {
      mockConnect.mockResolvedValue({ connection: mockConnection });

      await connectDB();

      expect(mockConnect).toHaveBeenCalledWith('mongodb://localhost:27017/testdb');
    });

    it('should log success message on connection', async () => {
      mockConnect.mockResolvedValue({ connection: mockConnection });

      await connectDB();

      expect(console.log).toHaveBeenCalledWith(
        'MONGODB CONECTADO: ',
        'localhost:27017'
      );
    });

    it('should not exit process on successful connection', async () => {
      mockConnect.mockResolvedValue({ connection: mockConnection });

      await connectDB();

      expect(process.exit).not.toHaveBeenCalled();
    });

    it('should handle different MongoDB connection strings', async () => {
      const uris = [
        'mongodb://localhost:27017/testdb',
        'mongodb://user:pass@host:27017/db',
        'mongodb+srv://cluster.mongodb.net/db',
        'mongodb://host1:27017,host2:27017/db?replicaSet=rs0'
      ];

      for (const uri of uris) {
        jest.resetModules();
        
        jest.unstable_mockModule('../../lib/env.js', () => ({
          ENV: { MONGO_URI: uri }
        }));

        const { connectDB } = await import('../../lib/db.js');
        mockConnect.mockResolvedValue({ connection: mockConnection });

        await connectDB();

        expect(mockConnect).toHaveBeenCalledWith(uri);
        mockConnect.mockClear();
      }
    });
  });

  describe('Connection errors', () => {
    it('should log error message on connection failure', async () => {
      const error = new Error('Connection failed');
      mockConnect.mockRejectedValue(error);

      await connectDB();

      expect(console.error).toHaveBeenCalledWith(
        'Erro de conexão no MONGODB : ',
        error
      );
    });

    it('should exit process with status 1 on connection failure', async () => {
      mockConnect.mockRejectedValue(new Error('Connection failed'));

      await connectDB();

      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle network errors', async () => {
      mockConnect.mockRejectedValue(new Error('ECONNREFUSED'));

      await connectDB();

      expect(console.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle authentication errors', async () => {
      mockConnect.mockRejectedValue(new Error('Authentication failed'));

      await connectDB();

      expect(console.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle timeout errors', async () => {
      mockConnect.mockRejectedValue(new Error('Connection timeout'));

      await connectDB();

      expect(console.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('ENV validation', () => {
    it('should throw error if MONGO_URI is not defined', async () => {
      jest.resetModules();
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: { MONGO_URI: undefined }
      }));

      const { connectDB } = await import('../../lib/db.js');

      await expect(connectDB()).rejects.toThrow(
        'MONGO_URI não está definido nas variáveis de ambiente.'
      );
    });

    it('should throw error if MONGO_URI is empty string', async () => {
      jest.resetModules();
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: { MONGO_URI: '' }
      }));

      const { connectDB } = await import('../../lib/db.js');

      await expect(connectDB()).rejects.toThrow(
        'MONGO_URI não está definido nas variáveis de ambiente.'
      );
    });

    it('should throw error if MONGO_URI is null', async () => {
      jest.resetModules();
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: { MONGO_URI: null }
      }));

      const { connectDB } = await import('../../lib/db.js');

      await expect(connectDB()).rejects.toThrow(
        'MONGO_URI não está definido nas variáveis de ambiente.'
      );
    });

    it('should accept valid MONGO_URI', async () => {
      mockConnect.mockResolvedValue({ connection: mockConnection });

      await expect(connectDB()).resolves.not.toThrow();
    });
  });

  describe('Connection object', () => {
    it('should use connection.host for logging', async () => {
      const customConnection = { host: 'custom-host:27017' };
      mockConnect.mockResolvedValue({ connection: customConnection });

      await connectDB();

      expect(console.log).toHaveBeenCalledWith(
        'MONGODB CONECTADO: ',
        'custom-host:27017'
      );
    });

    it('should handle connection with different host formats', async () => {
      const hosts = [
        'localhost:27017',
        'mongodb.example.com:27017',
        '192.168.1.100:27017',
        'cluster0.mongodb.net:27017'
      ];

      for (const host of hosts) {
        const connection = { host };
        mockConnect.mockResolvedValue({ connection });

        await connectDB();

        expect(console.log).toHaveBeenCalledWith(
          'MONGODB CONECTADO: ',
          host
        );
        
        jest.clearAllMocks();
      }
    });
  });

  describe('Error scenarios', () => {
    it('should handle mongoose connect rejection', async () => {
      mockConnect.mockRejectedValue(new Error('MongoNetworkError'));

      await connectDB();

      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('should handle malformed connection strings gracefully', async () => {
      jest.resetModules();
      
      jest.unstable_mockModule('../../lib/env.js', () => ({
        ENV: { MONGO_URI: 'invalid://connection/string' }
      }));

      const { connectDB } = await import('../../lib/db.js');
      mockConnect.mockRejectedValue(new Error('Invalid connection string'));

      await connectDB();

      expect(console.error).toHaveBeenCalled();
      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('Async behavior', () => {
    it('should return a promise', () => {
      mockConnect.mockResolvedValue({ connection: mockConnection });

      const result = connectDB();

      expect(result).toBeInstanceOf(Promise);
    });

    it('should be awaitable', async () => {
      mockConnect.mockResolvedValue({ connection: mockConnection });

      await expect(connectDB()).resolves.not.toThrow();
    });

    it('should handle multiple concurrent calls', async () => {
      mockConnect.mockResolvedValue({ connection: mockConnection });

      const calls = [connectDB(), connectDB(), connectDB()];

      await Promise.all(calls);

      expect(mockConnect).toHaveBeenCalledTimes(3);
    });
  });
});