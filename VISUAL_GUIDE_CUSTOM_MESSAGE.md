# 📊 Visual Guide - Custom Message Feature

## 🖼️ UI Flow Diagrams

### Mobile PWA Flow

```
┌─────────────────────────────────────────────┐
│     📱 Daily Attendance Page                │
│                                             │
│  [Date Selector]                            │
│  [Department Filter]                        │
│  [Mark All Present] [Mark Dept Present]    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ Employee List                      │    │
│  │ ✓ Present  ✗ Absent               │    │
│  │ ...                                │    │
│  └────────────────────────────────────┘    │
│                                             │
│  ┌────────────────────────────────────┐    │
│  │ [📝 Share Custom Message]  <--NEW!│    │
│  └────────────────────────────────────┘    │
│         ↓ (Click to expand)                 │
│  ┌────────────────────────────────────┐    │
│  │ Message Box                        │    │
│  │ ┌────────────────────────────────┐ │    │
│  │ │ Type your message here...     │ │    │
│  │ │                                │ │    │
│  │ │                                │ │    │
│  │ └────────────────────────────────┘ │    │
│  │ [🚀 Send Message]                 │    │
│  └────────────────────────────────────┘    │
│                                             │
│  [💾 Save Attendance] (Fixed bottom)       │
└─────────────────────────────────────────────┘
```

### Desktop App Flow

```
┌──────────────────────────────────────────────────────┐
│  [Sidebar]  │  💻 Attendance Page                    │
│             │                                        │
│  Dashboard  │  [Date] [Dept] [Mark All] [Save]     │
│  Employees  │                                        │
│  Attendance │  ┌──────────────────────────────┐    │
│  Working D. │  │ Salesman (10 employees)       │    │
│  Salary     │  │ [ Employee cards... ]         │    │
│  Reports    │  └──────────────────────────────┘    │
│  Settings   │                                        │
│             │  ┌──────────────────────────────┐    │
│             │  │ Mechanic (8 employees)        │    │
│             │  │ [ Employee cards... ]         │    │
│             │  └──────────────────────────────┘    │
│             │                                        │
│             │  ┌────────────────────────────────────┐
│             │  │ 📝 Share Custom Message [Show/Hide]│
│             │  │ ─────────────────────────────────  │
│             │  │ Type your message:                 │
│             │  │ ┌────────────────────────────────┐│
│             │  │ │                                ││
│             │  │ │ Message text area...           ││
│             │  │ │                                ││
│             │  │ └────────────────────────────────┘│
│             │  │ [🚀 Send Message]                 │
│             │  └────────────────────────────────────┘
└──────────────────────────────────────────────────────┘
```

---

## 🔄 User Interaction Flow

### Scenario 1: Mobile Share (WhatsApp)

```
User on Mobile/Tablet
       ↓
Opens Daily Attendance
       ↓
Scrolls past employee list
       ↓
Sees blue button "Share Custom Message"
       ↓
Taps button
       ↓
Message box expands with textarea
       ↓
Types: "Good morning! All present today ✓"
       ↓
Taps green "Send Message" button
       ↓
📱 Native Share Sheet Opens
       ↓
┌─────────────────────────────┐
│  Share via:                 │
│  ─────────────────────────  │
│  📱 WhatsApp                │
│  💬 Messages                │
│  📧 Email                   │
│  📋 Copy                    │
│  ...                        │
└─────────────────────────────┘
       ↓
User selects "WhatsApp"
       ↓
WhatsApp opens with message
       ↓
User selects contacts manually
       ↓
Sends! ✅
```

### Scenario 2: Desktop Copy-Paste

```
User on Desktop
       ↓
Opens Attendance page
       ↓
Scrolls to bottom
       ↓
Finds "Share Custom Message" card
       ↓
Clicks "Show" to expand
       ↓
Types message in text area
       ↓
Clicks "Send Message" button
       ↓
💾 Message copied to clipboard
       ↓
✅ Success notification appears
       ↓
User opens WhatsApp Web
       ↓
Pastes message (Ctrl+V)
       ↓
Selects contacts
       ↓
Sends! ✅
```

