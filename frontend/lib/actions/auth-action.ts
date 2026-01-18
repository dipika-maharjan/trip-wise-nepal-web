//server side processing
"use server";

import { registerUser, loginUser } from "../api/auth";
import { setAuthToken, setUserData } from "../cookie";

export const handleRegister = async(formData: any) => {
    try{
        //handle data from component form
        const result = await registerUser(formData);
        //handle how to send data back to component
        if(result.success){
            return{
                success: true,
                message: "Registration successful",
                data: result.data
            };
        }
        return{
            success: false,
            message: result.message || "Registration failed"
        };
    }catch(err: Error | any){
        return{
            success: false,
            message: err.message || "Registration failed"
        }
    }
}

export const handleLogin = async(formData: any) => {
    try{
        //handle data from component form
        const result = await loginUser(formData);
        //handle how to send data back to component
        if(result.success){
            await setAuthToken(result.token);  
            await setUserData(result.data); 
            return{
                success: true,
                message: "Login successful",
                data: result.data
            };
        }
        return{
            success: false,
            message: result.message || "Login failed"
        };
    }catch(err: Error | any){
        return{
            success: false,
            message: err.message || "Login failed"
        }
    }
}