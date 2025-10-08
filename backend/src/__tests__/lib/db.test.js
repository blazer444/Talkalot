import { connectDB } from '../../lib/db.js';
import mongoose from 'mongoose';

// Mock mongoose
jest.mock('mongoose');

describe('connectDB', () => {
  const originalEnv = process.env;
  let consoleLogSpy;
  let consoleErrorSpy;
  let processExitSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup environment
    process.env = { 
      ...originalEnv,
      MONGO_URI: 'mongodb://localhost:27017/test-db'
    };

    // Spy on console methods
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    processExitSpy = jest.spyOn(process, 'exit').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Happy Path', () => {
    test('should connect to MongoDB successfully', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'localhost:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://localhost:27017/test-db');
      expect(consoleLogSpy).toHaveBeenCalledWith('MONGODB CONECTADO: ', 'localhost:27017');
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    test('should use MONGO_URI from environment variables', async () => {
      // Arrange
      process.env.MONGO_URI = 'mongodb://custom-host:27017/custom-db';
      const mockConnection = {
        connection: { host: 'custom-host:27017' }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith('mongodb://custom-host:27017/custom-db');
    });

    test('should log connection host after successful connection', async () => {
      // Arrange
      const mockConnection = {
        connection: {
          host: 'mongodb-server.example.com:27017'
        }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith(
        'MONGODB CONECTADO: ',
        'mongodb-server.example.com:27017'
      );
    });
  });

  describe('Environment Variable Validation', () => {
    test('should throw error when MONGO_URI is not defined', async () => {
      // Arrange
      delete process.env.MONGO_URI;

      // Act & Assert
      await expect(connectDB()).rejects.toThrow(
        'MONGO_URI não está definido nas variáveis de ambiente.'
      );
      expect(mongoose.connect).not.toHaveBeenCalled();
    });

    test('should throw error when MONGO_URI is empty string', async () => {
      // Arrange
      process.env.MONGO_URI = '';

      // Act & Assert
      await expect(connectDB()).rejects.toThrow(
        'MONGO_URI não está definido nas variáveis de ambiente.'
      );
      expect(mongoose.connect).not.toHaveBeenCalled();
    });

    test('should throw error when MONGO_URI is null', async () => {
      // Arrange
      process.env.MONGO_URI = null;

      // Act & Assert
      await expect(connectDB()).rejects.toThrow(
        'MONGO_URI não está definido nas variáveis de ambiente.'
      );
    });

    test('should throw error when MONGO_URI is undefined', async () => {
      // Arrange
      process.env.MONGO_URI = undefined;

      // Act & Assert
      await expect(connectDB()).rejects.toThrow(
        'MONGO_URI não está definido nas variáveis de ambiente.'
      );
    });
  });

  describe('Connection Errors', () => {
    test('should handle connection error and exit process', async () => {
      // Arrange
      const connectionError = new Error('Connection refused');
      mongoose.connect.mockRejectedValue(connectionError);

      // Act
      await connectDB();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro de conexão no MONGODB : ',
        connectionError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should exit with status code 1 on connection failure', async () => {
      // Arrange
      mongoose.connect.mockRejectedValue(new Error('Network error'));

      // Act
      await connectDB();

      // Assert
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should log error details before exiting', async () => {
      // Arrange
      const error = new Error('Authentication failed');
      mongoose.connect.mockRejectedValue(error);

      // Act
      await connectDB();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro de conexão no MONGODB : ',
        error
      );
    });

    test('should handle timeout errors', async () => {
      // Arrange
      const timeoutError = new Error('Connection timeout');
      mongoose.connect.mockRejectedValue(timeoutError);

      // Act
      await connectDB();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro de conexão no MONGODB : ',
        timeoutError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should handle authentication errors', async () => {
      // Arrange
      const authError = new Error('Authentication failed');
      mongoose.connect.mockRejectedValue(authError);

      // Act
      await connectDB();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should handle network errors', async () => {
      // Arrange
      const networkError = new Error('ECONNREFUSED');
      mongoose.connect.mockRejectedValue(networkError);

      // Act
      await connectDB();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Erro de conexão no MONGODB : ',
        networkError
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });

  describe('Edge Cases', () => {
    test('should handle connection with replica set', async () => {
      // Arrange
      process.env.MONGO_URI = 'mongodb://host1:27017,host2:27017/test-db?replicaSet=rs0';
      const mockConnection = {
        connection: { host: 'host1:27017,host2:27017' }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://host1:27017,host2:27017/test-db?replicaSet=rs0'
      );
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    test('should handle connection with authentication', async () => {
      // Arrange
      process.env.MONGO_URI = 'mongodb://user:password@localhost:27017/test-db';
      const mockConnection = {
        connection: { host: 'localhost:27017' }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://user:password@localhost:27017/test-db'
      );
    });

    test('should handle connection with query parameters', async () => {
      // Arrange
      process.env.MONGO_URI = 'mongodb://localhost:27017/test-db?retryWrites=true&w=majority';
      const mockConnection = {
        connection: { host: 'localhost:27017' }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/test-db?retryWrites=true&w=majority'
      );
    });

    test('should handle MongoDB Atlas URI', async () => {
      // Arrange
      process.env.MONGO_URI = 'mongodb+srv://user:password@cluster.mongodb.net/test-db';
      const mockConnection = {
        connection: { host: 'cluster.mongodb.net' }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledWith(
        'mongodb+srv://user:password@cluster.mongodb.net/test-db'
      );
    });
  });

  describe('Multiple Connection Attempts', () => {
    test('should handle multiple successful connection calls', async () => {
      // Arrange
      const mockConnection = {
        connection: { host: 'localhost:27017' }
      };
      mongoose.connect.mockResolvedValue(mockConnection);

      // Act
      await connectDB();
      await connectDB();

      // Assert
      expect(mongoose.connect).toHaveBeenCalledTimes(2);
      expect(processExitSpy).not.toHaveBeenCalled();
    });

    test('should handle connection retry after failure', async () => {
      // Arrange
      mongoose.connect
        .mockRejectedValueOnce(new Error('First attempt failed'))
        .mockResolvedValueOnce({
          connection: { host: 'localhost:27017' }
        });

      // Act
      await connectDB(); // First call fails
      jest.clearAllMocks();
      await connectDB(); // Second call succeeds

      // Assert
      expect(consoleLogSpy).toHaveBeenCalledWith('MONGODB CONECTADO: ', 'localhost:27017');
    });
  });
});