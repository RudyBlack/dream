import { ResObjectData } from '../@types/object';
import { ResLightData } from '../@types/light';

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

export async function loadSceneData(): Promise<ResObjectData | undefined> {
  try {
    const response = await fetch(`/sceneData.json`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('장면 데이터 불러오기 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

export async function loadLightData(): Promise<ResLightData | undefined> {
  try {
    const response = await fetch(`/lightData.json`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('라이트 데이터 불러오기 실패:', response.statusText);
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

export async function patchLightData(partialData: ResLightData) {
  try {
    const response = await fetch(`${API_ENDPOINT}/lights`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partialData),
    });

    if (response.ok) {
      console.log('라이트 데이터가 성공적으로 부분 업데이트되었습니다.');
    } else {
      console.error('라이트 데이터 부분 업데이트 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

export async function loadModulesData(): Promise<string[] | undefined> {
  // try {
  //   const response = await fetch(`${API_ENDPOINT}/load-package`);
  //   if (response.ok) {
  //     return await response.json();
  //   } else {
  //     console.error('장면 데이터 불러오기 실패:', response.statusText);
  //   }
  // } catch (error) {
  //   console.error('에러 발생:', error);
  // }

  return ['Cloud', 'Moon', 'Sky', 'Ocean', 'Galaxy'];
}

export async function deleteObject(deleteTarget: string) {
  try {
    const response = await fetch(`${API_ENDPOINT}/scene/${deleteTarget}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      console.log('삭제 성공');
    } else {
      console.error('삭제 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
}

export async function postObjectOpacity(uuid: string, blob: Blob) {
  return fetch(`${API_ENDPOINT}/object-opacity/${uuid}`, {
    method: 'POST',
    body: blob,
  });
}

export async function getObjectOpacity(uuid: string) {
  const res = await fetch(`/opacity_data/${uuid}.bin`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });

  return res;
}
