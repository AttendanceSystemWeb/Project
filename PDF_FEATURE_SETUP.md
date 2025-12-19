# PDF Download Feature Setup

## Install Required Package

The PDF download feature requires the `jspdf` and `jspdf-autotable` packages.

### Installation

Run this command in the frontend directory:

```powershell
cd "C:\Users\Christie\Desktop\Attendance System (Web)\frontend"
npm install jspdf jspdf-autotable
```

### Restart Frontend

After installation, restart your frontend development server:

```powershell
# Press Ctrl+C to stop the current server, then:
npm run dev
```

## Feature Description

The PDF download feature is now available in the **Admin → Attendance Records** page.

### What's Included in the PDF:

✅ **Header**
- SAMS branding
- Report title

✅ **Session Details**
- Class name
- Subject name
- Teacher name
- Date
- Lecture time (if recorded)
- Submission timestamp

✅ **Statistics Box**
- Total students
- Present count (green)
- Absent count (orange)
- Excused count (yellow)

✅ **Attendance Table**
- Student names
- Student IDs
- Status (color-coded)

✅ **Footer**
- Page numbers
- Generation timestamp

### File Naming

PDF files are automatically named:
```
Attendance_[ClassName]_[SubjectName]_[Date].pdf
```

Example: `Attendance_Stage_1_Introduction_to_Computer_Science_2025-12-17.pdf`

## Usage

1. Go to **Admin → Attendance Records**
2. Find the session you want to download
3. Click the **"📥 Download PDF"** button
4. PDF will download automatically

## Features

- Professional formatting
- Color-coded status indicators
- Clean, academic design
- Print-ready format
- Brand colors (#2F6497 primary, #F7931E accent)

Done! 🎉

