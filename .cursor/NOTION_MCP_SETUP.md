# Notion MCP 설정 가이드

Cursor IDE에서 Notion API를 사용하기 위한 설정 방법입니다.

## 목차

1. [Notion API 키 발급](#1-notion-api-키-발급)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [사용 방법](#3-사용-방법)

## 1. Notion API 키 발급

### 1.1 Notion Integration 생성

1. [Notion Developers](https://www.notion.so/my-integrations) 페이지에 접속합니다.
2. **"+ New integration"** 버튼을 클릭합니다.
3. Integration 정보를 입력합니다:
   - **Name**: 원하는 이름 입력 (예: "Codedang Cursor MCP")
   - **Logo**: 선택사항
   - **Associated workspace**: 사용할 워크스페이스 선택
4. **"Submit"** 버튼을 클릭하여 Integration을 생성합니다.

### 1.2 API 키 확인

1. 생성된 Integration 페이지에서 **"Internal Integration Token"** 섹션을 찾습니다.
2. **"Show"** 버튼을 클릭하여 API 키를 확인합니다.
3. API 키는 `secret_`로 시작하는 긴 문자열입니다. 이 키를 복사해두세요.

### 1.3 Notion 페이지 권한 부여

Notion MCP를 통해 접근하려는 페이지나 데이터베이스에 Integration을 연결해야 합니다:

1. 접근하려는 Notion 페이지를 엽니다.
2. 우측 상단의 **"..."** 메뉴를 클릭합니다.
3. **"Add connections"** 또는 **"Connections"**를 선택합니다.
4. 생성한 Integration을 검색하여 추가합니다.

## 2. 환경 변수 설정

`NOTION_API_KEY` 환경 변수를 시스템에 추가해야 합니다. 사용하는 셸에 따라 설정 방법이 다릅니다.

### 2.1 셸 확인

현재 사용 중인 셸을 확인합니다:

```bash
echo $SHELL
```

- `/bin/bash` 또는 `/usr/bin/bash` → Bash 사용
- `/bin/zsh` 또는 `/usr/bin/zsh` → Zsh 사용
- 기타 → 해당 셸의 설정 파일 사용

### 2.2 Bash 설정 (bash 사용자)

1. 홈 디렉토리의 `.bashrc` 또는 `.bash_profile` 파일을 엽니다:

```bash
nano ~/.bashrc
# 또는
nano ~/.bash_profile
```

2. 파일 끝에 다음 내용을 추가합니다:

```bash
# Notion API Key for Cursor MCP
export NOTION_API_KEY="secret_여기에_발급받은_API_키_입력"
```

3. 파일을 저장하고 종료합니다 (nano: `Ctrl+X`, `Y`, `Enter`).

4. 설정을 적용합니다:

```bash
source ~/.bashrc
# 또는
source ~/.bash_profile
```

### 2.3 Zsh 설정 (zsh 사용자)

1. 홈 디렉토리의 `.zshrc` 파일을 엽니다:

```bash
nano ~/.zshrc
```

2. 파일 끝에 다음 내용을 추가합니다:

```bash
# Notion API Key for Cursor MCP
export NOTION_API_KEY="secret_여기에_발급받은_API_키_입력"
```

3. 파일을 저장하고 종료합니다.

4. 설정을 적용합니다:

```bash
source ~/.zshrc
```

### 2.4 Fish 셸 설정 (fish 사용자)

1. Fish 설정 디렉토리에 환경 변수 파일을 생성합니다:

```bash
mkdir -p ~/.config/fish
nano ~/.config/fish/config.fish
```

2. 다음 내용을 추가합니다:

```fish
# Notion API Key for Cursor MCP
set -gx NOTION_API_KEY "secret_여기에_발급받은_API_키_입력"
```

3. 파일을 저장하고 종료합니다.

4. 설정을 적용합니다:

```bash
source ~/.config/fish/config.fish
```

### 2.5 환경 변수 확인

설정이 제대로 적용되었는지 확인합니다:

```bash
echo $NOTION_API_KEY
```

발급받은 API 키가 출력되면 정상적으로 설정된 것입니다.

### 2.6 보안 고려사항

⚠️ **중요**: API 키는 민감한 정보이므로 다음 사항을 준수하세요:

- Git 저장소에 커밋하지 마세요 (`.gitignore`에 포함되어 있는지 확인)
- 다른 사람과 공유하지 마세요
- 필요시 환경 변수 파일의 권한을 제한하세요:

```bash
chmod 600 ~/.bashrc  # 또는 ~/.zshrc
```

## 3. 사용 방법

### 3.1 Cursor IDE 재시작

환경 변수를 설정한 후 Cursor IDE를 완전히 종료하고 다시 시작해야 합니다:

1. Cursor IDE를 완전히 종료합니다.
2. 터미널에서 환경 변수가 설정되어 있는지 확인합니다:

```bash
echo $NOTION_API_KEY
```

3. Cursor IDE를 다시 시작합니다.

### 3.2 MCP 서버 확인

Cursor IDE가 시작되면 MCP 서버가 자동으로 실행됩니다. 다음 방법으로 확인할 수 있습니다:

1. Cursor IDE에서 MCP 서버 상태를 확인합니다.
2. Notion 관련 기능이 사용 가능한지 테스트합니다.

### 3.3 사용 예시

Cursor IDE에서 다음과 같은 작업을 수행할 수 있습니다:

- **태스크 조회**: 현재 브랜치와 관련된 Notion 태스크 찾기
- **페이지 조회**: Notion 페이지 내용 가져오기
- **페이지 생성/수정**: Notion 페이지에 내용 추가하기
- **데이터베이스 쿼리**: Notion 데이터베이스 검색하기

예를 들어, Cursor IDE에서 다음과 같이 요청할 수 있습니다:

```
"현재 브랜치와 관련된 태스크 찾아"
"노션에서 프로젝트 페이지 가져와"
"태스크 페이지에 설명 추가해"
```

### 3.4 문제 해결

#### 환경 변수가 인식되지 않는 경우

1. Cursor IDE를 완전히 종료하고 다시 시작합니다.
2. 터미널에서 환경 변수가 설정되어 있는지 확인합니다:

```bash
echo $NOTION_API_KEY
```

3. Cursor IDE를 터미널에서 실행해보세요 (환경 변수가 제대로 전달되는지 확인):

```bash
cursor .
```

#### API 키가 유효하지 않은 경우

1. Notion Integration 페이지에서 API 키를 다시 확인합니다.
2. 환경 변수에 올바른 API 키가 설정되어 있는지 확인합니다.
3. Notion 페이지에 Integration이 연결되어 있는지 확인합니다.

#### 권한 오류가 발생하는 경우

1. 접근하려는 Notion 페이지에 Integration이 연결되어 있는지 확인합니다.
2. Integration에 필요한 권한이 부여되어 있는지 확인합니다.

## 4. 추가 정보

### 4.1 관련 파일

- `.cursor/mcp.json`: MCP 서버 설정 파일
- `.cursor/scripts/notion-mcp-wrapper.sh`: Notion MCP 서버 wrapper 스크립트

### 4.2 참고 자료

- [Notion API 문서](https://developers.notion.com/)
- [Model Context Protocol (MCP) 문서](https://modelcontextprotocol.io/)
- [Cursor IDE 문서](https://cursor.sh/docs)

### 4.3 지원

문제가 발생하거나 질문이 있으면 팀에 문의하세요.

