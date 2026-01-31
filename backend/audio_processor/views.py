from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import JsonResponse
from django.conf import settings
from django.http import HttpResponse, Http404
from django.views import View
from .serializers import AudioUploadSerializer, TranscriptResponseSerializer
from .utils import process_audio_file
import traceback

class TranscribeAudioView(APIView):
    """
    API View để transcribe audio file
    
    POST /api/transcribe/
    - Upload audio file
    - Trả về transcript với word-level timestamps
    """
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self, request, *args, **kwargs):
        """
        Handle POST request để upload và transcribe audio
        """
        try:
            # Validate input
            serializer = AudioUploadSerializer(data=request.data)
            if not serializer.is_valid():
                return Response({
                    'success': False,
                    'errors': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Lấy audio file
            audio_file = serializer.validated_data['audio']
            
            print(f"Processing audio file: {audio_file.name}")
            
            # Process audio file
            transcript_data = process_audio_file(audio_file, save_transcript=True)
            
            # Tạo URL cho file audio (MP3 nếu đã convert)
            # from django.conf import settings
            # audio_filename = transcript_data.get('converted_filename', audio_file.name)
            # audio_url = f"{request.scheme}://{request.get_host()}/media/audio/{audio_filename}"
            
            # Chuẩn bị response
            response_data = {
                'success': True,
                'message': 'Audio transcribed successfully',
                'filename': audio_file.name,
                'audio_url': transcript_data.get('audio_url', ''),
                'text': transcript_data['text'],
                'words': transcript_data['words'],
                'language': transcript_data.get('language', 'en'),
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log error
            print(f"Error in TranscribeAudioView: {str(e)}")
            traceback.print_exc()
            
            return Response({
                'success': False,
                'message': f'Error processing audio: {str(e)}',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class HealthCheckView(APIView):
    """
    Health check endpoint để kiểm tra API hoạt động
    
    GET /api/health/
    """
    
    def get(self, request, *args, **kwargs):
        """
        Simple health check
        """
        return Response({
            'status': 'ok',
            'message': 'API is running',
            'whisper_model': 'loaded'
        }, status=status.HTTP_200_OK)


class TestTranscriptionView(APIView):
    """
    Test endpoint để kiểm tra transcription với mock data
    
    GET /api/test-transcribe/
    """
    
    def get(self, request, *args, **kwargs):
        """
        Trả về mock transcript data để test frontend
        """
        mock_data = {
            'success': True,
            'message': 'Mock transcription data',
            'filename': 'test_audio.mp3',
            'text': 'Hello and welcome to this English listening practice. Today we will learn about pronunciation.',
            'words': [
                {'word': 'Hello', 'start': 0.0, 'end': 0.5},
                {'word': 'and', 'start': 0.5, 'end': 0.7},
                {'word': 'welcome', 'start': 0.7, 'end': 1.2},
                {'word': 'to', 'start': 1.2, 'end': 1.4},
                {'word': 'this', 'start': 1.4, 'end': 1.7},
                {'word': 'English', 'start': 1.7, 'end': 2.2},
                {'word': 'listening', 'start': 2.2, 'end': 2.8},
                {'word': 'practice.', 'start': 2.8, 'end': 3.5},
                {'word': 'Today', 'start': 3.8, 'end': 4.2},
                {'word': 'we', 'start': 4.2, 'end': 4.4},
                {'word': 'will', 'start': 4.4, 'end': 4.7},
                {'word': 'learn', 'start': 4.7, 'end': 5.1},
                {'word': 'about', 'start': 5.1, 'end': 5.4},
                {'word': 'pronunciation.', 'start': 5.4, 'end': 6.2},
            ],
            'language': 'en'
        }
        
        return Response(mock_data, status=status.HTTP_200_OK)