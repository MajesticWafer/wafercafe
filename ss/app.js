let peerConnection;
const config = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] // Public STUN server for ICE candidates
};

const shareScreenButton = document.getElementById('shareScreen');
const remoteVideo = document.getElementById('remoteVideo');

// Get user screen and stream it to the peer
shareScreenButton.onclick = async () => {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: true,
    audio: false
  });
  
  // Initialize WebRTC peer connection
  peerConnection = new RTCPeerConnection(config);
  
  // Add the screen stream to the peer connection
  stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

  // Send offer to the peer (receiver)
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);

  // Simulate signaling process (you'll need to replace this with WebSocket or another signaling method)
  simulateSignaling(peerConnection.localDescription, false);
  
  // Display the local screen stream in the video element (optional)
  remoteVideo.srcObject = stream;

  // Handle ICE candidates
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      simulateSignaling(event.candidate, true);
    }
  };
};

// Function to simulate signaling between sender and receiver
function simulateSignaling(data, isCandidate) {
  if (!isCandidate) {
    // Simulate receiving the offer and creating an answer on the receiver side
    receiveOffer(data);
  }
}

async function receiveOffer(offer) {
  peerConnection = new RTCPeerConnection(config);
  
  peerConnection.ontrack = event => {
    // Display the received screen on the receiver's video element
    remoteVideo.srcObject = event.streams[0];
  };

  await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

  // Create and send an answer back to the sender
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  simulateSignaling(peerConnection.localDescription, false);
}
