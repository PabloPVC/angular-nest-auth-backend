import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { Payload } from 'src/auth/interfaces/jwt-payload';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No hay token en la autorización ');
    }
    try {
      const payload = await this.jwtService.verifyAsync<Payload>(token, {
        secret: process.env.JWT_SEED,
      });
      console.log(payload);
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      const user = await this.authService.findUserById(payload.id);
      if (!user.isactive) {
        throw new UnauthorizedException('El usuario no está activo ');
      }
      request['user'] = user;
    } catch (error) {
      throw new UnauthorizedException('Error en AuthGuard.' + error);
    }
    return true;
  }
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
