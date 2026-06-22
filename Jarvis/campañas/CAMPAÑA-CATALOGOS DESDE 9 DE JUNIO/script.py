import zipfile
import xml.etree.ElementTree as ET

def get_text(filename):
    with zipfile.ZipFile(filename) as z:
        tree = ET.fromstring(z.read('word/document.xml'))
        return ''.join(node.text for node in tree.iter() if node.tag.endswith('}t') and node.text)

print('--- GANADOR.DOCX ---')
print(get_text('ganador.docx'))
print('\n--- V1.DOCX ---')
print(get_text('v1.docx'))