---

## 🎨 Visual States

### State 1: Hidden (Default)

```
┌────────────────────────────────────┐
│ Employee List                      │
│ [ Attendance cards... ]            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ [📝 Share Custom Message]          │ ← Click to expand
└────────────────────────────────────┘

[💾 Save Attendance]
```

### State 2: Expanded (Active)

```
┌────────────────────────────────────┐
│ Employee List                      │
│ [ Attendance cards... ]            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│ [🔽 Hide Message Box]              │ ← Click to collapse
│ ──────────────────────────────────  │
│ Message Box:                       │
│ ┌────────────────────────────────┐ │
│ │ Type your message here...     │ │
│ │ [Cursor blinking]              │ │
│ │                                │ │
│ └────────────────────────────────┘ │
│ 💡 Click send to share via apps   │
│ [🚀 Send Message]                  │
└────────────────────────────────────┘

[💾 Save Attendance]
```

### State 3: With Message (Ready)

```
┌────────────────────────────────────┐
│ [🔽 Hide Message Box]              │
│ ──────────────────────────────────  │
│ Message Box:                       │
│ ┌────────────────────────────────┐ │
│ │ Good morning team!            │ │
│ │ Attendance marked for today.  │ │
│ │ All employees present.        │ │
│ └────────────────────────────────┘ │
│ 💡 Click send to share via apps   │
│ [🚀 Send Message] ← Enabled       │
└────────────────────────────────────┘
```

### State 4: Empty (Disabled)

```
┌────────────────────────────────────┐
│ [🔽 Hide Message Box]              │
│ ──────────────────────────────────  │
│ Message Box:                       │
│ ┌────────────────────────────────┐ │
│ │ [Empty]                        │ │
│ │                                │ │
│ │                                │ │
│ └────────────────────────────────┘ │
│ 💡 Click send to share via apps   │
│ [⚪ Send Message] ← Disabled       │
└────────────────────────────────────┘
```

---

## 📱 Platform-Specific Behavior

### Mobile (iOS/Android)

```
                Web Share API Available ✅
                         ↓
┌─────────────────────────────────────────────┐
│  Click "Send Message"                       │
│            ↓                                │
│  Native Share Sheet Opens                  │
│  ┌───────────────────────────────────┐    │
│  │  Share to:                        │    │
│  │  • WhatsApp                       │    │
│  │  • Facebook Messenger             │    │
│  │  • Telegram                       │    │
│  │  • SMS                            │    │
│  │  • Email                          │    │
│  │  • Instagram                      │    │
│  │  • Copy Link                      │    │
│  │  • More...                        │    │
│  └───────────────────────────────────┘    │
│            ↓                                │
│  User selects app                          │
│            ↓                                │
│  Selected app opens with message           │
│            ↓                                │
│  User manually selects recipients          │
│            ↓                                │
│  Sends! ✅                                  │
└─────────────────────────────────────────────┘
```

### Desktop (Windows/Linux)

```
           Web Share API NOT Available ❌
                    ↓
        Automatic Fallback to Clipboard
                    ↓
┌─────────────────────────────────────────────┐
│  Click "Send Message"                       │
│            ↓                                │
│  Message copied to clipboard                │
│            ↓                                │
│  ✅ Success Toast: "Copied to clipboard!"  │
│            ↓                                │
│  User opens WhatsApp Web / Telegram / etc. │
│            ↓                                │
│  Paste (Ctrl+V or Cmd+V)                   │
│            ↓                                │
│  Message appears in chat                   │
│            ↓                                │
│  User selects contacts                     │
│            ↓                                │
│  Sends! ✅                                  │
└─────────────────────────────────────────────┘
```

---

## 🎯 Component Structure

### Mobile PWA (`AttendanceMark.jsx`)

