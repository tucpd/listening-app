# 🔧 Backend - Django REST API

Backend xử lý upload file audio, chuyển đổi định dạng, transcribe bằng OpenAI Whisper và trả về transcript với word-level timestamps.

## Cấu trúc

```
backend/
├── app_backend/          # Django project settings
│   ├── settings.py       # Cấu hình Django
│   ├── urls.py           # Root URL routing
│   └── wsgi.py           # WSGI entry point
├── audio_processor/      # Main app
│   ├── models.py         # Database models
│   ├── views.py          # API views
│   ├── serializers.py    # DRF serializers
│   ├── urls.py           # App URL routing
│   └── utils.py          # Helper functions
├── media/                # File storage
│   ├── audio/            # Uploaded audio files
│   └── transcripts/      # Generated transcripts
├── manage.py
└── requirements.txt
```

## 🔧 Yêu cầu hệ thống

- Python 3.11+
- FFmpeg (required for Whisper)
  - Ubuntu: `sudo apt install ffmpeg`
  - macOS: `brew install ffmpeg`
  - Windows: https://ffmpeg.org/download.html

## Cài đặt

### 1. Tạo môi trường ảo

```bash
# Sử dụng Conda (khuyến nghị)
conda create -n lta-env python=3.11 -y
conda activate lta-env

# Hoặc sử dụng venv
python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows
```

### 2. Cài đặt dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Cấu hình environment

Tạo file `.env` trong thư mục `backend/`:

```env
DJANGO_SECRET_KEY=your-secret-key-here
DEBUG=True
```

### 4. Chạy migrations

```bash
python manage.py migrate
```

### 5. Chạy development server

```bash
python manage.py runserver
```

Server chạy tại: http://localhost:8000

## 📡 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/upload/` | Upload audio file |
| GET | `/api/transcript/<id>/` | Lấy transcript |
| GET | `/media/audio/<filename>` | Stream audio file |

## ⚙️ Cấu hình Django (settings.py)

### Các thư viện cần import:

```python
import os
from dotenv import load_dotenv

load_dotenv()
```

### SECRET_KEY:

```python
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-default-key')
```

### ALLOWED_HOSTS & CORS:

```python
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
```

### INSTALLED_APPS:

```python
INSTALLED_APPS = [
    # ... default apps
    'rest_framework',
    'corsheaders',
    'audio_processor',
]
```

### MIDDLEWARE:

```python
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Đặt đầu tiên
    # ... other middleware
]
```

### Media & Static files:

```python
STATIC_URL = 'static/'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'
```

### REST Framework:

```python
REST_FRAMEWORK = {
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ]
}
```

## Testing

```bash
python manage.py test
```
