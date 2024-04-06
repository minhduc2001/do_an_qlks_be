import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { Public } from './decorator/public.decorator';
import { LoginDto, RegisterDto } from './dtos/auth.dto';
import { GetUser } from './decorator/get-user.decorator';
import { User } from '@/user/entities/user.entity';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Controller('auth')
@ApiTags('Auth')
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Get('get-me')
  async getMe(@GetUser() user: User) {
    return user;
  }

  @Public()
  @Post('fogot-password')
  async forgotPassword() {
    return;
  }
}
