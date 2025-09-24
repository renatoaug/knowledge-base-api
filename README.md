## Description

RESTful API for a dynamic Knowledge Base system with hierarchical topics, versioning, resources, users, roles/permissions, and robust architecture (SOLID + design patterns). Built with Node.js, TypeScript and Express.

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

### Authentication for local/dev

Use header: `Authorization: Bearer editor-token` (`viewer-token` or `admin-token`).

Example:

```bash
curl -s -X POST http://localhost:3000/topics \
  -H 'Authorization: Bearer editor-token' \
  -H 'Content-Type: application/json' \
  -d '{ "name":"Root", "content":"c", "parentTopicId":null }'
```

## Data storage (file-based database)

This project uses a simple file-based persistence layer (JSON files) as the default database.

- Directory: `<project-root>/data` (created automatically on first access)
- Files:
  - `topics.json` (topic heads: `topicId`, `latestVersion`, `deletedAt`)
  - `topics.versions.json` (append-only topic versions)
  - `users.json` (seeded users for auth in local/dev)

No manual configuration is required; the data directory and files are created automatically when the application runs.

## Testing

```bash
$ nvm use
$ npm run test
```

## Conventional commits

This repository follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Examples:

- `build: setup project`
- `style: format files`
- `feat(topic): create versioning factory`
- `test: add unit tests for topic service`
- `refactor: extract permission strategy`

## Husky <sub><sup>(required to commit)</sup></sub>

We use [husky](https://www.npmjs.com/package/husky) to handle some hooks like `pre-commit` and `commit-msg`.
