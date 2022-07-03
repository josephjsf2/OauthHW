import { UserService } from '../../user.service';
import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class AdminIdentityPipe implements PipeTransform {
  constructor(private userService: UserService) {}

  transform(value: string) {
    if (value) {
      return this.userService.getUserByAdminToken(value);
    }
    return null;
  }
}
