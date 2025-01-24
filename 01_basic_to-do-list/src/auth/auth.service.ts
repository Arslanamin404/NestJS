import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, RegisterDto } from './DTO/auth.dto';
import { hashPassword, validatePassword } from './utils/password.util';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface Payload {
    sub: number;
    email: string;
}

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService,
    ) { }

    async checkExistingUser(email: string) {
        return this.prisma.users.findUnique({
            where: { email },
        });
    }

    async generateToken(payload: Payload): Promise<string> {
        return this.jwt.signAsync(payload, {
            expiresIn: this.config.get('JWT_EXPIRES_IN'),
            secret: this.config.get('JWT_SECRET'),
        });
    }

    async register(dto: RegisterDto) {
        const { name, email, password } = dto;
        const existingUser = await this.checkExistingUser(email);

        if (existingUser) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await hashPassword(password);

        const user = await this.prisma.users.create({
            data: { email, name, password: hashedPassword },
        });

        return {
            success: true,
            message: 'User registered successfully',
            user: { id: user.Id, email: user.email },
        };
    }

    async login(dto: LoginDto): Promise<{ access_token: string }> {
        const { email, password } = dto;

        const existingUser = await this.checkExistingUser(email);
        if (!existingUser) {
            throw new BadRequestException('Invalid credentials');
        }

        const isPasswordValid = await validatePassword(password, existingUser.password);
        if (!isPasswordValid) {
            throw new BadRequestException('Invalid credentials');
        }

        const token = await this.generateToken({
            sub: existingUser.Id,
            email: existingUser.email,
        });

        return {
            access_token: token,
        };
    }
}