from PIL import Image
import pytesseract
import eel
import io
import base64
import translator
import easyocr
import numpy as np
import cv2

pytesseract.pytesseract.tesseract_cmd = r'Tesseract-OCR/tesseract.exe'
eel.init(r'web')
# Инициализация распознавателя EasyOCR для необходимых языков
reader = easyocr.Reader(['en', 'ru'])


@eel.expose
def Img2Txt(mode, base64_image, lang='rus'):
    if mode == "EasyOCR":
        return Img2TxtEasyOCR(base64_image)
    elif mode == "Tesseract":
        return Img2TxtTesseract(lang, base64_image)


# Распознавание с помощью PyTesseract
@eel.expose
def Img2TxtTesseract(lang, base64_image):
    custom_config = r'--psm 6'
    image_data = base64.b64decode(base64_image)
    image = Image.open(io.BytesIO(image_data))

    # Преобразование изображения в черно-белый режим
    thresh = 150
    fn = lambda x: 255 if x > thresh else 0
    bw_image = image.convert('L').point(fn, mode='1')

    text = pytesseract.image_to_string(bw_image, config=custom_config, lang=lang)
    lines = text.split('\n')

    lines = [line.strip() for line in lines if line.strip()]

    text = '<br>'.join(lines)  # Деление на строки
    return text


# Преобразование с помощью EasyOCR
@eel.expose
def Img2TxtEasyOCR(base64_image):
    image_data = base64.b64decode(base64_image)
    image = Image.open(io.BytesIO(image_data))
    image_np = np.array(image)
    if image.mode == 'RGBA':
        # Если изображение в формате RGBA, преобразуем в RGB
        image_np = cv2.cvtColor(image_np, cv2.COLOR_RGBA2RGB)
    elif image.mode == 'L':
        # Если изображение черно-белое, преобразуем в RGB
        image_np = cv2.cvtColor(image_np, cv2.COLOR_GRAY2RGB)

    results = reader.readtext(image_np)

    # Функция для сортировки по координатам
    def sort_key(result):
        # result[0] - это bounding box, представляющий собой список из 4 точек
        # Мы берем среднее значение по Y для каждой точки, чтобы отсортировать по вертикальному положению
        return np.mean([point[1] for point in result[0]])

    # Сортировка результатов по вертикальному положению
    sorted_results = sorted(results, key=sort_key)

    # Группировка текста по строкам
    lines = []
    current_line = []
    current_y = None
    line_threshold = 10  # Пороговое значение для определения, что текст на одной линии

    for result in sorted_results:
        bbox = result[0]
        text = result[1]
        avg_y = np.mean([point[1] for point in bbox])

        if current_y is None or abs(avg_y - current_y) < line_threshold:
            current_line.append((bbox, text))
            current_y = avg_y
        else:
            lines.append(current_line)
            current_line = [(bbox, text)]
            current_y = avg_y

    if current_line:
        lines.append(current_line)

    # Объединение строк с учетом горизонтальных отступов
    formatted_text = ""
    for line in lines:
        line_texts = sorted(line, key=lambda x: x[0][0][0])  # Сортировка по X координате
        line_str = " ".join([text for _, text in line_texts])
        formatted_text += line_str + "<br>"

    return formatted_text


# Перевод текста
@eel.expose
def Translate(text):
    translated_text = translator.translate_text(text)
    return translated_text


# Запуск программы
eel.start('main.html', size=(900, 600), mode='default')
