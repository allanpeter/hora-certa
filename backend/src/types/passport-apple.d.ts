declare module 'passport-apple' {
  import { Strategy as PassportStrategy } from 'passport-strategy';

  export interface VerifyCallback {
    (err: Error | null, user?: any, info?: any): void;
  }

  export class Strategy extends PassportStrategy {
    constructor(options: any, verify: any);
  }
}
