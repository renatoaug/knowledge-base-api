## Description

RESTful API for a dynamic Knowledge Base system with hierarchical topics, versioning, resources, users, roles/permissions, and SOLID architecture. Built with Node.js, TypeScript and Express.

### Key Features

- **Hierarchical topics**: Tree-structured knowledge organization with parent-child relationships
- **Version control**: Immutable topic versions with full history tracking
- **Resources management**: Link external documents, videos, articles to topics
- **Cascade operations**: Automatic resource cleanup when topics are deleted
- **Custom algorithms**: Shortest path calculation between topics
- **Role-based access**: Admin, Editor, Viewer permissions
- **Clean architecture**: SOLID principles with dependency injection
- **Comprehensive testing**: Unit and integration tests
- **OpenAPI documentation**: Auto-generated Swagger docs with authentication

## Setup

### Prerequisites

- [Git](https://git-scm.com/)
- [NPM](https://www.npmjs.com/)
- [Node](https://nodejs.org/en/) `>=24.0.0` (We recommend you install using [NVM](https://github.com/nvm-sh/nvm))

### Installation

Nvm must be installed and available in your shell

```bash
# use the project node version
$ nvm use

# install dependencies
$ npm install
```

### Environment variables

Copy `.env.sample` to `.env`:

```bash
cp .env.sample .env
```

### Seed

Seed users for local testing:

```bash
$ npm run seed
```

## Run application

```bash
# serve with hot reload at http://localhost:3000
$ npm run dev
```

## Testing

```bash
# Run specific test files
npm test -- --testPathPatterns="topic.service.test.ts"

# Run all tests
npm run test

# Run integration tests only
npm test -- --testPathPatterns="integration"

# Run unit tests only
npm test -- --testPathPatterns="unit"
```

## Data storage

### File-based database

Simple JSON file persistence for development and testing:

- **Directory**: `<project-root>/data` (auto-created)
- **Files**:
  - `topics.json` - Topic heads (latest version pointers)
  - `topics.versions.json` - Immutable topic version history
  - `resources.json` - External resources linked to topics
  - `users.json` - User accounts and roles

### Data relationships

- **Topics** → **Resources** (1:N) with cascade delete
- **Topics** → **Topics** (1:N) hierarchical structure
- **Users** → **Topics** (M:N) through permissions

## API documentation

### Interactive documentation

**[Swagger UI](http://localhost:3000/docs)** - Interactive API explorer with authentication

### Authentication

All endpoints require Bearer token authentication. Use the "Authorize" button in Swagger UI or include the header:

```
Authorization: Bearer <token>
```

**Available tokens:**

- `admin-token` - Full access (create, read, update, delete)
- `editor-token` - Create, read, update (no delete)
- `viewer-token` - Read-only access

Request example:

```bash
curl -s -X POST http://localhost:3000/topics \
  -H 'Authorization: Bearer editor-token' \
  -H 'Content-Type: application/json' \
  -d '{ "name":"Root", "content":"c", "parentTopicId":null }'
```

## Quick start

### Basic usage

1. **Start the server**: `npm run dev`
2. **Open Swagger UI**: [http://localhost:3000/docs](http://localhost:3000/docs)
3. **Authorize**: Click "Authorize" and use `admin-token`, `editor-token`, or `viewer-token`
4. **Explore**: Use the interactive API explorer to test endpoints

## Advanced features

### Version control

Every topic modification creates a new immutable version:

- **Create**: Version 1 with `CREATE` action
- **Update**: Version N+1 with `UPDATE` action
- **Delete**: Version N+1 with `DELETE` action (soft delete)

### Hierarchical structure

Topics can have parent-child relationships:

- **Root topics**: `parentTopicId: null`
- **Child topics**: Reference parent via `parentTopicId`
- **Tree navigation**: Get complete topic hierarchy
- **Path finding**: Calculate shortest path between any two topics

### Resource types

Supported resource types:

- `video` - Video content
- `article` - Text articles
- `pdf` - PDF documents
- `link` - External links

## Architecture

### Clean architecture

The project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── controllers/     # HTTP request/response handling
├── services/        # Business logic orchestration
├── usecases/        # Application-specific business rules
├── repositories/    # Data access interfaces (ports)
├── infra/          # Infrastructure implementations (adapters)
├── models/         # Domain entities and types
├── security/       # Authentication and authorization
├── middlewares/    # Cross-cutting concerns
└── schemas/        # Validation and OpenAPI generation
```

### Design patterns

- **Strategy**: Permission strategies for role-based access
- **Factory**: Topic version creation
- **Repository**: Data access abstraction
- **Use Case**: Business logic encapsulation

## Conventional commits

This repository follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Examples:

- `build: setup project`
- `style: format files`
- `feat(topic): create versioning factory`
- `test: add unit tests for topic service`
- `refactor: extract permission strategy`

## Husky <sub><sup>(required to commit)</sup></sub>

We use [husky](https://www.npmjs.com/package/husky) to handle some hooks like `pre-commit` and `commit-msg`.
