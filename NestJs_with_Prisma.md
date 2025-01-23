# Learning NestJS: Modules, Models, and Prisma (MySQL)

Welcome to this beginner-friendly guide to learning NestJS, focusing on **modules**, **models**, and using **Prisma** with MySQL. This guide includes realistic examples, structured project files, and step-by-step explanations. By the end of this documentation, you'll understand how to:

- Create and structure **modules** in NestJS.
- Work with **models** in a project.
- Use **Prisma** to interact with a **MySQL** database.

---

## Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v18+ recommended)
2. **npm** or **yarn**
3. **Nest CLI** (`npm install -g @nestjs/cli`)
4. **MySQL Server**
5. **Prisma CLI** (`npm install -g prisma`)

---

## Step 1: Setting Up a New NestJS Project

1. Create a new NestJS project:

   ```bash
   nest new nestjs-prisma-tutorial
   ```

2. Navigate to the project directory:

   ```bash
   cd nestjs-prisma-tutorial
   ```

3. Install required dependencies:

   ```bash
   npm install @nestjs/config @nestjs/prisma prisma @prisma/client
   ```

4. Initialize Prisma:

   ```bash
   npx prisma init
   ```

   This will create a `prisma` directory with a `schema.prisma` file.

---

## Step 2: Setting Up Modules in NestJS

Modules are the building blocks of a NestJS application. Let's create a module for managing **users**.

1. Generate a `Users` module:

   ```bash
   nest generate module users
   ```

2. Generate a service and controller for the `Users` module:

   ```bash
   nest generate service users
   nest generate controller users
   ```

3. The file structure will look like this:

   ```plaintext
   src/
     users/
       users.module.ts
       users.service.ts
       users.controller.ts
   ```

---

## Step 3: Defining a Prisma Model

Prisma uses a `schema.prisma` file to define your database schema. Let's create a `User` model.

1. Open `prisma/schema.prisma` and update it:

   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }

   generator client {
     provider = "prisma-client-js"
   }

   model User {
     id        Int      @id @default(autoincrement())
     name      String
     email     String   @unique
     createdAt DateTime @default(now())
   }
   ```

2. Run the following commands to migrate your schema:

   ```bash
   npx prisma migrate dev --name init
   ```

   This will create the necessary tables in your MySQL database.

---

## Step 4: Integrating Prisma into the `Users` Module

1. Add Prisma service to the application:

   ```bash
   nest generate service prisma
   ```

2. Implement the Prisma service in `src/prisma/prisma.service.ts`:

   ```typescript
   import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
   import { PrismaClient } from "@prisma/client";

   @Injectable()
   export class PrismaService
     extends PrismaClient
     implements OnModuleInit, OnModuleDestroy
   {
     async onModuleInit() {
       await this.$connect();
     }

     async onModuleDestroy() {
       await this.$disconnect();
     }
   }
   ```

3. Register `PrismaService` in `AppModule`:

   ```typescript
   import { Module } from "@nestjs/common";
   import { PrismaService } from "./prisma/prisma.service";
   import { UsersModule } from "./users/users.module";

   @Module({
     imports: [UsersModule],
     providers: [PrismaService],
   })
   export class AppModule {}
   ```

4. Use `PrismaService` in the `UsersService`:

   ```typescript
   import { Injectable } from "@nestjs/common";
   import { PrismaService } from "../prisma/prisma.service";

   @Injectable()
   export class UsersService {
     constructor(private readonly prisma: PrismaService) {}

     async createUser(name: string, email: string) {
       return this.prisma.user.create({
         data: { name, email },
       });
     }

     async findAllUsers() {
       return this.prisma.user.findMany();
     }
   }
   ```

---

## Step 5: Creating Endpoints in the `UsersController`

1. Update `src/users/users.controller.ts`:

   ```typescript
   import { Controller, Get, Post, Body } from "@nestjs/common";
   import { UsersService } from "./users.service";

   @Controller("users")
   export class UsersController {
     constructor(private readonly usersService: UsersService) {}

     @Post()
     async createUser(@Body() body: { name: string; email: string }) {
       return this.usersService.createUser(body.name, body.email);
     }

     @Get()
     async getAllUsers() {
       return this.usersService.findAllUsers();
     }
   }
   ```

---

## Step 6: Testing Your Application

1. Run the application:

   ```bash
   npm run start
   ```

2. Test the endpoints:

   - **POST /users**:

     ```json
     POST http://localhost:3000/users
     {
       "name": "John Doe",
       "email": "john@example.com"
     }
     ```

   - **GET /users**:

     ```json
     GET http://localhost:3000/users
     ```

     This will return a list of all users in the database.

---

## Step 7: Realistic Project Idea: Task Management System

### Goal

Build a simple Task Management API with the following features:

1. **Users**:

   - Create and fetch users.

2. **Tasks**:

   - Create tasks.
   - Assign tasks to users.
   - Fetch tasks by user.

### File Structure

```plaintext
src/
  prisma/
    prisma.service.ts
  users/
    users.module.ts
    users.service.ts
    users.controller.ts
  tasks/
    tasks.module.ts
    tasks.service.ts
    tasks.controller.ts
app.module.ts
```

Use the steps above to create models for **Tasks**, define relationships in Prisma, and build REST APIs.

---

Happy coding! Explore, experiment, and build something awesome with NestJS!

Mohammad Arsalan Rather