```jsx
<AttendanceMark>
  ├── Date Selector
  ├── Department Filter
  ├── Bulk Action Buttons
  │
  ├── Employee List (by department)
  │   ├── Salesman
  │   ├── Mechanic
  │   ├── Housekeeping
  │   └── Management
  │
  ├── 🆕 Custom Message Section
  │   ├── Toggle Button (show/hide)
  │   └── [When expanded]
  │       ├── Textarea (message input)
  │       ├── Help text
  │       └── Send Button
  │
  └── Fixed Save Button (bottom)
</AttendanceMark>
```

### Desktop App (`Attendance.jsx`)

```jsx
<Attendance>
  ├── Header (title + refresh)
  │
  ├── Controls Card
  │   ├── Date Selector
  │   ├── Department Filter
  │   ├── Mark All Button
  │   └── Save Button
  │
  ├── Department Sections
  │   ├── Salesman Cards
  │   ├── Mechanic Cards
  │   ├── Housekeeping Cards
  │   └── Management Cards
  │
  └── 🆕 Custom Message Card (bottom)
      ├── Header (title + show/hide toggle)
      └── [When expanded]
          ├── Label
          ├── Textarea (message input)
          ├── Help text
          └── Send Button
</Attendance>
```

---

## 🔄 State Flow Diagram

```
┌─────────────────┐
│  Initial Load   │
│ showMessageBox  │
│    = false      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐      Click "Share"
│  Message Box    │──────────────────→
│    Hidden       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Message Box    │
│    Visible      │
│ customMessage   │
│    = ""         │
└────────┬────────┘
         │
         ↓ User types
┌─────────────────┐
│  customMessage  │
│  has content    │
│  Send enabled   │
└────────┬────────┘
         │
         ↓ Click Send
┌─────────────────┐
│  Share/Copy     │
│  triggered      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Success!       │
│  Toast shown    │
│  (Message kept  │
│   in textarea)  │
└─────────────────┘
```

---

## 🎨 Color Coding

### Mobile PWA

| Element | Color | Purpose |
|---------|-------|---------|
| Toggle Button | Indigo (`bg-indigo-600`) | Show/hide message box |
| Send Button | Green (`bg-green-600`) | Action button (send) |
| Textarea Border | Gray (`border-gray-300`) | Input field |
| Help Text | Gray 500 | Guidance text |

### Desktop App

| Element | Color | Purpose |
|---------|-------|---------|
| Card | White (`bg-white`) | Container |
| Send Button | Blue (`btn-primary`) | Action button |
| Show/Hide Link | Blue 600 | Toggle link |
| Label | Gray 700 | Field label |

---

## 📐 Layout Dimensions

### Mobile

```
Full Width Container
├── Button: 100% width, py-3 (48px height)
├── Message Box Card:
│   ├── Padding: 16px
│   ├── Textarea: 100% width, 4 rows (~96px)
│   └── Send Button: 100% width, py-3
└── Spacing: 16px between elements
```

### Desktop

```
Card Container (max-width: 7xl)
├── Padding: 24px
├── Textarea: 100% width, 4 rows (~96px)
├── Buttons: Auto width with padding
└── Spacing: 12px between elements
```

---

## 🖱️ Interactive Elements

### Click Targets

```
Mobile (Touch):
├── Minimum: 44x44px (iOS guideline)
├── Implemented: 48px height (py-3)
└── ✅ All buttons meet accessibility standards

Desktop (Mouse):
├── Standard button heights
├── Hover states defined
└── ✅ Clear visual feedback
```

---

## 💡 Visual Feedback

### States

```
Default → Button normal appearance
Hover  → Button color darkens
Active → Button pressed appearance
Disabled → Opacity 50%, cursor not-allowed
Success → Green toast notification
Error → Red toast notification
```

---

## 📱 Responsive Behavior

```
Mobile (< 768px):
├── Full-width buttons
├── Touch-optimized sizing
├── Vertical stacking
└── Fixed bottom save button

Desktop (≥ 768px):
├── Card layout
├── Inline buttons
├── Hover effects
└── Cursor pointers
```

---

This visual guide helps understand the feature's UI/UX at a glance! 🎨
