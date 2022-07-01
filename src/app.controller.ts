import { UserService } from './user.service';
import { Controller, Get, Res } from '@nestjs/common';
import { Cookies } from './cookie.decorator';
import { LineLoginProfile } from './oauth/models/line-login-profile';
import { IdentityPipe } from './oauth/pipes/identity.pipe';
import { response, Response } from 'express';

@Controller('')
export class AppController {
  constructor(private userService: UserService) {}

  @Get('/')
  index(
    @Cookies('sysToken', IdentityPipe) user: LineLoginProfile,
    @Res() resp: Response,
  ) {
    let isLineNotifyConnected = false;
    if (user) {
      isLineNotifyConnected = !!this.userService.getUserSubscribeStatus(
        user.userId,
      );
    }
    return resp.render('index', { user, isLineNotifyConnected });
  }

  @Get('/admin')
  managePage(@Res() resp: Response) {
    return resp.render('admin');
  }
}
