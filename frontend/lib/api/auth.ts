//backend api call only
import axios from "./axios";//import axios instance -> important
import { API } from "./endpoints";  

//registerData: any-> can be schema object
export const registerUser = async(registerData: any) => {
    try{
        const response = await axios.post(
            API.AUTH.REGISTER,  //backend route path
            registerData  //data to be sent to backend(req.body)
        );
        return response.data;  //response ko body
        //what is returned from backend-controller
    }catch(err: Error | any){
        //if 4xx or 5xx as error
        throw new Error
        (
            err.response?.data?.message  //from backend
            || err.message   //general error msg
            ||"Registration failed"   //fallback msg
        );
    }
}

export const loginUser = async(loginData: any) => {
    try{
        const response = await axios.post(
            API.AUTH.LOGIN,  //backend route path
            loginData  //data to be sent to backend(req.body)
        );
        return response.data;  //response ko body
        //what is returned from backend-controller
    }catch(err: Error | any){
        //if 4xx or 5xx as error
        throw new Error
        (
            err.response?.data?.message  //from backend
            || err.message   //general error msg
            ||"Login failed"   //fallback msg
        );
    }
}