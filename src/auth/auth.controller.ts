import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from './guards/auth/auth.guard';
import { User } from './entities/user.entity';
import { loginResponse } from './interfaces/login-response';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('/login')
  login(@Body() login: LoginDto) {
    return this.authService.login(login);
  }

  @Post('/register')
  register(@Body() registerUser: RegisterUserDto) {
    return this.authService.regiter(registerUser);
  }

  @Post('/checkToken')
  @UseGuards(AuthGuard)
  checkToken(@Request() req: Request) {
    const user = req['user'] as User;
    return {
      user: user,
      token: this.authService.getJsonWebtToken({
        id: user._id,
        iat: 0,
        exp: 0,
      }),
    };
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Request() req: Request) {
    console.log(req);
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateUserDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
