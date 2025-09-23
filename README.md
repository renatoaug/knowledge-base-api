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

# add .env
cp .env.example .env
```

## Running

```bash
# serve with hot reload at http://localhost:3000
$ npm run dev
```

### Project structure

```
src/
  app.ts
  server.ts
  routes/
  controllers/
  services/
  models/
  repositories/
  middleware/
  utils/
  tests/
```

### Conventional commits

This repository follows [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Examples:

- `build: setup project`
- `style: add lint`
- `feat(topic): create versioning factory`
- `test: add unit tests for topic service`
- `refactor: extract permission strategy`
