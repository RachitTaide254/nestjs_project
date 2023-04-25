import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Admin, AdminSchema } from '../admin/admin.model';
import { Power_user, Power_userSchema } from 'src/power_user/power_user.model';
import { UserSchema } from 'src/user/user.model';
import { ComplaintSchema } from 'src/complaints/complaint.model';
import { Support_deskSchema } from 'src/support_desk/support_desk.model';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { SessionSerializer } from './session.serializer';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategy/session.strategy';
import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      process.env.DATABASE_URI,
    ),
    MongooseModule.forFeature([{ name: 'admin', schema: AdminSchema }]),
    MongooseModule.forFeature([
      { name: 'Power_user', schema: Power_userSchema },
    ]),
    MongooseModule.forFeature([{ name: 'user', schema: UserSchema }]),
    MongooseModule.forFeature([{ name: 'complaint', schema: ComplaintSchema }]),
    MongooseModule.forFeature([
      { name: 'support_desk', schema: Support_deskSchema },
    ]),
    JwtModule.register({})
    ,
    PassportModule.register({session:true})
    ,
    MailerModule.forRoot({
      transport: {
        host: 'smtp.sendgrid.net',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASS,
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy,SessionSerializer],
})
export class AuthModule {}
