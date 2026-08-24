from youtube_transcript_api import YouTubeTranscriptApi

try:
    fetched = YouTubeTranscriptApi().fetch('oKC8DxO4IKg')
    raw = fetched.to_raw_data()
    print('SUCCESS', len(raw), 'segments')
    print(raw[0])
except Exception as e:
    print('FAILED:', type(e).__name__, str(e))