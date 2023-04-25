import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PowerUserModule } from './power_user/power_user.module';
import { AdminModule } from './admin/admin.module';
import { SupportDeskModule } from './support_desk/support_desk.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule.forRoot({}),AuthModule, UserModule, PowerUserModule, AdminModule, SupportDeskModule],
})

export class AppModule {}
