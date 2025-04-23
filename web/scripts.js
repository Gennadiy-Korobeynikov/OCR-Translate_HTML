
    const dropzone = document.getElementById('dropzone');
    const uploadedImage = document.getElementById('uploaded-image');
    const fileInput = document.getElementById('file-input');
    const textRecognition = document.getElementById('text-recognition');
    const modeToggle = document.getElementById('mode-toggle');
    const langRadios = document.getElementsByName('lang_rb');
    const langSelection = document.getElementById('lang-selection');
    const textStateLabel = document.getElementById('text-state-label');

    let recognizedText = '';
    let originalText = '';
    let isOriginalTextDisplayed = true;
    let lastUploadedFile = null;
    let mode = modeToggle.checked ? 'EasyOCR' : 'Tesseract';
    let lang = document.querySelector('input[name="lang_rb"]:checked').value;

    // Появление выбра языка только в режиме Tesseract
    const updateLangVisibility = () => {
        if (modeToggle.checked) {
            langSelection.classList.add('hidden');
        } else {
            langSelection.classList.remove('hidden');
        }
    };

    // Изменение режима Tesseract/EasyOCR
    modeToggle.addEventListener('change', () => {
        mode = modeToggle.checked ? 'EasyOCR' : 'Tesseract';
        updateLangVisibility();
        if (lastUploadedFile) {
            handleFileUpload(lastUploadedFile);
        }
    });

    // Изменени начального языка для Tesseract
    langRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            lang = document.querySelector('input[name="lang_rb"]:checked').value;
            if (lastUploadedFile) {
                handleFileUpload(lastUploadedFile);
            }
        });
    });

    //--------Анимации для drop-zone--------
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('mouseenter', () => {
        dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('mouseleave', () => {
        dropzone.classList.remove('dragover');
    });

    // Загрузка файла перетаскиванием
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            lastUploadedFile = files[0];
            handleFileUpload(lastUploadedFile);
        }
        document.getElementById('dropzone-text').style.display = 'none';
    });

    dropzone.addEventListener('click', () => {
    fileInput.click();
});
    //-----------------------------------------

    // Загрузка файла кнопкой
   fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            lastUploadedFile = file;
            handleFileUpload(file);
            document.getElementById('dropzone-text').style.display = 'none';
        }
    });

    // Перевод текста
    document.getElementById('translate-btn').addEventListener('click', (e) => {
        const text = recognizedText;
        if (text) {
            if (isOriginalTextDisplayed) {  // Проверка состояния отображаемого текста
                handleTranslation(text);
            } else {
                updateTextRecognition(originalText);  // Восстановление оригинального текста
            }
            isOriginalTextDisplayed = !isOriginalTextDisplayed;  // Переключение состояния
            updateTextStateLabel();
        } else {
            alert('Текст для перевода отсутствует!');
        }
    });

    function handleTranslation(text) {
        eel.Translate(text)(updateTextRecognition);
    }

    // Распознавание текста
    async function handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Image = event.target.result;
            uploadedImage.src = base64Image;
            uploadedImage.style.display = 'block';
            const base64ImageStripped = base64Image.split(',')[1];
            eel.Img2Txt(mode, base64ImageStripped, lang)(updateTextRecognition);
            textRecognition.classList.add('expanded');
        };
        reader.readAsDataURL(file);
    }

    function updateTextRecognition(result) {
        recognizedText = result;
        if (isOriginalTextDisplayed) {  // Сохранение оригинального текста только при его первом распознавании
            originalText = result;
            textStateLabel.classList.remove('hidden'); //Появление надписи "Оригинал"/"Перевод"
        }
        const currentText = textRecognition.querySelector('p');
        currentText.classList.add('fade-out');

        currentText.addEventListener('transitionend', function onTransitionEnd() {

        currentText.removeEventListener('transitionend', onTransitionEnd);
        // Обновляем текст и запускаем анимацию появления
        textRecognition.innerHTML = `<p class="fade-in">${result}</p>`;

        const newText = textRecognition.querySelector('p');
        // Запуск анимации появления
        requestAnimationFrame(() => {
                newText.classList.remove('fade-in');
            });
        });
    }

    // Обновление текста "Перевод"/"Оригинал"
    function updateTextStateLabel() {
        textStateLabel.classList.remove('slide-in');
        textStateLabel.classList.add('slide-out');
        setTimeout(() => {
            textStateLabel.textContent = isOriginalTextDisplayed ? 'Оригинал' : 'Перевод';
            textStateLabel.classList.remove('slide-out');
            textStateLabel.classList.add('slide-in');
        }, 500);
    }


    // Анимация для Translate-button
    var animateButton = function(e) {

      e.preventDefault;
      e.target.classList.remove('animate');

      e.target.classList.add('animate');
      setTimeout(function(){
        e.target.classList.remove('animate');
      },700);
    };

    document.getElementById('translate-btn').addEventListener('click', animateButton, false);

    // Копирование текста
    function copyTextToClipboard() {
        const text = textRecognition.innerText;
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showCopyNotification();
    }
        copyButton.addEventListener('click', copyTextToClipboard);

        const copyNotification = document.getElementById('copyNotification');

    // Уведомление об успешном копировании
    function showCopyNotification() {
        copyNotification.style.opacity = '1';
        setTimeout(() => {
            copyNotification.style.opacity = '0';
        }, 2000); // Уведомление исчезнет через 2 секунды
    }