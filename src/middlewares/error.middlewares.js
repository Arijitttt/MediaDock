import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const errorHandler = (err, req, res, next) => {
    let error = err

    if (!(error instanceof ApiError)) {
        // error = new ApiError(500, err.message)
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 500 : 400

        const message = error.message 
        error = new ApiError(statusCode, message, error?.errors || [], err.stack)
    }

    const response = {
        ...error,
        message: error.message,
    //     statusCode: error.statusCode,
    //     success: false,
    //     data: error.data
        ...(process.env.NODE_ENV === 'development' ? { stack: error.stack }:{})
    }
    return res.status(error.statusCode).json(response)
        
    
}
export{errorHandler} 