const socket= io()
const chess= new Chess()
const board= document.querySelector('.board')

let draggedpiece= null
let sourcecell= null
let playerrole= null

const renderBoard= function(){
    const Board= chess.board()
    board.innerHTML=''

    Board.forEach(function(row,rowindex){
        row.forEach(function(col,colindex){
            const currcell= col
            console.log('currrCell: ',currcell)
            const newcell= document.createElement('div')
            newcell.classList.add('cell',(rowindex+colindex)%2==0?'light':'dark')

            newcell.dataset.row=rowindex
            newcell.dataset.col=colindex

            if(currcell){
                const newpiece= document.createElement('div')
                newpiece.classList.add('piece',currcell.color==='w'?'white':'black')
                newpiece.innerText=getPieceUnicode(currcell)
                
                newpiece.style.fontSize= '40px'
                newpiece.style.textAlign= 'center'
                newpiece.draggable= playerrole===currcell.color

                newpiece.addEventListener('dragstart',function(e){
                    if(newpiece.draggable){
                        draggedpiece= newpiece
                        sourcecell= {row:rowindex,col:colindex}
                        e.dataTransfer.setData('text/plain','')
                    }
                })

                newpiece.addEventListener('dragend',function(){
                    draggedpiece= null
                    sourcecell= null
                })
                newcell.appendChild(newpiece)
            }
            newcell.addEventListener('dragover',function(e){
                e.preventDefault()
            })

            newcell.addEventListener('drop',function(e){
                e.preventDefault()
                if(draggedpiece){
                    const targetsource= {
                        row:parseInt(newcell.dataset.row),
                        col:parseInt(newcell.dataset.col)
                    }

                    handleMove(sourcecell,targetsource)
                }
            })
            board.appendChild(newcell)
        })
    })
}

const handleMove= function(source,target){
    const move= {
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }
    socket.emit('move',move)
}

const getPieceUnicode= function(piece){
    const getpieceunicodes= {
        p:'♟',
        r:'♜',
        n:'♞',
        b:'♝',
        q:'♛',
        k:'♚',
        P:'♙',
        R:'♖',
        N:'♘',
        B:'♗',
        Q:'♕',
        K:'♔'
    }
    if(piece.color === 'b') return getpieceunicodes[piece.type] || ''
    else{
        let val1 = piece.type[0].charCodeAt(0);
        val1= val1-32;
        let newChar = String.fromCharCode(val1);
        return getpieceunicodes[newChar] || ''
    }
}

socket.on('playerrole',function(role){
    playerrole=role
    renderBoard()
})

socket.on('spectatorrole',function(){
    playerrole= null
    renderBoard()
})

socket.on('boardstate',function(fen){
   chess.load(fen)
   renderBoard()
})

socket.on('move',function(move){
    chess.move(move)
    renderBoard()
})

renderBoard()

