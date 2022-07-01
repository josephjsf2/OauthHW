import { UserService } from './../../user.service';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class IdentityPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  transform(value: string) {
    if (value) {
      return this.userService.getUserBySysToken(value);
    }
    return null;
  }
}
