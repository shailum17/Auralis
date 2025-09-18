import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to make authentication optional
  handleRequest(err: any, user: any) {
    // Return user if authenticated, null if not (no error thrown)
    return user;
  }
}