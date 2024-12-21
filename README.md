# Dream 프로젝트

> **three.js + WebGPU 사이드 프로젝트**  
> 플러그인 아키텍처를 통해 그래픽 레이어를 확장 가능하게 구현한 개인 학습용/사이드 프로젝트입니다.


---

## 프로젝트 개요

- **기술 스택**
    - **TypeScript**, **React**
    - **three.js** + **WebGPU**
    - **Vite**, **ESLint**, **Prettier**, **TailwindCSS** 등
- **특징**
    - 최신 그래픽 API(WebGPU) 및 three.js를 활용 및 학습목적
    - 플러그인 아키텍처 설계로 각 기능(레이어, 파티클, 후처리 등)을 독립적으로 확장 가능

---

## 폴더 구조


### packages
- **`dreamJourney`** 와 **`editor`** 등 그래픽과 관련된 주요 기능(three.js + WebGPU)을 패키지 형태로 구성한 폴더입니다.
- 프로젝트 내에서 재사용할 수 있는 그래픽 컴포넌트나 플러그인, 공통 모듈 등을 패키지 단위로 관리합니다.

### src
- **React** 기반 UI 관련 코드가 들어 있는 폴더입니다.
- 구조 예시
    - **`editor/`**: 에디터 관련 UI 및 기능 제어 (개발중)
    - **`provider/`**: 그래픽스 관련 로직을 Context api를 이용해서 랩핑해서 리액트에서 사용하는 용도
    - **`viewer/`**: 3D 뷰어 관련 UI 
    - **`App.tsx`**: 애플리케이션의 루트 컴포넌트

---

## 사용 방법

1. ****
   ```bash
   npm install
   npm run build
   npm run preview

http://localhost:4173/ 접속
