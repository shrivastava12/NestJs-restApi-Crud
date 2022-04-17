import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {

    constructor(private readonly userService:UsersService,
        private readonly jwtService:JwtService){}

    async validateUser(username:string,pass:string){
        const user = await this.userService.findOneByEmail(username);
        console.log('user',user)
        if(!user){
            return null;
        }

        const match = await this.comparePassword(pass,user.password);
        if(!match){
            return null;
        }
        const { password, ...result } = user['dataValues'];
        return result;
    }

    public async login(user){
        const token =  await this.generateToken(user);
        return {user,token}
    }

    public async create(user){
        const pass = await this.hashPassword(user.password);

        const newUser =  await this.userService.create({...user,password:pass});

        const {password,...result} =  newUser['dataValues'];

        const token =  await this.generateToken(result);
        return {user:result, token};

    }
    private async comparePassword(oldPass,dbPass){
        const match = await bcrypt.compare(oldPass,dbPass);
        return match;
    }

    private async generateToken(user){
        const token = await this.jwtService.signAsync(user);
        return token;
    }

    private async hashPassword(password){
        const hash =  await bcrypt.hash(password,10);
        return hash;
    }
}
