import jwt from 'jsonwebtoken';
import {JWT_SECRET} from '../config';
import {Request, Response, NextFunction} from 'express';
import {HttpError} from '../errors/http-error';
import {UserRepository} from '../repositories/user.repository';
import { IUser } from '../models/user.model';

//global augmentation for Express Request to include user property
declare global{
    namespace Express{
        interface Request {
            user? : Record<string, any> | IUser;
        }
    }
}
let userRepository = new UserRepository();

export const authorizedMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        console.log(authHeader)
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            throw new HttpError(401, "Unauthorized, Header malformed");
        }
        const token = authHeader.split(" ")[1]; //"Bearer <string>" [1] -> <string>
        if(!token){
            throw new HttpError(401, "Unauthorized, Token missing");
        }
        const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>; //verify with secret
        if(!decodedToken || !decodedToken.id){
            throw new HttpError(401, "Unauthorized, Token invalid");
        }
        const user = await userRepository.getUserById(decodedToken.id);
        if(!user){
            throw new HttpError(401, "Unauthorized, User not found");
        }
        //attach user to request object
        req.user = user;  
        next();
    }catch(error: Error | any){
        return res.status(401).json({success: false, message: error.message || "Unauthorized"});
    }

}

//any function after authorizedMiddleware can access req.user
export const adminOnlyMiddleware = (req: Request, res: Response, next: NextFunction) => {
        try{
            if(req.user && req.user.role === 'admin'){
                next();
            }else{
                throw new HttpError(403, "Forbidden, Admins only");
            }
        }catch(error: Error | any){
            return res.status(error.statusCode || 403).json(
                {success: false, message: error.message || "Forbidden"}
        );
    }
}