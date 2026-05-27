**HUB ENGINE V4 MOBILE INTEGRATION CODE FILES**

## **1. Agent Command API** (`/api/agent/content-agent.js`)

```javascript
import { ElevenLabsApi } from 'elevenlabs';
import { generateWan2Prompts } from '../video/wan2-generate';

export default async function handler(req, res) {
const { command, script, castMember, language = 'english' } = req.body;

try {
switch (command) {
case 'generate_video':
return await generateVideo(req, res);
case 'spanish_lesson':
return await generateSpanishVideo(req, res);
case 'check_status':
return await checkVideoStatus(req, res);
default:
return res.status(400).json({ error: 'Unknown command' });
}
} catch (error) {
return res.status(500).json({ error: error.message });
}
}

async function generateVideo(req, res) {
const { script, castMember, videoType } = req.body;

// Step 1: ElevenLabs Audio Generation
const elevenlabs = new ElevenLabsApi({
apiKey: process.env.ELEVENLABS_API_KEY
});

const voiceId = getVoiceId(castMember);
const audio = await elevenlabs.generate({
voice: voiceId,
text: script,
model_id: "eleven_turbo_v2"
});

// Step 2: Generate Wan2.2 Scene Prompts
const scenePrompts = await generateWan2Prompts(script, castMember);

// Step 3: Trigger Video Pipeline
const workflowId = await triggerVideoWorkflow({
audioUrl: audio.url,
scenePrompts,
castMember,
videoType
});

return res.json({
success: true,
workflowId,
status: 'generating',
estimatedTime: '3-5 minutes'
});
}

function getVoiceId(castMember) {
const voices = {
'lisa': process.env.LISA_VOICE_ID,
'susan': process.env.SUSAN_VOICE_ID,
'paul': process.env.PAUL_VOICE_ID,
'alisha': process.env.ALISHA_VOICE_ID,
'becky_host': process.env.BECKY_HOST_VOICE_ID,
'becky_guest': process.env.BECKY_GUEST_VOICE_ID
};
return voices[castMember.toLowerCase()];
}
```

## **2. Mobile Interface** (`/pages/mobile.js`)

```javascript
import { useState, useEffect } from 'react';
import { MobileControls } from '../components/MobileControls';
import { AgentChat } from '../components/AgentChat';
import { VideoPlayer } from '../components/VideoPlayer';

export default function MobileHub() {
const [agentStatus, setAgentStatus] = useState('ready');
const [currentVideo, setCurrentVideo] = useState(null);
const [workflowQueue, setWorkflowQueue] = useState([]);

return (


Hub Engine v4


{agentStatus}



onCommand={handleAgentCommand}
status={agentStatus}
/>

{currentVideo && (
video={currentVideo}
onApprove={publishVideo}
onReject={regenerateVideo}
/>
)}

onQuickCommand={handleQuickCommand}
workflowQueue={workflowQueue}
/>

Ask your agent...

⚙️ Add your Claude API key in Settings to enable chat

Dashboard

