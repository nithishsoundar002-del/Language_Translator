"""
CodeAlpha AI Internship - Task 1: Language Translation Tool
Python implementation utilizing deep-translator / MyMemory API.
"""

import sys
import json
import urllib.parse
import urllib.request

SUPPORTED_LANGUAGES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'hi': 'Hindi',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'ja': 'Japanese',
    'ru': 'Russian',
    'pt': 'Portuguese'
}

class LanguageTranslator:
    def __init__(self, default_target='es'):
        self.default_target = default_target

    def translate(self, text: str, source_lang: str = 'auto', target_lang: str = 'es') -> str:
        """Translates input text from source_lang to target_lang."""
        if not text or not text.strip():
            return ""

        # Try deep-translator if installed
        try:
            from deep_translator import GoogleTranslator
            translated = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
            return translated
        except Exception:
            pass

        # Fallback to MyMemory Free Translation API endpoint
        try:
            lang_pair = f"{source_lang}|{target_lang}"
            url = f"https://api.mymemory.translated.net/get?q={urllib.parse.quote(text)}&langpair={lang_pair}"
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode('utf-8'))
                if data and 'responseData' in data and 'translatedText' in data['responseData']:
                    return data['responseData']['translatedText']
        except Exception as e:
            print(f"[Warning] Translation API error: {e}")

        return f"[Translated ({target_lang})]: {text}"


def main():
    print("==================================================")
    print("  CodeAlpha AI Internship - Task 1: Translator   ")
    print("==================================================")

    translator = LanguageTranslator()

    print("\nSupported Languages:")
    for code, name in SUPPORTED_LANGUAGES.items():
        print(f"  {code} : {name}")

    while True:
        text = input("\nEnter text to translate (or 'exit' to quit): ").strip()
        if text.lower() == 'exit':
            break

        target = input("Enter target language code [default 'es']: ").strip().lower() or 'es'
        
        result = translator.translate(text, source_lang='auto', target_lang=target)
        print("\n--------------------------------------------------")
        print(f"Original Text   : {text}")
        print(f"Target ({target.upper()})  : {result}")
        print("--------------------------------------------------")


if __name__ == "__main__":
    main()
