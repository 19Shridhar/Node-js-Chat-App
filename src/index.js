const express=require('express')
const http=require('http')
const path= require('path')
const socketio=require('socket.io')
const Filter=require('bad-words')
const {generateMessage,generateLocation}=require('./utils/messages')
const { addUser,removeUser,getUser,getUserinRoom}=require('./utils/users')

const app=express()
const server=http.createServer(app)
const io=socketio(server)

const port=process.env.PORT || 3000
const pathPublicDirectory =path.join(__dirname,'../public')

app.use(express.static(pathPublicDirectory))

let count=0
const message='Welcome'

io.on('connection',(socket)=>{
    console.log('New io connection ')

    socket.on('join',({username,room},callback)=>{
        const {error,user}=addUser({id:socket.id,username,room})

        if (error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('newMessage',generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('newMessage',generateMessage('Admin',user.username+' has joined'))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUserinRoom(user.room)
        })
        callback()
    })

    socket.on('message',(message,callback)=>{

        const user=getUser(socket.id)
        const filter= new Filter()

        if(filter.isProfane(message)){

            return callback('Bad-words not allowed!')

        }
        io.to(user.room).emit('newMessage',generateMessage(user.username,message))
        callback()

    })

    socket.on('sendLocation',(location,callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('userLocation',generateLocation(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`) )
        callback()
    })

    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)

        if(user){
            io.to(user.room).emit('newMessage',generateMessage(user.username+' has left'));
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUserinRoom(user.room)
            })      
        }
        
        
    })
})


server.listen(3000, () => {
    console.log(`Server is up on port ${port}.`)
   }) 
