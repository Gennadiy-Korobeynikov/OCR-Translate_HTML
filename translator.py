from langdetect import detect
from easygoogletranslate import EasyGoogleTranslate


def translate_text(text):
    translator = EasyGoogleTranslate()
    language = detect(text)  # Распознование заданного языка
    # print(language)
    if language in ['ru', 'bg', 'mk']:  # Руский (и совпадающие с ним) языки переводтся на англиский
        target = 'en'
    else:  # Все остальные языки переводятся на русский
        target = 'ru'
    result = translator.translate(text, target_language=target)
    return result
