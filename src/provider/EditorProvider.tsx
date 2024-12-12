import React, { createContext, ReactNode, useState } from 'react';
import Editor from '../../packages/editor';

type Module = Editor | null;

const EditorContext = createContext<{
  editorInstance: Module;
  setModuleInstance: ((editorInstance: Module) => void) | null;
}>({ editorInstance: null, setModuleInstance: null });

const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [editorInstance, _setModuleInstance] = useState<null | Module>(null);

  const setModuleInstance = (editor: Module | null) => {
    if (editorInstance) {
      editorInstance.dispose();
    }

    _setModuleInstance(editor);
  };

  return (
    <EditorContext.Provider
      value={{
        editorInstance: editorInstance,
        setModuleInstance,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export default EditorProvider;
export { EditorContext };
