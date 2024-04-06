import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import * as exc from '@base/api/exception.reslover';

import { IS_PUBLIC_KEY } from '../decorator/public.decorator';

@Injectable()
export class JwtAnonymousGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // You can throw an exception based on either "info" or "err" arguments
    if (err && !user) {
      throw err || new exc.Unauthorized({ message: 'Token is expired' });
    }
    return user;
  }
}
