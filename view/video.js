const ipc = require('electron').ipcRenderer;

const io = require('socket.io-client');
var socket = io("http://localhost:3000");

//Globle variables

// ipc.on('invite', function(event, bundle){
//     connectToNewUser(bundle.receiver, stream)
//     console.log("Invite")
// });
//
// ipc.on('feedback', function(event, bundle){
//     connectToNewUser(bundle.caller, stream)
//     console.log("Feedback")
// });


ipc.on('test', function(event, stuff){
    $('#test').html(stuff);
    console.log(stuff)
});


const videoGrid = document.getElementById('video-grid')
const myPeer = new Peer(undefined, {
    host: '/',
    port: '3001'
})

const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream)

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on('user-connected', userId => {
        console.log("COnnected inside")
        connectToNewUser(userId, stream)
    })
})


// socket.on('user-disconnected', userId => {
//     if (peers[userId]) peers[userId].close()
// })


    myPeer.on('open', id => {
        console.log('in open')
        ipc.send('join-room', id);
        socket.emit('join-room', id)
    })




//--------------------------------------------------------------------------------


function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
}

function addVideoStream(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}
