import { ForbiddenException, Injectable } from '@nestjs/common';
import { Admin, AdminDocument } from '../admin/admin.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Power_user } from 'src/power_user/power_user.model';
import { User } from 'src/user/user.model';
import { Complaint } from 'src/complaints/complaint.model';
import { Support_desk } from 'src/support_desk/support_desk.model';

import * as Jwt from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';


@Injectable({})
export class AuthService {
  constructor(
    @InjectModel('admin') private readonly adminModel: Model<Admin>,
    @InjectModel('Power_user')
    private readonly Power_userModel: Model<Power_user>,
    @InjectModel('user') private readonly userModel: Model<User>,
    @InjectModel('complaint') private readonly complaintModel: Model<Complaint>,
    @InjectModel('support_desk')
    private readonly support_deskModel: Model<Support_desk>,
    private mailService: MailerService,
    private jwt: JwtService
  ) {}

  async admin_signup(admin: Admin): Promise<Admin> {
    try {
      const adminExist = await this.adminModel.findOne({ email: admin.email });
      if (adminExist == null) {
        const newUser = new this.adminModel(admin);
        // const payload = { email: admin.email };
        // const token =  Jwt.sign(payload, 'super-secret-jwt');
        // newUser.accessToken =token;
        // const decoded = await (Jwt.verify)(token, 'super-secret-jwt');
        // console.log(decoded,'dddd')
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(admin.password, salt);
        return newUser.save();
      } else {
        throw new ForbiddenException('Credentials taken');
      }
    } catch (e) {
      //console.log(e,'err in admin signup')
      return e.response;
    }
  }

  async validate_user(email:string,password:string):Promise<any>{
    const adminUser = await this.adminModel.findOne({ email: email });
    let validPassword = await bcrypt.compare(
      password,
      adminUser.password,
    );
    if (validPassword) {
      return adminUser;
    }else{
      return 'user not found'
  }
  }
  async admin_login(admin: Admin): Promise<Admin> {
    try {
      const adminUser = await this.adminModel.findOne({ email: admin.email });
      let validPassword = await bcrypt.compare(
        admin.password,
        adminUser.password,
      );
      if (validPassword) {
        var token = await this.signToken(admin.email,adminUser.id)
        return token
        //return adminUser;
      } else {
        throw new ForbiddenException('Credentials incorrect');
      }
    } catch (e) {
      //console.log(e,'err in admin login')
      return e.response;
    }
  }

  async createPowerUser(Power_user: Power_user): Promise<Power_user> {
    try {
      const PowerUserExist = await this.Power_userModel.findOne({
        email: Power_user.email,
      });
      if (PowerUserExist == null) {
        const newUser = new this.Power_userModel(Power_user);
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(Power_user.password, salt);
        const payload = { email: Power_user.email };
        const token = Jwt.sign(payload, 'super-secret-jwt');
        newUser.accessToken = token;
         await this.mailService.sendMail({
          to: Power_user.email,
          from: 'rick96898@gmail.com',
          subject: 'Token auth ✔',
          text: `localhost:3000/poweruser/resetpassword/?token=${token}`,
        });
        return newUser.save();
      } else {
        throw new ForbiddenException('Credentials taken');
      }
    } catch (e) {
      //console.log(e,'err in createPowerUser')
      return e.response;
    }
  }

  async createUser(user: User): Promise<User> {
    try {
      const UserExist = await this.userModel.findOne({ email: user.email });
      if (UserExist == null) {
        const newUser = new this.userModel(user);
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(user.password, salt);
        const payload = { email: user.email };
        const token = Jwt.sign(payload, 'super-secret-jwt');
        newUser.accessToken = token;
         await this.mailService.sendMail({
          to: user.email,
          from: 'rick96898@gmail.com',
          subject: 'Token auth  ✔',
          text: `localhost:3000/user/resetpassword/?token=${token}`,
        });
        // return

        return newUser.save();
      } else {
        throw new ForbiddenException('Credentials taken');
      }
    } catch (e) {
      //console.log('err in create user');
      return e.response;
    }
  }

  async createComplaint(complaint: Complaint): Promise<Complaint> {
    try {
      const newComplaint = new this.complaintModel(complaint);
      return newComplaint.save();
    } catch (e) {
      //console.log('err in create complaint');
      return e.response;
    }
  }

  async viewComplaint(comp: any): Promise<Complaint> {
    try {
      const complaint = await this.complaintModel.findOne({ _id: comp.id });
     // console.log(complaint,'ddd')
      if(complaint.createdBy == comp.user.id){
        console.log('true')
        return complaint;
      }else{
        throw new ForbiddenException('Unauthorized');
      }
    } catch (e) {
      //console.log('err in view complaint');
      return e.response;
    }
  }

  async deleteComplaint(comp: any): Promise<Complaint> {
    try {
      const complaint = await this.complaintModel.findOne({ _id: comp.id });
      if(complaint.createdBy == comp.user.id){
      await this.complaintModel.findOneAndDelete({
        _id: comp.id,
      });
    }else{
      throw new ForbiddenException('Unauthorized');
    }
    } catch (e) {
      //console.log('err in delete complaint');
      return e.response;
    }
  }

  async allComplaint(user:any):Promise<any> {
    try {
      const power_user = await this.support_deskModel.findOne({email:user.email})
      const support_desk = await this.Power_userModel.findOne({email:user.email})
      if(power_user == null && support_desk == null){
        return {status:'Unauthorized'}
      }else{ 
        const complaint = await this.complaintModel.find({});
        return complaint;
      }
    } catch (e) {
      //console.log('err in delete complaint');
      return e.response;
    }
  }

  async createSupportdesk(support_desk: Support_desk): Promise<Support_desk> {
    try {
      const newUser = new this.support_deskModel(support_desk);
      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(support_desk.password, salt);
      return newUser.save();
    } catch (e) {
      //console.log('err in create Supportdesk');
      return e.response;
    }
  }

  async user_login(user: User): Promise<User> {
    try {
      const User = await this.userModel.findOne({ email: user.email });
      //console.log(User,'user')
      let validPassword = await bcrypt.compare(
        user.password,
        User.password,
      );
      if (validPassword) {
        //return User;
        var tok = await this.signToken(user.email,User.id)
        //console.log(tok.accessToken,'userlogin')
        return this.signToken(user.email,User.id)
      } else {
        throw new ForbiddenException('Credentials incorrect');
      }
    } catch (e) {
      //console.log(e,'err in admin login')
      return e.response;
    }
  }

  async poweruser_login(Power_user: Power_user): Promise<Power_user> {
    try {
      const User = await this.Power_userModel.findOne({ email: Power_user.email });
      //console.log(User,'23user')
      let validPassword = await bcrypt.compare(
        Power_user.password,
        User.password,
      );
      if (validPassword) {
        //return User;
        var tok = await this.signToken(Power_user.email,User.id)
        //console.log(tok.accessToken,'Poweruserlogin')
        return this.signToken(Power_user.email,User.id)
      } else {
        throw new ForbiddenException('Credentials incorrect');
      }
    } catch (e) {
      //console.log(e,'err in admin login')
      return e.response;
    }
  }

  async signToken(email:string,id:string):Promise<any>{
    const payload = {
      email,
      id
    }
     const token = await this.jwt.signAsync(payload,{
      expiresIn:'60m',
      secret:'super-duper-secret'
    })
    return{
      accessToken:token
    }
  }
}
