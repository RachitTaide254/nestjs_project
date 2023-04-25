import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Session,
  Type,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Admin } from 'src/admin/admin.model';
import { Power_user } from 'src/power_user/power_user.model';
import { User } from 'src/user/user.model';
import session from 'express-session';
import { Complaint } from 'src/complaints/complaint.model';
import { Support_desk } from 'src/support_desk/support_desk.model';
import { MailerService } from '@nestjs-modules/mailer';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as Jwt from 'jsonwebtoken';
import { AuthGuard } from '@nestjs/passport';
import { Request } from "express";
import { AuthenticatedGuard, LocalAuthGuard } from './local-auth.guard';
@Controller()
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectModel('user') private readonly userModel: Model<User>,
    @InjectModel('Power_user') private readonly Power_userModel: Model<Power_user>,

  ) {}

  @Post('admin/signup')
  async admin_signup(@Body() adminDto: Admin) {
    return this.authService.admin_signup(adminDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('admin/login')
  async admin_login(@Body() adminDto: Admin,@Req() req) {
    return this.authService.admin_login(adminDto);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('admin/createPowerUser')
  async createPowerUser(@Body() dto: Power_user) {
    return this.authService.createPowerUser(dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('admin/createUser')
  async createUser(@Body() dto: User) {
    return this.authService.createUser(dto);
  }

  @Post('user/createComplaint')
  async createComplaint(@Body() dto: Complaint) {
    return this.authService.createComplaint(dto);
  }

  @UseGuards(AuthenticatedGuard)
  @Post('admin/createSupportdesk')
  async createSupportdesk(@Body() dto: Support_desk) {
    return this.authService.createSupportdesk(dto);
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get('user/complaint/:id')
  async viewComplaint(@Param('id') id: Complaint,@Req() req:Request) {
    var data ={
      id:id,
      user:req.user
    }
    return this.authService.viewComplaint(data);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt')) 
  @Delete('user/complaint/:id')
  async deleteComplaint(@Param('id') id: Complaint,@Req() req:Request) {
    var data ={
      id:id,
      user:req.user
    }
    return this.authService.deleteComplaint(data);
  }

  @UseGuards(AuthGuard('jwt')) 
  @Get('user/complaints')
  async allComplaint(@Req() req:Request) {
    return this.authService.allComplaint(req.user);
  }

  @Post('user/login')
  async user_login(@Body() userDto: User) {
    return this.authService.user_login(userDto);
  }

  @Post('poweruser/login')
  async   poweruser_login(@Body() userDto: Power_user) {
    return this.authService.poweruser_login(userDto);
  }

  @Post('user/resetpassword/:token')
  async resetPassword(@Body() dto: User, @Param('token') token: User) {
    try {
      const UserExist = await this.userModel.findOne({ accessToken: token });
      if (UserExist) {
        const payload = { email: UserExist.email };
        const accesstoken = Jwt.sign(payload, 'super-secret-jwt');
        const salt = await bcrypt.genSalt(10);
        var newPassword = await bcrypt.hash(dto.password, salt);
        await this.userModel.findOneAndUpdate(
          { accessToken: token },
          { password: newPassword, accessToken: accesstoken },
        );
      } else {
        throw new ForbiddenException('Token expired');
      }
    } catch (e) {
      return e.response;
    }
  }

  @Post('poweruser/resetpassword/:token')
  async resetPasswordPowerUser(@Body() dto: Power_user, @Param('token') token: Power_user) {
    try {
      const UserExist = await this.Power_userModel.findOne({ accessToken: token });
      if (UserExist) {
        const payload = { email: UserExist.email };
        const accesstoken = Jwt.sign(payload, 'super-secret-jwt');
        const salt = await bcrypt.genSalt(10);
        var newPassword = await bcrypt.hash(dto.password, salt);
        await this.Power_userModel.findOneAndUpdate(
          { accessToken: token },
          { password: newPassword, accessToken: accesstoken },
        );
      } else {
        throw new ForbiddenException('Token expired');
      }
    } catch (e) {
      return e.response;
    }
  }

}
