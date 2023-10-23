# API Documentation

이 프로젝트에서는 API 문서화 도구로 Bruno를 사용하고 있습니다. Bruno는 Postman, Insomnia와 같이 API를 테스트하고 문서화하는 오픈 소스 도구입니다.

자세한 내용은 공식 홈페이지에서 확인할 수 있습니다.  
https://www.usebruno.com/

![Bruno](https://www.usebruno.com/images/landing-2.png)

## How to use

Bruno로 Codedang API collection을 보려면 아래 단계를 따르세요.

### 1. Bruno 설치

Bruno 홈페이지에서 설치 파일을 다운로드 받아 설치하세요.  
https://www.usebruno.com/downloads

### 2. Collection 불러오기

Bruno를 실행하고 'Open Collection'을 클릭합니다.
Codedang 폴더에서 collection 폴더의 client 또는 admin을 선택합니다.

![Open Collection](bruno-start.png)

### 3. 환경 변수 설정

오른쪽 맨 위의 'No Environment'를 클릭하고, 환경을 변경합니다.

- Development: 개발 서버 (https://dev.codedang.com)
- Local: 로컬 서버 (http://localhost)

![Environment](bruno-env.png)

### 4. 확인

왼쪽 탭에서 request를 선택하여 실행할 수 있습니다. `baseUrl`이 초록색으로 표시되는지 확인해주세요.

![Select](bruno-select.png)

## Convention 🤙

새로운 API request를 작성할 때 아래 사항을 지켜주세요.

- 모든 예외 경우마다 request를 작성해주세요. (200, 403, 404 등)
- 각 request는 다음과 같이 이름 지어주세요.
  - **"Succeed"**: 성공하는 경우
  - **"Succeed: \<description>"**: 성공하는 경우 + 추가 설명 (예: "Succeed: Admin Login")
  - **"40x: \<description>"**: 400, 401, 403, 404 등의 오류가 발생하는 경우 + 추가 설명 (예: "40x: Invalid email")
- Endpoint마다 'Succeed' request의 'Docs' 탭에 설명을 남겨주세요.
- 모든 request마다 test를 충분히 작성해주세요(상태 코드 검사, body 검사 등). PR이 merge될 때마다 자동으로 E2E 검사가 이뤄집니다.
- Request를 보낼 때 상황별로 결과가 달라지지 않게 해주세요. 다시 말해 **언제나 동일한 결과**가 오게 해주세요.
