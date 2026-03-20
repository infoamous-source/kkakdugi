#!/bin/bash
# Claude Code 도구 사용 시 활동 로그 + 에이전트 상태 업데이트

ENV_FILE="/Users/suni/amous/.env.local"
if [ -f "$ENV_FILE" ]; then
  SUPABASE_URL="${SUPABASE_URL:-$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2-)}"
  SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d= -f2-)}"
else
  SUPABASE_URL="${SUPABASE_URL:-}"
  SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
fi

AGENT_ROLE="${AGENT_ROLE:-developer}"
AGENT_ID="${AGENT_ID:-agent-dev}"
PROJECT_ID="${PROJECT_ID:-}"
TOOL_NAME="${1:-unknown}"
TOOL_INPUT="${2:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  exit 0
fi

case "$TOOL_NAME" in
  Write|Edit|Bash|NotebookEdit)
    SAFE_INPUT=$(echo "${TOOL_INPUT:0:200}" | sed 's/"/\\"/g' | tr -d '\n\r')

    # 1) 활동 로그 기록
    curl -s -X POST \
      "${SUPABASE_URL}/rest/v1/amous_activity_logs" \
      -H "apikey: ${SUPABASE_KEY}" \
      -H "Authorization: Bearer ${SUPABASE_KEY}" \
      -H "Content-Type: application/json" \
      -d "{\"agent_role\": \"${AGENT_ROLE}\", \"project_id\": \"${PROJECT_ID}\", \"action\": \"tool_use\", \"detail\": \"${TOOL_NAME}: ${SAFE_INPUT}\"}" \
      > /dev/null 2>&1

    # 2) 에이전트 상태 → working + 현재 프로젝트 추가
    if [ -n "$AGENT_ID" ] && [ -n "$PROJECT_ID" ]; then
      curl -s -X PATCH \
        "${SUPABASE_URL}/rest/v1/agents?id=eq.${AGENT_ID}" \
        -H "apikey: ${SUPABASE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"status\": \"working\", \"current_projects\": [\"${PROJECT_ID}\"]}" \
        > /dev/null 2>&1
    fi
    ;;
esac
