import { AdminIdentityPipe } from './oauth/pipes/admin-identity.pipe';
import { UserService } from './user.service';
import { Controller, Get, Res } from '@nestjs/common';
import { Cookies } from './cookie.decorator';
import { LineLoginProfile } from './oauth/models/line-login-profile';
import { IdentityPipe } from './oauth/pipes/identity.pipe';
import { response, Response } from 'express';
import { User } from './user';

@Controller('')
export class AppController {
  constructor(private userService: UserService) {}

  @Get('/')
  index(@Cookies('sysToken', IdentityPipe) user: User, @Res() resp: Response) {
    let isLineNotifyConnected = false;
    if (user) {
      isLineNotifyConnected = !!this.userService.getUserSubscribeStatus(
        user.uuid,
      );
    }
    return resp.render('index', { user, isLineNotifyConnected });
  }

  @Get('/admin')
  managePage(
    @Cookies('adminToken', AdminIdentityPipe) user: User,
    @Res() resp: Response,
  ) {
    return resp.render('admin', { user });
  }
}
