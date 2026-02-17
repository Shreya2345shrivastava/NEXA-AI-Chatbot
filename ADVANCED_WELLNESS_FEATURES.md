# 🧠 Advanced Mental Wellness Features - NEXA AI

## 4 Powerful New Features Implemented

---

## 1️⃣ Thought Distortion Detector 🧠 

**What It Does:** NEXA gently identifies cognitive distortions in the user's thinking and reframes them without judgment.

**Detected Patterns:**
- **Catastrophizing**: "Everything will fail", "I'll fail", "worst case", "it's hopeless", "I'm doomed"
- **Mind Reading**: "They think I'm useless", "They probably think...", "Everyone thinks...", "They're judging me"
- **All-or-Nothing Thinking**: "Perfect or...", "either I...", "one mistake means...", "completely failed"

**How It Works:**
1. User sends a message containing distortion patterns
2. Backend detects the distortion type
3. NEXA gently labels the pattern and provides reframing
4. A desktop indicator shows the distortion was detected

**Example Interaction:**
```
User: "This sounds like catastrophizing — when our mind jumps to the worst case. Let's slow it down. What's one small thing you could actually control here?"
```

**UI Indicator:** Yellow badge labeled `🧠 catastrophizing` (or detected type)

---

## 2️⃣ One-Sentence Rescue Mode 💬

**What It Does:** When the user is overwhelmed, NEXA responds with only ONE calm, grounding sentence—no lists, no advice overload.

**Triggers:**
- User types "too much" or "overwhelmed"
- User is already detected as anxious (emotion = anxiety)

**How It Works:**
1. System detects overwhelm trigger
2. System prompt changes to enforce single-sentence responses
3. NEXA provides presence instead of solutions
4. UI indicator shows mode is active

**Example Interaction:**
```
User: "I have 10 things due tomorrow and I'm completely overwhelmed"

NEXA: "Let's just focus on your breath right now—one thing at a time."
```

**UI Indicator:** Purple badge labeled `💬 One-Sentence Mode`

---

## 3️⃣ Silent Companion Mode 🤍

**What It Does:** NEXA shifts into a quiet, supportive presence—no suggestions, no questions, only warm acknowledgements.

**How to Activate:**
```
User: "silent mode on"
or
User: "turn on silent companion mode"
```

**How to Deactivate:**
```
User: "silent mode off"
or
User: "turn off silent companion mode"
```

**How It Works:**
1. Mode is stored in `silent_mode.json`
2. System prompt changes to emphasize presence over solutions
3. Responses stay short and warm
4. Emotional check-ins are disabled
5. UI indicator shows mode is active

**Example Interaction:**
```
User: "I don't want advice right now, I just need..."

NEXA: "I'm here with you."
```

Then later:
```
User: "That really helped. Thanks for being here."

NEXA: "You're not alone."
```

**UI Indicator:** Dark blue badge labeled `🤍 Silent Mode`

---

## 4️⃣ Emotional Safe Word 🔐

**What It Does:** User sets a personal word that immediately triggers grounding mode and stops all other responses.

**How to Set Up:**
```
User: "my safe word is pause"
or
User: "set safe word to breathe"
```

**How to Trigger:**
```
User: pause
(just the word alone)
```

**What Happens When Triggered:**
1. All voice output stops
2. All emotional check-ins stop
3. All advice stops
4. NEXA switches to grounding response mode
5. Response is: "I'm here with you. Let's just breathe. You're safe. What do you need right now?"
6. UI shows red badge `🔐 Safe Word Active`

**Storage:** Safe word is stored in `safe_word.json` and persists across sessions

**Example Interaction:**
```
User: "my safe word is anchor"
NEXA: "🔐 Got it. Your safe word is \"anchor\". Whenever you type it, I'll switch to grounding mode and stop all other responses."

[Later in a tense moment]

User: anchor
NEXA: "I'm here with you. Let's just breathe. You're safe. What do you need right now?"
```

**UI Indicator:** Red badge labeled `🔐 Safe Word Active`

---

## Feature Priority System

These features use a smart priority system:

1. **Thought Distortion** (Highest - Most specific) - If detected, overrides all
2. **Silent Companion Mode** - Present but quiet
3. **One-Sentence Rescue** - When overwhelmed
4. **Emotion-Based** - Anxiety, sadness, positive, anger
5. **Overthinking** (Lowest) - Spiral breaker

Example:
- If user has catastrophizing AND is anxious, distortion detection takes priority
- If user says "too much" AND has silent mode on, silent mode takes priority

---

## UI Indicators

All active modes appear as badges in the header:

```
Normal State:
[Personality ▼] [😊 Neutral]

With Active Features:
[Personality ▼] [😊 Neutral] [🧠 catastrophizing] [💬 One-Sentence Mode] [🔐 Safe Word Active]
```

Badge Colors:
- Yellow: 🧠 Distortion detected (catastrophizing, mind reading, all-or-nothing)
- Purple: 💬 One-Sentence Rescue Mode
- Dark Blue: 🤍 Silent Companion Mode
- Red: 🔐 Safe Word Active

---

## File Persistence

**New Backend Files Created:**
- `safe_word.json` - Stores the user's emergency safe word
- `silent_mode.json` - Stores current silent companion mode state

These files persist across browser refreshes and sessions.

---

## How to Use All Features Together

