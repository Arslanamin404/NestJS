# Introduction to NestJS

NestJS is a powerful, extensible, and progressive Node.js framework that helps developers build efficient, scalable, and maintainable server-side applications. Written in TypeScript, NestJS combines elements of Object-Oriented Programming (OOP), Functional Programming (FP), and Functional Reactive Programming (FRP), making it suitable for modern web applications.

---

## Why Choose NestJS?

NestJS offers a variety of features that make it an excellent choice for backend development:

- **TypeScript by Default**: Benefit from type safety and modern JavaScript features.
- **Modular Architecture**: Simplify code organization and scaling through modules.
- **Dependency Injection**: Built-in DI system simplifies service management.
- **Platform Independence**: Supports REST APIs, GraphQL, WebSockets, and Microservices.
- **Extensive Ecosystem**: Integrates seamlessly with tools like TypeORM, Mongoose, Passport.js, and others.
- **Robust CLI**: Streamlines project setup and code generation.
- **Powerful Testing Utilities**: Built-in support for unit and end-to-end testing.

---

## Key Features

1. **Modular Design**: Easily break down your application into manageable modules.
2. **Extensibility**: Use decorators to extend and customize functionality.
3. **Built-in Middleware**: Simplify tasks like authentication, logging, and validation.
4. **Cross-platform Support**: Build for REST, GraphQL, WebSockets, or Microservices.
5. **Type Safety**: Fully typed API out of the box, reducing runtime errors.
6. **Testing Utilities**: Provides tools for unit testing and E2E testing.

---

## Getting Started

### Prerequisites

Ensure that the following are installed:

- **Node.js** (>= 16.x)
- **npm** (or **yarn**)

### Installation

1. Install the NestJS CLI:

   ```bash
   npm install -g @nestjs/cli
   ```

2. Create a new project:

   ```bash
   nest new project-name
   ```

3. Navigate to the project directory:

   ```bash
   cd project-name
   ```

4. Start the development server:

   ```bash
   npm run start:dev
   ```

---

## Core Concepts

### Modules

Modules are the building blocks of a NestJS application, used to group related components. Every application has a root module, defined in `app.module.ts`.

Example:

```typescript
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Controllers

Controllers handle incoming HTTP requests and return responses.

Example:

```typescript
import { Controller, Get } from "@nestjs/common";

@Controller("app")
export class AppController {
  @Get()
  getHello(): string {
    return "Hello World!";
  }
}
```

### Providers

Providers define and encapsulate business logic. They are typically used with services.

Example:

```typescript
import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Hello World!";
  }
}
```

### Decorators

NestJS uses decorators to add metadata to classes, methods, and parameters. Examples include `@Controller`, `@Get`, `@Post`, `@Injectable`, and `@Module`.

---

## Project Structure

A typical NestJS project has the following structure:

```
src/
├── app.controller.ts  // Handles HTTP requests
├── app.service.ts     // Contains business logic
├── app.module.ts      // Root module
├── main.ts            // Application entry point
```

---

## Running the Application

Use the following commands to run your NestJS application:

- **Development Mode**:

  ```bash
  npm run start:dev
  ```

- **Production Mode**:

  ```bash
  npm run start:prod
  ```

- **Testing**:
  - Unit Tests: `npm run test`
  - E2E Tests: `npm run test:e2e`

---

## Integrations

NestJS works seamlessly with:

- **Databases**: TypeORM, Sequelize, Mongoose
- **Authentication**: Passport.js, JWT
- **GraphQL**: Apollo Server
- **Microservices**: Kafka, RabbitMQ, gRPC

---

## Example Application

Here is a simple example of a RESTful API built with NestJS:

1. Create a new resource:

   ```bash
   nest g resource users
   ```

2. Define a `UserController`:

   ```typescript
   import { Controller, Get, Post, Body } from "@nestjs/common";

   @Controller("users")
   export class UsersController {
     private users = [];

     @Get()
     getUsers(): any[] {
       return this.users;
     }

     @Post()
     createUser(@Body() user: any): string {
       this.users.push(user);
       return "User created successfully!";
     }
   }
   ```

3. Add the controller to the module:

   ```typescript
   import { Module } from "@nestjs/common";
   import { UsersController } from "./users.controller";

   @Module({
     controllers: [UsersController],
   })
   export class UsersModule {}
   ```

4. Run the application and test the endpoints.

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [GitHub Repository](https://github.com/nestjs/nest)
- [YouTube Tutorials](https://www.youtube.com/results?search_query=nestjs+tutorial)

---

## License

This project is licensed under the [MIT License](LICENSE).
