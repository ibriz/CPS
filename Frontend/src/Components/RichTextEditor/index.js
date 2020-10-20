import React from 'react';
import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import ImageUploadAdapter from '../../helpers/ImageUploadAdapter';

const RichTextEditor = ({onChange}) => {

    return(
        <CKEditor
        id="editor1"
        editor={ClassicEditor}
        onInit={editor => {
            // You can store the "editor" and use when it is needed.
            console.log('Editor is ready to use!', editor);
        }}
        onChange={(event, editor) => {
            const data = editor.getData();
            console.log({ event, editor, data });
            onChange(data);

        }}
        onBlur={(event, editor) => {
            console.log('Blur.', editor);
        }}
        onFocus={(event, editor) => {
            console.log('Focus.', editor);
        }}
        config={{
            plugins: [...ClassicEditor.builtinPlugins, ImageUploadAdapter],
            simpleUpload: {
                // The URL that the images are uploaded to.
                uploadUrl: 'http://13.212.13.194:3000/api/image/upload',
            }
        }
        }
    />
    )

}

export default RichTextEditor;