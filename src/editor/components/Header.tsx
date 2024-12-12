import * as React from 'react';
import { useContext } from 'react';
import { EditorContext } from '../../provider/EditorProvider.tsx';

interface Props {}

function Header(props: Props) {
  const { editorInstance } = useContext(EditorContext);

  return <header className={'flex absolute justify-center'}>에디터 페이지 입니다.</header>;
}

export default Header;
