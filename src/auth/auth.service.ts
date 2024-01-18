import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { loginResponse } from '../auth/interfaces/login-response';
import { RegisterUserDto } from './dto/register-user.dto';
import { Payload } from './interfaces/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const { password, ...userData } = createUserDto;

      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData,
      });
      //bcryptjs.
      await newUser.save();
      const { password: _, ...user } = newUser.toJSON();
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(`${createUserDto.email} already exist`);
      }
      throw new InternalServerErrorException('Someting terrible Happen');
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string): Promise<User> {
    console.log(id);
    const user = await this.userModel.findById(id);
    const { password, ...resp } = user.toJSON();
    return resp;
  }

  async login(login: LoginDto): Promise<loginResponse> {
    const { email, password } = login;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new UnauthorizedException('Not Valid Credencial 1');
    }
    if (!bcryptjs.compareSync(password, user.password)) {
      throw new UnauthorizedException('Not Valid Credencial 2');
    }
    const { password: _, ...rest } = user.toJSON();

    return {
      user: rest,
      token: await this.getJsonWebtToken({
        id: user.id,
      }),
    };
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  async regiter(registerUser: RegisterUserDto): Promise<loginResponse> {
    const user = await this.create(registerUser);

    return {
      user: user,
      token: await this.getJsonWebtToken({
        id: user._id,
      }),
    };
  }

  update(id: number, updateAuthDto: UpdateUserDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async getJsonWebtToken(payload: Payload) {
    return this.jwtService.sign(payload);
  }
}
