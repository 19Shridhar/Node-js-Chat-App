const socket=io()

//Elements
const messageForm = document.querySelector('#message-form')
const messageForminput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const locationButton = document.querySelector("#send-location")
const messages = document.querySelector('#messages')


//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
    // New message element
    const newMessage = messages.lastElementChild;

    // Height of the message
    const newMessageStyles = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight+newMessageMargin;

    //visible Height
    const visibleHeight = messages.offsetHeight;
    
    //Height of message container

    const containerHeight = messages.scrollHeight;

    //how far i have scrolled
    const scrollOffeset = messages.scrollTop+visibleHeight;

    if(containerHeight-newMessageHeight<=scrollOffeset)
    {
        messages.scrollTop = messages.scrollHeight;
    }
}

socket.on('newMessage',(message)=>{
    console.log(message)
    const html=Mustache.render(messageTemplate,{
        username: message.username,
        message: message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeEnd',html)
    autoscroll()
})

socket.on('userLocation',(url)=>{
    console.log(url)
    const html=Mustache.render(locationTemplate,{
        username:url.username ,
        url: url.url,
        createdAt:moment(url.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeEnd',html)
})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML=html
})


messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()

    messageFormButton.setAttribute('disabled','disabled')
  

    const message=e.target.elements.message.value

    socket.emit('message',message,(error)=>
    {
        messageFormButton.removeAttribute('disabled')
        messageForminput.value=''
        messageForminput.focus()
        if (error){
            return console.log(error)
        }
        console.log('message was sent')
    })
})

locationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation not supported in ur browser')
    }

    locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            locationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href ='/'
    }
})