#!/bin/bash
# Claude Code 세션 시작 시 Supabase에 에이전트 상태 업데이트

ENV_FILE="/Users/suni/amous/.env.local"
if [ -f "$ENV_FILE" ]; then
  SUPABASE_URL="${SUPABASE_URL:-$(grep '^NEXT_PUBLIC_SUPABASE_URL=' "$ENV_FILE" | cut -d= -f2-)}"
  SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-$(grep '^SUPABASE_SERVICE_ROLE_KEY=' "$ENV_FILE" | cut -d= -f2-)}"
else
  SUPABASE_URL="${SUPABASE_URL:-}"
  SUPABASE_KEY="${SUPABASE_SERVICE_ROLE_KEY:-}"
fi
AGENT_ROLE="${AGENT_ROLE:-developer}"
PROJECT_ID="${PROJECT_ID:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  exit 0
fi

# 에이전트 상태 → working
curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/agents?role=eq.${AGENT_ROLE}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"working\", \"current_projects\": [\"${PROJECT_ID}\"]}" \
  > /dev/null 2>&1

# 활동 로그 추가
curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/amous_activity_logs" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"agent_role\": \"${AGENT_ROLE}\", \"project_id\": \"${PROJECT_ID}\", \"action\": \"session_start\", \"detail\": \"세션 시작\"}" \
  > /dev/null 2>&1
