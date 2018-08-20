


//test event transfer
//element.addEventListener(type,listener,useCapture);
document.addEventListener('click', event => {
    var name = event.target.id;
    if(name === 'send'){
        var obj = document.getElementById('client')
        obj.value = 'oK , has send'
    }
})
