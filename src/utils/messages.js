const generateMessage=(username,text)=>{
    return{
        username,
        text,
        createdApp:new Date().getTime()
    }
}

const generateLocation=(username,url)=>{
    return{
        username,
        url,
        createdApp:new Date().getTime()
    }
}
module.exports={
    generateMessage,
    generateLocation
}