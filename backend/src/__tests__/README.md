# Test Suite Documentation

This directory contains comprehensive unit tests for the Talkalot backend application, focusing on the recent changes that introduced email functionality and centralized environment configuration.

## Overview

The test suite covers all modified files in the current branch compared to `main`:
- Environment configuration (lib/env.js)
- Email service client (lib/resend.js)
- Email templates (emails/emailTemplate.js)
- Email handlers (emails/emailHandlers.js)
- Utility functions (lib/utils.js)
- Authentication controller (controllers/auth.controller.js)
- Database connection (lib/db.js)

## Running Tests

### Install Dependencies
Run: npm install

### Run All Tests
Run: npm test

### Run Tests in Watch Mode
Run: npm test:watch

### Run Tests with Coverage
Run: npm test:coverage

## Test Files Overview

Total: 200+ comprehensive test cases across 7 test files

- src/__tests__/lib/env.test.js (25 tests)
- src/__tests__/lib/resend.test.js (18 tests)
- src/__tests__/lib/utils.test.js (30+ tests)
- src/__tests__/lib/db.test.js (25+ tests)
- src/__tests__/emails/emailTemplate.test.js (32 tests)
- src/__tests__/emails/emailHandlers.test.js (20 tests)
- src/__tests__/controllers/auth.controller.test.js (50+ tests)

## Testing Approach

### Mocking Strategy
- External dependencies: Mongoose, bcryptjs, JWT, Resend API are mocked
- Environment variables: process.env is mocked for isolated tests
- Console methods: console.log and console.error are mocked to reduce noise
- Module imports: Using jest.unstable_mockModule for ES modules

### Test Categories
1. Unit Tests: Testing individual functions in isolation
2. Integration Tests: Testing interactions between modules
3. Edge Case Tests: Testing boundary conditions and unusual inputs
4. Error Handling Tests: Testing error scenarios and recovery
5. Security Tests: Testing authentication, authorization, and data protection

## Coverage Goals

Target coverage metrics:
- Statements: > 90%
- Branches: > 85%
- Functions: > 90%
- Lines: > 90%

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (< 10 seconds total)
- No external dependencies required
- Isolated from database and external services
- Consistent results across environments

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure > 90% coverage for new code
3. Follow existing test patterns
4. Update this README with new test descriptions
5. Run npm test before committing

Last Updated: 2025-01-10
Test Framework: Jest 29.7.0
Node Version: 24.3.0