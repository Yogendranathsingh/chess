const express= require('express')
const app= express()
const socket= require('socket.io')
const server= require('http').createServer(app)
const io= socket(server)
const path= require('path')
const {Chess}= require('chess.js')
const chess= new Chess()

app.set('view engine','ejs')
app.use(express.static(path.join(__dirname,'public')))

app.get('/',function(req,res){
    res.render('index')
})

let players= {}
let currentplayer= "w"

io.on('connection',function(socket){
    console.log('connencted')

    if(!players.white){
        players.white= socket.id 
        socket.emit("playerrole","w")
    }
    else if(!players.black){
        players.black= socket.id 
        socket.emit("playerrole","b")
    }
    else{
        socket.emit("spectatorrole")
    }

    socket.on('disconnect',function(){
        // console.log('disconnected')

        if(socket.id === players.white) delete players.white
        else if(socket.id === players.black) delete players.black
    })

    // socket.on('move',function(move){
    //     try{
    //         if(chess.turn()==='w' && socket.id!==players.white) return
    //         if(chess.turn() === 'b' && socket.id!==players.black) return

    //         const result= chess.move(move)
    //         if(result){
    //             currentplayer=chess.turn()
    //             io.emit('move',move)
    //             io.emit('boardstate',chess.fen())
    //         }else{
    //             console.log('invalid move: ',n=move)
    //             socket.emit('invalidmove',move)
    //         }
    //     }catch(err){
    //             console.log(err)
    //             socket.emit('invalidmove',move)
    //     }
    // })

    socket.on('move', function(move) {
        try {
            if((chess.turn() === 'w' && socket.id !== players.white) || 
               (chess.turn() === 'b' && socket.id !== players.black)) return;
    
            const result = chess.move(move);
            if(result) {
                io.emit('move', move);
                io.emit('boardstate', chess.fen());
            } else {
                console.log('invalid move: ', move);
                socket.emit('invalidmove', move);
            }
        } catch(err) {
            console.log(err);
            socket.emit('invalidmove', move);
        }
    });
    
})


server.listen(3000,function(){
    console.log('server listening on port 3000...')
})