export const getCloudData = async () => {
  try {
    const response = await fetch(`/cloudData.json`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('데이터 불러오기 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
};

export const getMoonData = async () => {
  try {
    const response = await fetch(`/moonData.json`);
    if (response.ok) {
      return await response.json();
    } else {
      console.error('데이터 불러오기 실패:', response.statusText);
    }
  } catch (error) {
    console.error('에러 발생:', error);
  }
};
