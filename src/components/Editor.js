import React, { useEffect, useRef } from 'react';
import * as Codemirror from'codemirror';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({socketRef, roomId, onCodeChange}) => {

    const editorRef = useRef(null);

    useEffect(() => {

        async function init() {
            editorRef.current = Codemirror.fromTextArea(document.getElementById('realtimeEditor'),{
                mode: {name: 'javascript', json: true},
                theme: 'dracula',
                autoCloseTags: true,
                autoCloseBrackets: true,
                lineNumbers: true,
            });

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    console.log('working', code);
                    console.log('socket status',socketRef.current.connected);
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });

            //editorRef.current.setValue(`console.log("hello")`);
        } 
        
          init();

    }, []);

     useEffect(() => {
         if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                console.log('recieving',code);
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
         }

         return () => {
            setTimeout(() => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        }, 5000);
        };
    }, [socketRef.current]);

    return (
        <textarea id="realtimeEditor"></textarea>
    )
};

export default Editor