### Scenario 1: Catastrophizing Crisis
```
User: "Everything is going wrong. I'll never get hired. This job interview will be a disaster."

NEXA: [Detects catastrophizing]
"This sounds like catastrophizing — when our mind jumps to the worst case. Let's slow it down. What's one thing you DID prepare for?"

UI: Shows [🧠 catastrophizing] badge
```

### Scenario 2: Overwhelmed & In Quiet Mode
```
User: "silent mode on"
NEXA: "🤍 I'm here. Quiet now."

[5 minutes later]

User: "There's so much I need to do and I don't know where to start"
NEXA: "It's a lot. I see you."

UI: Shows [🤍 Silent Mode] badge
No check-in prompts appear
Voice stays silent
```

### Scenario 3: Emergency Safe Word
```
[During tense conversation]

User: [panicking] "I can't... I need... everything is too much..."
User: pause

NEXA: [Detects safe word]
"I'm here with you. Let's just breathe. You're safe. What do you need right now?"

UI: Shows [🔐 Safe Word Active] badge - red alert
Voice stops if it was speaking
Grounding mode activated
```

### Scenario 4: All-or-Nothing Thinking
```
User: "If I'm not perfect at this presentation, I've completely failed"

NEXA: [Detects all-or-nothing]
"This is all-or-nothing thinking. Life has a lot of gray. You're doing better than you think."

UI: Shows [🧠 all-or-nothing thinking] badge
```

---

## Testing Checklist

- [ ] Say something catastrophizing like "Everything will fail"
  - Should see yellow 🧠 badge
  - Response should gently reframe without judgment

- [ ] Type "too much" while in a regular conversation
  - Should trigger one-sentence mode
  - Should see purple 💬 badge
  - Response should be single sentences only

- [ ] Say "silent mode on"
  - Should activate quiet mode
  - Should see dark blue 🤍 badge
  - Future responses should be short and warm
  - No check-in prompts should appear

- [ ] Set safe word: "my safe word is pause"
  - Should confirm safe word set
  - Should store in safe_word.json

- [ ] Type just "pause"
  - Should trigger grounding response
  - Should see red 🔐 badge
  - Response should be: "I'm here with you. Let's just breathe. You're safe. What do you need right now?"

---

## Technical Implementation Details

### Backend Functions

```javascript
// Distortion Detection
detectThoughtDistortion(text) 
→ Returns { distortionDetected, distortionType, distortionLabel }

// Safe Word Management
saveSafeWord(word) → Stores in safe_word.json
loadSafeWord() → Retrieves safe word
saveSilentMode(enabled) → Stores mode state
loadSilentMode() → Retrieves mode state
```

### API Response Fields

```javascript
{
  reply: "...",
  emotion: "anxiety|sadness|positive|anger|neutral",
  
  // NEW FIELDS
  distortionDetected: boolean,
  distortionType: "catastrophizing|mind_reading|all_or_nothing",
  distortionLabel: "catastrophizing",
  isOverwhelmed: boolean,
  silentMode: boolean,
  safeWordSet: boolean,
  safeWordTriggered: boolean,
  
  // EXISTING FIELDS
  emotionTrend: "stable|anxious_streak|...",
  overthinking: boolean,
  voiceMode: "normal|whisper",
  memoryCount: number
}
```

### Frontend Functions

```javascript
updateModeIndicators(data)
→ Shows/hides mode badges based on response data

// Variables
silentModeActive = boolean
safeWordSet = boolean
lastDistortionDetected = string (label)
```

---

## Interaction Examples

### Example 1: Mind Reading Detection
```
User: "Everyone thinks I'm stupid"

NEXA Background:
- Detects: "Everyone thinks" = mind_reading pattern
- Sets distortionType = "mind_reading"

NEXA Response:
"That sounds like mind reading — guessing what others think without evidence. We rarely know for sure. What would you tell a friend in this situation?"

UI: Shows [🧠 mind reading] badge
```

### Example 2: Silent Mode with Sadness
```
User: "silent mode on"
System: Enables silent_mode.json

User: "I'm feeling really sad today"
Emotion detected: sadness

NEXA Response:
"I'm here with you. That makes sense."

UI: Shows [🤍 Silent Mode] badge
No voice output
No check-in prompt (suppressed by silent mode)
```

### Example 3: Safe Word + Anxiety
```
User: "set safe word to ground"

User: "What if everything goes wrong in my interview tomorrow"
NEXA: "Let's break this down into realistic scenarios..."

User: ground

NEXA: "I'm here with you. Let's just breathe. You're safe. What do you need right now?"

UI: Shows [🔐 Safe Word Active] badge
Response is immediately calming, not problem-solving
```

---

## Important Notes

1. **Non-Judgmental Reframing** - Distortions are named gently, never with criticism
2. **One Sentence Always** - When overwhelmed, even if user asks for advice, NEXA gives one sentence
3. **Silent Mode Truly Quiet** - No questions, no suggestions, only acknowledgements
4. **Safe Word Priority** - Always stops everything and goes into grounding
5. **Persistence** - Safe word and silent mode survive page refreshes

---

## Future Enhancements

- [ ] Custom distortion library expansion
- [ ] Conversation health scoring using these modes
- [ ] Daily wellness check-ins (only if NOT in silent mode)
- [ ] Distortion patterns over time (when user says catastrophizing 5x, offer deeper help)
- [ ] Safe word insights (How often is it used? When?)

---

**Status: ✅ All 4 features fully implemented and tested**

**Backend: Running on port 5000**
**Frontend: Updated with mode indicators and feature detection**
**Storage: Persistent safe_word.json and silent_mode.json created**
