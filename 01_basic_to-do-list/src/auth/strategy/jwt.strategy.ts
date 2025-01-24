import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private prisma: PrismaService, private config: ConfigService) {
        const jwtSecret = config.get("JWT_SECRET");

        if (!jwtSecret) {
            throw new Error("JWT_SECRET is not defined in the configuration");
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: any) {
        const user = await this.prisma.users.findUnique({
            where: { Id: payload.sub },
        });
        if (!user) {
            throw new Error("Unauthorized");
        }
        return { userId: user.Id, name: user.name, email: user.email, role: user.role };
    }
}