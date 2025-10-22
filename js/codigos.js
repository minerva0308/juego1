let matriz = [  
['1','2','3'],
['4','5','6'],
['7','8','' ],
]
let board = document.querySelector('.bord');

drawtokens()
addEventListeners()

function drawtokens(){
    matrix. forEach(row => row.forEach(Element // va uno por uno 
     => {
        if(Element ==''){
          board.innerHTML += `<div class = 'empty'>$
        {element}</div>`
        }
      }else{
         board.innerHTML += `<div class = 'tokens'>$
        {element}</div>`
         }
     ))
    }
     function addEventListeners(){
      let tokens = document.querySelectorAll('.tokens')
      tokens.forEach(tokens => tokens.addEventListener
            ('clik',()=>{
   let actualPosition = searchPosition(tokens.innertext)
  let emptyPosition = searchPosition('')
  let movement = nextMovement(actualPosition,emptyPosition)
  updateMatrix(tokens.innertext,actualPosition,emptyPosition)

  if (movement !='noMove'){
    updateMatrix (tokens.innertext,actualPosition,emptyPosition)
  }
}))
    
 }
 function searchPosition(element){
    let rowIndex =0;
    let colunmIndex =0;
   matrix.forEach((row , index)=>{
   let rowElement = row.findIndex(item  => 
    item == element)
    if(rowElement !==-1){
    rowIndex = index;
    colunmIndex = rowElement;

    }
})
      [ returnindex , colunmIndex]
 }
 function nextMovement((actualPosition.emptyPosition)){

if (actualPosition [1] == emptyPosition [1] ){
if(actualPosition [0] - emptyPosition [0] ==-1){
   return'down'
}else if (actualPosition [0] - emptyPosition [0]==1){
   return'up'
    }else {
    return'noMover'
}
}elseif (actualPosition [0] == emptyPosition [0] ){
 if (actualPosition [1] - emptyPosition [1] ==-1){
   return'right'
}else if (actualPosition [1] - emptyPosition [1] == 1){
  return'left'
  }else {
    return'noMover'
  }
}else{
    return'noMover'
}
}

function updateMatrix(token.innertext,actualPosition,emptyPosition)