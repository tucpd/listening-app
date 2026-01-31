# English Listening Practice App

Ứng dụng luyện nghe tiếng Anh với tính năng upload audio, tự động tạo transcript và hiển thị word-level timestamps.

## Cấu trúc Project

```
listening_app/
├── backend/          # Django REST API
│   ├── app_backend/  # Django settings
│   ├── audio_processor/  # App xử lý audio & transcription
│   └── media/        # Lưu trữ file audio & transcripts
├── frontend/         # Next.js Web App
│   └── src/
│       ├── app/          # Pages & layouts
│       ├── components/   # React components
│       ├── services/     # API services
│       ├── types/        # TypeScript types
│       └── utils/        # Helper functions
└── README.md
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | Django 5, Django REST Framework |
| AI/ML | OpenAI Whisper (Speech-to-Text) |
| Database | SQLite (dev) / PostgreSQL (prod) |

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- FFmpeg (required for Whisper)
- Conda (recommended) hoặc virtualenv

### 1. Clone & Setup

```bash
git clone <repository-url>
cd listening_app
```

### 2. Backend Setup

```bash
# Tạo môi trường
conda create -n lta-env python=3.11 -y
conda activate lta-env

# Cài đặt dependencies
cd backend
pip install -r requirements.txt

# Chạy migrations
python manage.py migrate

# Chạy server
python manage.py runserver
```

Backend chạy tại: http://localhost:8000

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend chạy tại: http://localhost:3000

## Documentation

- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## Environment Variables

### Backend (.env)
```env
DJANGO_SECRET_KEY=your-secret-key
DEBUG=True
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## License

MIT License
