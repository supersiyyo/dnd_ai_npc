type RealtimeSession = {
  client_secret: {
    value: string;
  };
};

export async function initRealtimeWebRTC(
  onRemoteAudio: (stream: MediaStream) => void,
  onDataEvent: (event: any) => void
) {
  // 1. Create session from your API
  const res = await fetch("/api/realtime/session", { method: "POST" });
  const session: RealtimeSession = await res.json();
  const token = session.client_secret.value;

  // 2. Create peer connection
  const pc = new RTCPeerConnection();
  const dc = pc.createDataChannel("oai-events");

  // 3. Handle remote audio stream
  pc.ontrack = (event) => {
    const [stream] = event.streams;
    onRemoteAudio(stream);
  };

  // 4. Handle AI responses
  dc.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onDataEvent(data);
  };

  // 5. Get user mic input
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  // 6. Set local SDP
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);

  // 7. Send offer to OpenAI for SDP answer
  const sdpRes = await fetch("https://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/sdp",
    },
    body: offer.sdp,
  });

  const answerSdp = await sdpRes.text();
  await pc.setRemoteDescription({ type: "answer", sdp: answerSdp });

  // 8. Once connected, send initial session config
  dc.onopen = () => {
    dc.send(JSON.stringify({
      type: "session.update",
      session: {
        modalities: ["audio", "text"],
        voice: "alloy"
      }
    }));
  };

  return { pc, dc };
}
