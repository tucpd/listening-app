from django.urls import path
from .views import TranscribeAudioView, HealthCheckView, TestTranscriptionView

app_name = 'audio_processor'

urlpatterns = [
    # Main transcription endpoint
    path('transcribe/', TranscribeAudioView.as_view(), name='transcribe'),
    
    # Health check
    path('health/', HealthCheckView.as_view(), name='health'),
    
    # Test endpoint (mock data)
    path('test-transcribe/', TestTranscriptionView.as_view(), name='test-transcribe'),
]