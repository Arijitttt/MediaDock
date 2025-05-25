import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

import { errorHandler } from './middlewares/error.middlewares.js'

const app =express()
app.use(
    cors({
        origin:process.env.CORS_ORIGIN,
        credentials:true
    })
)

//common middlewear
app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:true,limit:'16kb'}))
app.use(express.static('./public'))
app.use(cookieParser())


//import routes
import healthcheckRouter from './routes/healthcheck.routes.js'
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import subscribeRouter from './routes/subscription.routes.js'
import likeRouter from './routes/like.routes.js'
import commentRouter from './routes/comment.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import tweetRouter from './routes/tweet.routes.js'

//routes
app.use('/api/v1/healthcheck',healthcheckRouter)
app.use('/api/v1/user',userRouter)
app.use('/api/v1/video',videoRouter)
app.use('/api/v1/subscription',subscribeRouter)
app.use('/api/v1/like',likeRouter)
app.use('/api/v1/comment',commentRouter)
app.use('/api/v1/playlist',playlistRouter)
app.use('/api/v1/tweets',tweetRouter)

export {errorHandler}
export {app}