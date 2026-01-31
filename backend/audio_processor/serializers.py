from rest_framework import serializers

class AudioUploadSerializer(serializers.Serializer):
    """
    Serializer để validate audio file upload
    """
    audio = serializers.FileField(required=True)
    
    def validate_audio(self, value):
        """
        Validate audio file
        """
        # Kiểm tra extension - THÊM .wma
        valid_extensions = ['.mp3', '.wav', '.m4a', '.wma', '.aac', '.ogg', '.flac', '.webm']
        ext = value.name.lower().split('.')[-1]
        
        if f'.{ext}' not in valid_extensions:
            raise serializers.ValidationError(
                f"Unsupported file format. Supported formats: {', '.join(valid_extensions)}"
            )
        
        # Kiểm tra kích thước file (max 50MB)
        max_size = 50 * 1024 * 1024  # 50MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File size exceeds maximum limit of 50MB. Your file: {value.size / (1024*1024):.2f}MB"
            )
        
        return value

class TranscriptWordSerializer(serializers.Serializer):
    """
    Serializer cho từng word với timestamp
    """
    word = serializers.CharField()
    start = serializers.FloatField()
    end = serializers.FloatField()


class TranscriptResponseSerializer(serializers.Serializer):
    """
    Serializer cho response của transcription
    """
    text = serializers.CharField(help_text="Full transcript text")
    words = TranscriptWordSerializer(many=True, help_text="List of words with timestamps")
    language = serializers.CharField(help_text="Detected language")
    filename = serializers.CharField(help_text="Original filename")
    success = serializers.BooleanField(default=True)
    message = serializers.CharField(required=False)