import subprocess
import whisper
import os
import sys
import json
from pathlib import Path
from django.conf import settings

# if sys.platform == 'win32':
#     ffmpeg_path = os.path.join(os.path.dirname(__file__), '..', 'ffmpeg', 'bin')
#     if os.path.exists(ffmpeg_path):
#         os.environ['PATH'] = ffmpeg_path + os.pathsep + os.environ['PATH']

class WhisperTranscriber:
    """
    Class xử lý transcribe audio bằng Whisper
    """
    
    def __init__(self, model_name='base'):
        """
        Khởi tạo Whisper model
        Args:
            model_name: Tên model (tiny, base, small, medium, large)
        """
        print(f"Loading Whisper model: {model_name}...")
        self.model = whisper.load_model(model_name)
        print("Model loaded successfully!")
    
    def transcribe_audio(self, audio_path, language='en'):
        """
        Transcribe audio file sang text với timestamps
        
        Args:
            audio_path: Đường dẫn đến file audio
            language: Ngôn ngữ của audio (default: 'en')
            
        Returns:
            dict: {
                'text': str - Full transcript,
                'words': list - Danh sách words với timestamps,
                'segments': list - Các segments của audio
            }
        """
        try:
            # Transcribe với word-level timestamps
            result = self.model.transcribe(
                audio_path,
                language=language,
                word_timestamps=True,
                verbose=False
            )
            
            # Xử lý kết quả để lấy word-level timestamps
            words_with_timestamps = []
            
            for segment in result['segments']:
                if 'words' in segment:
                    for word_info in segment['words']:
                        words_with_timestamps.append({
                            'word': word_info['word'].strip(),
                            'start': round(word_info['start'], 2),
                            'end': round(word_info['end'], 2)
                        })
            
            return {
                'text': result['text'].strip(),
                'words': words_with_timestamps,
                'segments': result['segments'],
                'language': result['language']
            }
            
        except Exception as e:
            raise Exception(f"Error transcribing audio: {str(e)}")
    
    def save_transcript(self, transcript_data, output_path):
        """
        Lưu transcript ra file JSON
        
        Args:
            transcript_data: Dict chứa transcript data
            output_path: Đường dẫn file output
        """
        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                json.dump(transcript_data, f, ensure_ascii=False, indent=2)
            return True
        except Exception as e:
            print(f"Error saving transcript: {str(e)}")
            return False


# Singleton instance của Whisper model
_whisper_instance = None

def get_whisper_instance():
    """
    Lấy singleton instance của WhisperTranscriber
    Tránh load model nhiều lần
    """
    global _whisper_instance
    if _whisper_instance is None:
        model_name = getattr(settings, 'WHISPER_MODEL', 'base')
        _whisper_instance = WhisperTranscriber(model_name=model_name)
    return _whisper_instance


def process_audio_file(audio_file, save_transcript=True):
    """
    Xử lý file audio: lưu file, transcribe, trả về kết quả
    
    Args:
        audio_file: UploadedFile object từ Django
        save_transcript: Có lưu transcript ra file không
        
    Returns:
        dict: Transcript data + audio_url
    """
    # Tạo thư mục lưu file nếu chưa có
    audio_dir = os.path.join(settings.MEDIA_ROOT, 'audio')
    os.makedirs(audio_dir, exist_ok=True)
    
    # Lưu file audio
    audio_filename = audio_file.name
    audio_path = os.path.join(audio_dir, audio_filename)
    
    with open(audio_path, 'wb+') as destination:
        for chunk in audio_file.chunks():
            destination.write(chunk)
            
    # # Kiểm tra xem có cần convert không
    file_ext = Path(audio_filename).suffix.lower()
    needs_conversion = file_ext in ['.wma', '.m4a', '.ogg', '.flac', '.webm']
    
    # Đường dẫn file để transcribe (và gửi về frontend)
    transcribe_path = audio_path
    mp3_path = None
    converted_filename = audio_filename
    
    if needs_conversion:
        # Convert sang MP3
        mp3_filename = f"{Path(audio_filename).stem}.mp3"
        mp3_path = os.path.join(audio_dir, mp3_filename)
        convert_to_mp3(audio_path, mp3_path)  # Gọi hàm FFmpeg CBR
        transcribe_path = mp3_path  # Whisper dùng MP3
        converted_filename = mp3_filename  # Fix: Define var cho audio_url
    
    try:
        # Transcribe audio
        transcriber = get_whisper_instance()
        transcript_data = transcriber.transcribe_audio(audio_path, language='en')
        
        if mp3_path:
            transcript_data['converted_filename'] = Path(mp3_path).name
            transcript_data['original_filename'] = audio_filename
            
        # Lưu transcript nếu cần
        if save_transcript:
            transcript_dir = os.path.join(settings.BASE_DIR, 'transcripts')
            os.makedirs(transcript_dir, exist_ok=True)
            
            transcript_filename = f"{Path(audio_filename).stem}_transcript.json"
            transcript_path = os.path.join(transcript_dir, transcript_filename)
            transcriber.save_transcript(transcript_data, transcript_path)
        
        transcript_data['audio_url'] = f"{settings.MEDIA_URL}audio/{converted_filename}"
        return transcript_data
        
    finally:
        # Chỉ remove file gốc nếu convert (giữ MP3 permanent cho serve)
        if needs_conversion and os.path.exists(audio_path):
            os.remove(audio_path)  # Xóa gốc, giữ MP3
        elif not needs_conversion and os.path.exists(audio_path):
            pass


def clean_old_files(directory, days=7):
    """
    Xóa các file cũ hơn X ngày
    
    Args:
        directory: Thư mục cần dọn dẹp
        days: Số ngày giữ file
    """
    import time
    from datetime import datetime, timedelta
    
    if not os.path.exists(directory):
        return
    
    cutoff_time = time.time() - (days * 86400)
    
    for filename in os.listdir(directory):
        filepath = os.path.join(directory, filename)
        if os.path.isfile(filepath):
            if os.path.getmtime(filepath) < cutoff_time:
                try:
                    os.remove(filepath)
                    print(f"Deleted old file: {filename}")
                except Exception as e:
                    print(f"Error deleting {filename}: {str(e)}")

def convert_to_mp3(input_path, output_path):
    """
    Convert audio file sang MP3 với CBR (constant bitrate) bằng ffmpeg trực tiếp
    - CBR fix seeking issues ở browser
    """
    try:
        # FFmpeg command: Input → MP3 CBR 128k, overwrite (-y)
        cmd = [
            'ffmpeg', 
            '-fflags', '+genpts',          # Thêm: Generate PTS nếu thiếu/sai
            '-avoid_negative_ts', 'make_zero',  # Thêm: Fix negative/invalid DTS bằng cách shift về 0
            '-map_metadata', '-1',         # Thêm: Strip all metadata (fix DRM residue)
            '-i', input_path,              # Input file
            '-c:a', 'pcm_s16le',           # WAV encoder (PCM 16-bit little-endian, standard)
            '-ar', '44100',                # Sample rate 44.1kHz (match input)
            '-y', output_path              # Overwrite output
        ]
        
        # Chạy subprocess, capture output cho debug
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        if result.returncode == 0:
            print(f"Converted {input_path} to CBR MP3: {output_path}")
            print(f"FFmpeg log: {result.stderr}")  # Log warnings nếu có
            return output_path
        else:
            raise Exception(f"FFmpeg failed: {result.stderr}")
            
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e}")
        raise
    except Exception as e:
        print(f"Error converting audio: {str(e)}")
        raise