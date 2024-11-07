import * as THREE from 'three';

const API_ENDPOINT = `http://localhost:3001`;

export async function saveSceneData(data: any) {
  try {
    const response = await fetch(`${API_ENDPOINT}/save-scene`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('장면 데이터가 성공적으로 저장되었습니다.');
    } else {
      console.error('장면 데이터 저장 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

export type ResType = Root2[];

export interface Root2 {
  type: string;
}

export async function loadSceneData(): Promise<ResType | undefined> {
  try {
    const response = await fetch(`${API_ENDPOINT}/load-scene`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('장면 데이터 불러오기 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

export async function updateSceneData(data: any) {
  try {
    const response = await fetch(`${API_ENDPOINT}/scene`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log('장면 데이터가 성공적으로 업데이트되었습니다.');
    } else {
      console.error('장면 데이터 업데이트 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

export async function patchSceneData(partialData: any) {
  try {
    const response = await fetch(`${API_ENDPOINT}/scene`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partialData),
    });

    if (response.ok) {
      console.log('장면 데이터가 성공적으로 부분 업데이트되었습니다.');
    } else {
      console.error('장면 데이터 부분 업데이트 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}
