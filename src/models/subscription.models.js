import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type:Schema.Types.ObjectId, // one who is SUSCRIBING
        ref:'User'
    },
    channel:{
        type:Schema.Types.ObjectId, // one  to whom 'subscriber' is  SUBSCRIBING
        ref:'User'
    }
},
{timestamps:true})
export const Subscription = new mongoose.model('Subscription',subscriptionSchema)