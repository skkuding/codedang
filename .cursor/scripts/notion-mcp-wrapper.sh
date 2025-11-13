#!/bin/bash
# Notion MCP 서버 wrapper 스크립트
# 시스템 환경 변수 NOTION_API_KEY를 NOTION_TOKEN으로 전달

# 프로젝트 루트로 이동 (스크립트 위치 기준)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# 환경 변수 설정
export NOTION_TOKEN="${NOTION_API_KEY}"

# Notion MCP 서버 실행
exec npx -y @notionhq/notion-mcp-server "$@"

