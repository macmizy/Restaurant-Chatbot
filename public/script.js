const socket = io("http://localhost:3000")

const chatBody = document.querySelector(".chat-body")
const inputField = document.querySelector(".input-field")
const sendBtn = document.querySelector(".send-button")
const form = document.querySelector("form")



socket.on("chat-message", data =>{
    console.log(data)
})

socket.on("bot-message", message=>{
    displayBotMessage(message)
})


function displayUserMessage(message){
    const div = document.createElement("div")
    div.textContent = message
    div.classList.add("user-message")

    const timestamp = new Date().toLocaleTimeString();
    const timestampElement = document.createElement('span');
    timestampElement.classList.add('timestamp');
    timestampElement.textContent = timestamp;
    div.append(timestampElement)
    chatBody.append(div)
    chatBody.scrollTop = chatBody.scrollHeight
}

function displayBotMessage(message){
    const div = document.createElement("div")
    div.textContent = message
    div.classList.add("bot-message")

    const timestamp = new Date().toLocaleTimeString();
    const timestampElement = document.createElement('span');
    timestampElement.classList.add('timestamp');
    timestampElement.textContent = timestamp;
    div.append(timestampElement)
    chatBody.append(div)
    chatBody.scrollTop = chatBody.scrollHeight
}

function sendMessage(){
    const message = inputField.value
    if (message == "") return

    displayUserMessage(message)
    socket.emit("user-message", message)
    inputField.value =""
}


form.addEventListener("submit", e=>{
    e.preventDefault()
    sendMessage()
})

sendBtn.addEventListener("click", sendMessage)

