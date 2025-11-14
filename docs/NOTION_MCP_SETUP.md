# Notion MCP 설정 가이드

이 문서는 VS Code에서 Notion MCP (Model Context Protocol) 서버를 설정하는 방법을 설명합니다. Notion MCP를 사용하면 AI 어시스턴트가 Notion API와 상호작용하여 페이지를 읽고, 생성하고, 수정할 수 있습니다.

## 📋 목차

- [사전 준비](#사전-준비)
- [Notion API 키 생성](#notion-api-키-생성)
- [Notion 페이지에 Integration 연결](#notion-페이지에-integration-연결)
- [VS Code MCP 설정](#vs-code-mcp-설정)
- [사용 예시](#사용-예시)
- [문제 해결](#문제-해결)

## 사전 준비

MCP 설정을 시작하기 전에 다음이 필요합니다:

- VS Code가 설치되어 있어야 합니다
- Notion 계정이 있어야 합니다
- 프로젝트가 VS Code에서 열려 있어야 합니다

## Notion API 키 생성

1. [Notion Developers](https://www.notion.so/my-integrations) 페이지로 이동합니다
2. "New integration" 버튼을 클릭합니다
3. Integration 정보를 입력합니다:
   - **Name**: 예) "Codedang MCP Server"
   - **Associated workspace**: 사용할 워크스페이스 선택
   - **Capabilities**: 필요한 권한 선택 (Read content, Update content, Insert content 등)
4. "Submit" 버튼을 클릭하여 Integration을 생성합니다
5. **Internal Integration Token**을 복사합니다 (이것이 API Key입니다)
   - ⚠️ 이 토큰은 비밀번호처럼 안전하게 보관해야 합니다

## Notion 페이지에 Integration 연결

생성한 Integration이 Notion 페이지에 접근할 수 있도록 연결해야 합니다:

1. Notion에서 사용할 페이지를 엽니다
2. 페이지 우측 상단의 `...` (더보기) 메뉴를 클릭합니다
3. "연결" 또는 "Connections" 메뉴로 이동합니다
4. 생성한 Integration을 찾아서 활성화합니다

연결 후, Integration이 해당 페이지와 하위 페이지에 접근할 수 있게 됩니다.

## VS Code MCP 설정

이 프로젝트에는 `.vscode/mcp.json` 파일이 이미 구성되어 있습니다. VS Code에서 MCP를 활성화하면 다음 정보를 입력하라는 메시지가 표시됩니다:

### 필수 입력 정보

1. **Notion API Key (Secret Token)**
   - 위에서 생성한 Internal Integration Token을 입력합니다
   - 입력 시 값이 숨겨지도록 설정되어 있습니다

2. **Notion Page ID**
   - 기본적으로 작업할 Notion 페이지의 ID를 입력합니다
   - 페이지 URL에서 확인할 수 있습니다
   - 예: `https://www.notion.so/your-page-e28be993bdd742afbed3c0c116d85e4e`
     → Page ID는 `e28be993bdd742afbed3c0c116d85e4e`
   - Optional: 비워두면 검색 기능을 통해 페이지를 찾습니다

### 선택 입력 정보 (프로젝트별 커스터마이징)

3. **Team name**
   - 소속 팀 이름 (예: 프론트, 백엔드, 인프라)
   - 자동화 작업 시 팀 정보가 필요한 경우 사용됩니다

4. **Member name**
   - 멤버 이름 (예: 홍길동)
   - 작업 기록이나 할당 작업에 사용됩니다

5. **Squad**
   - 스쿼드 이름 (예: 스쿼드 __init__)
   - 팀 내 스쿼드 구분이 필요한 경우 사용됩니다

### MCP 서버 활성화

VS Code에서 MCP를 활성화하는 방법은 사용 중인 AI 어시스턴트 확장에 따라 다릅니다. 일반적으로:

1. VS Code를 재시작하거나 확장을 다시 로드합니다
2. AI 어시스턴트 확장의 설정에서 MCP 서버를 확인합니다
3. 처음 사용 시 위의 입력 정보를 제공하라는 메시지가 표시됩니다

## 사용 예시

MCP 서버가 활성화되면 AI 어시스턴트에게 다음과 같은 요청을 할 수 있습니다:

```
- "Notion에 오늘의 작업 목록을 생성해줘"
- "미팅 노트를 Notion에 업데이트해줘"
- "프로젝트 추적을 위한 새 데이터베이스를 만들어줘"
- "내 작업 데이터베이스에 새 항목을 추가해줘"
- "프로젝트 페이지에 댓글을 추가해줘"
- "이 문서의 모든 댓글을 보여줘"
- "워크스페이스의 모든 사용자 목록을 보여줘"
```

## 문제 해결

### 인증 오류가 발생하는 경우

- Notion API Key가 올바른지 확인하세요
- Integration이 해당 페이지에 연결되어 있는지 확인하세요
- Integration의 권한 설정을 확인하세요

### 페이지에 접근할 수 없는 경우

- Integration이 해당 페이지에 명시적으로 연결되어 있는지 확인하세요
- 페이지 ID가 올바른지 확인하세요
- 상위 페이지에 Integration이 연결되어 있으면 하위 페이지도 접근 가능합니다

### Rate Limiting 오류

- Notion API에는 rate limit이 있습니다
- 대량 작업을 수행할 때는 배치 작업 기능을 사용하세요
- 작업 간격을 두고 실행하세요

### MCP 서버가 시작되지 않는 경우

- VS Code를 완전히 재시작해보세요
- `.vscode/mcp.json` 파일이 올바른 형식인지 확인하세요
- VS Code 콘솔에서 오류 메시지를 확인하세요

## 추가 정보

### MCP 설정 파일 구조

`.vscode/mcp.json` 파일은 두 가지 주요 섹션으로 구성되어 있습니다:

1. **inputs**: 사용자로부터 입력받을 정보를 정의합니다
   - `type`: 입력 유형 (promptString)
   - `id`: 입력 값을 참조할 때 사용하는 ID
   - `description`: 사용자에게 표시되는 설명
   - `password`: true로 설정 시 입력 값이 숨겨집니다
   - `default`: 기본값 (선택사항)

2. **servers**: MCP 서버를 정의합니다
   - `command`: 실행할 명령어 (npx)
   - `args`: 명령어 인자 (notion-mcp-server 패키지 실행)
   - `env`: 환경 변수 (입력값을 ${input:id} 형식으로 참조)

### 사용되는 패키지

이 설정은 [notion-mcp-server](https://www.npmjs.com/package/notion-mcp-server) 패키지를 사용합니다. 이 패키지는:

- Notion API와 상호작용하는 MCP 서버 구현체입니다
- npx를 통해 자동으로 최신 버전이 실행됩니다
- 별도의 설치 없이 사용할 수 있습니다

## 참고 자료

- [Notion API 문서](https://developers.notion.com/reference/intro)
- [Model Context Protocol 문서](https://modelcontextprotocol.io/)
- [notion-mcp-server GitHub](https://github.com/awkoy/notion-mcp-server)
