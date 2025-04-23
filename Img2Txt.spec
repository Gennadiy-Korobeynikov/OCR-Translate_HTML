block_cipher = None

a = Analysis(
    ['recognizing.py'],
    pathex=['.'],
    binaries=[],
    datas=[
        ('web', 'web')
    ],
    hiddenimports=[
        'PIL',
        'pytesseract',
        'eel',
        'base64',
        'translator',
        'easyocr',
        'numpy',
        'cv2',
        'langdetect',
        'easygoogletranslate'
    ],
    hookspath=[],
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
)
pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='Img2Txt',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    icon='web\\app_icon.ico',
)
