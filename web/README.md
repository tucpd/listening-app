# Frontend - Next.js Web App

Giao diện người dùng cho ứng dụng luyện nghe tiếng Anh, được xây dựng với Next.js 14 và TypeScript.

## Cấu trúc

```
frontend/
├── src/
│   ├── app/                  # App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   ├── AudioPlayer.tsx   # Audio player với controls
│   │   ├── FileUploadSection.tsx  # Upload component
│   │   └── TranscriptPanel.tsx    # Hiển thị transcript
│   ├── services/             # API services
│   │   └── audioService.ts   # Audio API calls
│   ├── types/                # TypeScript types
│   │   └── audio.ts          # Audio-related types
│   └── utils/                # Utilities
│       └── helpers.ts        # Helper functions
├── public/                   # Static assets
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── eslint.config.mjs
```

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Linting:** ESLint

## Cài đặt

### 1. Cài đặt dependencies

```bash
cd frontend
npm install
```

### 2. Cấu hình environment

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Chạy development server

```bash
npm run dev
```

App chạy tại: http://localhost:3000

## Scripts

| Command | Mô tả |
|---------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm run start` | Chạy production server |
| `npm run lint` | Kiểm tra linting |

## Components

### AudioPlayer
Audio player với các tính năng:
- Play/Pause controls
- Progress bar
- Volume control
- Playback speed

### FileUploadSection
- Drag & drop upload
- File validation
- Upload progress

### TranscriptPanel
- Hiển thị transcript với timestamps
- Word highlighting sync với audio
- Click để jump đến vị trí

## Styling

Project sử dụng Tailwind CSS với cấu hình mặc định. Global styles được định nghĩa trong `src/app/globals.css`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
