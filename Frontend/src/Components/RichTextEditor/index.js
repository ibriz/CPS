import React, { useState } from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ImageUploadAdapter from '../../Helpers/ImageUploadAdapter';
import { TiTick } from 'react-icons/ti';
import editorCss from './editorCss.css';
import { ImCross } from 'react-icons/im';

export function modelElementToPlainText(element) {
  if (element.is('text') || element.is('textProxy')) {
    return element.data;
  }

  let text = '';
  let prev = null;

  for (const child of element.getChildren()) {
    const childText = modelElementToPlainText(child);

    // If last block was finish, start from new line.
    if (prev && prev.is('element')) {
      text += '\n';
    }

    text += childText;

    prev = child;
  }

  return text;
}

const RichTextEditor = ({
  onChange,
  setWords,
  setCharacters,
  onBlur,
  initialData = null,
  minimumNumberOfWords,
}) => {
  const [numberOfWords, setNumberOfWords] = useState(0);
  const [numberOfCharacters, setNumberOfCharacters] = useState(0);

  return (
    <>
      <CKEditor
        id='editor1'
        data={initialData}
        editor={ClassicEditor}
        onInit={editor => {
          // You can store the "editor" and use when it is needed.
          console.log('Editor is ready to use!', editor);
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          console.log({ event, editor, data });
          onChange(data);

          const txt = modelElementToPlainText(editor.model.document.getRoot());
          const detectedWords =
            txt.match(
              new RegExp('[\\p{L}\\p{N}\\p{M}\\p{Pd}\\p{Pc}]+', 'gu'),
            ) || [];
          const numberOfWords = detectedWords.length;
          const numberOfCharacters = txt.replace(/\n/g, '').length;
          console.log(
            'wordCount',
            numberOfWords,
            'character count',
            numberOfCharacters,
          );

          setNumberOfWords(numberOfWords);

          if (setWords instanceof Function) {
            setWords(numberOfWords);
          }

          setNumberOfCharacters(numberOfCharacters);

          if (setCharacters instanceof Function) {
            setCharacters(numberOfCharacters);
          }
        }}
        onBlur={(event, editor) => {
          console.log('Blur.', editor);

          if (onBlur instanceof Function) {
            onBlur();
          }
        }}
        onFocus={(event, editor) => {
          console.log('Focus.', editor);
        }}
        config={{
          allowedContent: true,
          plugins: [...ClassicEditor.builtinPlugins, ImageUploadAdapter],
          simpleUpload: {
            // The URL that the images are uploaded to.
            uploadUrl: 'http://13.212.13.194:3000/api/image/upload',
          },
          contentCss: { editorCss },
        }}
      />
      {minimumNumberOfWords && (
        <div
          style={{
            height: 'auto',
            border: '1px solid',
            borderTop: 'none',
            borderRadius: '2px',
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            borderColor: '#c4c4c4',
            paddingLeft: '5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            paddingRight: '5px',
          }}
        >
          {numberOfWords}/{minimumNumberOfWords} words{' '}
          {numberOfWords >= minimumNumberOfWords ? (
            <TiTick
              className='text-success'
              style={{ fontSize: '1.1rem', marginLeft: '2px' }}
            />
          ) : (
            <ImCross
              className='text-danger'
              style={{ fontSize: '0.75rem', marginLeft: '2px' }}
            />
          )}
        </div>
      )}
    </>
  );
};

export default RichTextEditor;
