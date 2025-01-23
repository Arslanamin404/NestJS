# Data Transfer Object (DTO) in NestJS

## Table of Contents

1. **Introduction to DTO**
2. **Why Use DTOs?**
3. **Setting Up DTOs in NestJS**
4. **Validations with `class-validator` and `class-transformer`**
5. **Best Practices for DTOs**
6. **Example: Building a Real-World Application**

---

## 1. Introduction to DTO

DTO (Data Transfer Object) is a design pattern used to transfer data between processes. In NestJS, DTOs are typically used to define the shape of the data sent to and from APIs, providing a clear contract for data handling.

---

## 2. Why Use DTOs?

- **Data Validation**: DTOs ensure the correctness of incoming data.
- **Type Safety**: Leveraging TypeScript, DTOs provide compile-time type checking.
- **Separation of Concerns**: Isolates data validation and transformation logic from business logic.
- **Reusability**: Shared DTOs across modules promote consistency.

---

## 3. Setting Up DTOs in NestJS

### Step 1: Install Required Packages

```bash
npm install class-validator class-transformer
```

### Step 2: Create a DTO

Create a `dto` folder in your module directory, and define DTOs as classes:

```typescript
// user/dto/create-user.dto.ts
import { IsString, IsEmail, Length } from "class-validator";

export class AuthDto {
  @IsString()
  @Length(3, 20)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 20)
  password: string;
}
```

### Step 3: Use the DTO in Controllers

```typescript
// user/user.controller.ts
import { Body, Controller, Post } from "@nestjs/common";
import { AuthDto } from "./dto/create-user.dto";

@Controller("users")
export class UserController {
  @Post()
  createUser(@Body() dta: AuthDto) {
    return { message: "User created successfully", data: dto };
  }
}
```

---

## 4. Validations with `class-validator` and `class-transformer`

### Enabling Validation in NestJS

Update the main application file:

```typescript
// main.ts
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Removes unexpected properties
      forbidNonWhitelisted: true, // Throws an error for unexpected properties
      transform: true, // Automatically transforms data to DTO class
    })
  );
  await app.listen(3000);
}
bootstrap();
```

### Advanced Validation

Add custom validations:

```typescript
import { IsString, Length, Matches } from "class-validator";

export class UpdatePasswordDto {
  @IsString()
  @Length(8, 20)
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/, {
    message:
      "Password must include at least one uppercase letter, one lowercase letter, and one number.",
  })
  newPassword: string;
}
```

---

## 5. Best Practices for DTOs

1. **Single Responsibility**: Each DTO should focus on a single responsibility (e.g., creation, update).
2. **Consistency**: Use consistent naming conventions (e.g., `CreateUserDto`, `UpdateUserDto`).
3. **Immutability**: Avoid mutating DTO objects; treat them as read-only.
4. **Validation Logic**: Keep validation logic in DTOs to simplify controllers and services.
5. **Avoid Overloading DTOs**: Do not use the same DTO for different purposes.

---

## 7. Example: Building a Real-World Application

### Scenario: User Management

- **Features**: User creation, update, and retrieval.
- **Modules**: User module with DTOs for each operation.

#### Install Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

#### Initialize Prisma

```bash
npx prisma init
```

This creates a `prisma` folder with a `schema.prisma` file.

#### Define the Database Schema

Update `prisma/schema.prisma`:

```typescript
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // Change to your database provider (e.g., PostgreSQL, MySQL)
  url      = "file:./dev.db"
}

model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

```

#### Generate Prisma Client

```bash
npx prisma generate
```

#### CreateUserDto

```typescript
// user/dto/create-user.dto.ts
import { IsEmail, IsString, Length, IsNotEmpty } from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
```

#### UserService

```typescript
// user/user.service.ts
import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number) {
    await this.prisma.user.delete({ where: { id } });
    return { message: `User with ID ${id} deleted successfully.` };
  }
}
```

#### UserController

```typescript
// user/user.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
```

---

With this guide, you should now have a strong understanding of how to implement and use DTOs effectively in NestJS, from a beginner level to production-grade applications.
