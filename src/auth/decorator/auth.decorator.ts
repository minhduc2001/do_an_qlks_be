import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { JwtAnonymousGuard } from '../guard/jwt-anonymous.guard';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RolesGuard } from '@/role/roles.guard';
import { ERole } from '@/role/enum/roles.enum';

export const ROLES_KEY = 'roles';

export const Auth = (...roles: ERole[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, roles),
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
};

export const AuthAnonymous = () => {
  return applyDecorators(
    UseGuards(JwtAnonymousGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
};
