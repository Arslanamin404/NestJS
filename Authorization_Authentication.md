# Authentication and Authorization in NestJS using Passport, and JWT

This guide will walk you through the process of setting up authentication and authorization in a NestJS application using Passport.js, the `@nestjs/jwt` module, and Prisma as the database ORM.

## Table of Contents

1. **Introduction**
2. **Authentication vs Authorization**
3. **Setting Up NestJS Project**
4. **Installing Dependencies**
5. **Configuring Prisma**
6. **Configuring JWT Module**
7. **Implementing Authentication**
   - Creating Auth Module
   - Defining AuthService
   - Using JWT Strategy
   - Creating AuthController
8. **Securing Routes**
9. **Authorization**
   - Role-based Authorization
   - Guard Implementation
10. **Best Practices**
11. **Conclusion**

---

## 1. **Introduction**

Authentication and authorization are critical for securing APIs. In NestJS, Passport.js simplifies authentication by providing various strategies, `@nestjs/jwt` makes it easy to generate and validate JSON Web Tokens (JWTs) for secure, stateless authentication, and Prisma acts as the ORM for managing the database layer.

---

## 2. **Authentication vs Authorization**

- **Authentication**: Verifies the identity of a user (e.g., logging in).
- **Authorization**: Determines what actions an authenticated user is allowed to perform (e.g., checking roles).

---

## 3. **Setting Up NestJS Project**

First, create a new NestJS project:

```bash
nest new nest-auth-tutorial
```

Navigate to the project directory:

```bash
cd nest-auth-tutorial
```

---

## 4. **Installing Dependencies**

Install the required dependencies for Passport.js, JWT, Prisma, and bcrypt:

```bash
npm install @nestjs/passport passport passport-local @nestjs/jwt passport-jwt bcrypt @prisma/client
npm install -D prisma @types/passport-local @types/passport-jwt
```

### Explanation of Dependencies

- **`@nestjs/passport`**: NestJS integration with Passport.js.
- **`passport`**: The authentication middleware.
- **`passport-local`**: Strategy for local username-password authentication.
- **`@nestjs/jwt`**: Module for handling JWTs.
- **`passport-jwt`**: Strategy for JWT authentication.
- **`bcrypt`**: Library for hashing passwords.
- **`@prisma/client`**: Prisma client for database interaction.
- **`prisma`**: Prisma CLI for database migrations and schema management.
- **`@types/*`**: Type definitions for TypeScript.

---

## 5. **Configuring Prisma**

### Initialize Prisma

Run the following command to initialize Prisma:

```bash
npx prisma init
```

This creates a `prisma` folder with a `schema.prisma` file. Update the `datasource` block in `schema.prisma` to use your database. For example, for PostgreSQL:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}
```

### Add User Model

Add the `User` model to `schema.prisma`:

```prisma
model User {
  id        Int     @id @default(autoincrement())
  email     String  @unique
  password  String
  name      String
  role      String  @default("user")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run the migration to update the database:

```bash
npx prisma migrate dev --name init
```

Generate the Prisma Client:

```bash
npx prisma generate
```

---

## 6. **Configuring JWT Module**

### Create `.env` File

Add a secret key and database URL to the `.env` file:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/nestauth
JWT_SECRET=your_secret_key
JWT_EXPIRATION=3600
```

### Update `app.module.ts`

Import `ConfigModule` and `JwtModule`:

```typescript
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
})
export class AppModule {}
```

---

## 7. **Implementing Authentication**

### 1. **Creating Auth Module**

Generate the auth module:

```bash
nest g module auth
```

Generate the auth service and controller:

```bash
nest g service auth
nest g controller auth
```

### 2. **Defining AuthService**

Update `auth.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService, private prisma: PrismaService) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async validatePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await this.validatePassword(password, user.password))) {
      return user;
    }
    return null;
  }

  async generateToken(payload: {
    userId: number;
    email: string;
  }): Promise<string> {
    return this.jwtService.sign(payload);
  }
}
```

### 3. **Using JWT Strategy**

Generate a JWT strategy:

```bash
nest g service auth/jwt
```

Update `jwt.strategy.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!user) {
      throw new Error("Unauthorized");
    }
    return { userId: user.id, email: user.email, role: user.role };
  }
}
```

Register the strategy in `auth.module.ts`:

```typescript
import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
  ],
  providers: [AuthService, JwtStrategy, PrismaService],
  exports: [AuthService],
})
export class AuthModule {}
```

### 4. **Creating AuthController**

Update `auth.controller.ts`:

```typescript
import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const token = await this.authService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return { access_token: token };
  }
}
```

---

## 8. **Securing Routes**

Use the `@UseGuards` decorator with `AuthGuard('jwt')` to secure routes:

```typescript
import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller("profile")
export class ProfileController {
  @UseGuards(AuthGuard("jwt"))
  @Get()
  getProfile() {
    return { message: "This is a secured route." };
  }
}
```

---

## 9. **Authorization**

### 1. Role-based Authorization

Define roles using an enum:

```typescript
export enum Role {
  Admin = "admin",
  User = "user",
}
```

### 2. Guard Implementation

Create a `RolesGuard`:

```typescript
import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>("roles", context.getHandler());
    if (!roles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return roles.includes(user.role);
  }
}
```

Use the `RolesGuard` in combination with a custom `@Roles()` decorator:

```typescript
import { SetMetadata } from "@nestjs/common";

export const Roles = (...roles: string[]) => SetMetadata("roles", roles);
```

Apply it to routes:

```typescript
@Roles(Role.Admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Get('admin')
adminRoute() {
  return { message: 'Welcome Admin!' };
}
```

---

## 10. **Best Practices**

1. Store sensitive environment variables securely.
2. Use bcrypt to hash and compare passwords.
3. Validate JWTs carefully and handle errors gracefully.
4. Implement refresh tokens for long-lived sessions.
5. Secure routes based on user roles and permissions.
6. Use Prisma for efficient and type-safe database interactions.

---

## 11. **Conclusion**

By following this guide, you now have a fully functional authentication and authorization system in NestJS using Passport.js, JWT, and Prisma. This setup provides a solid foundation for building secure and scalable applications.
