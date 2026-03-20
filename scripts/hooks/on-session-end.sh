#!/bin/bash
# Claude Code 세션 종료 시 에이전트 상태 → idle

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

curl -s -X PATCH \
  "${SUPABASE_URL}/rest/v1/agents?role=eq.${AGENT_ROLE}" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"idle\", \"current_projects\": []}" \
  > /dev/null 2>&1

curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/amous_activity_logs" \
  -H "apikey: ${SUPABASE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"agent_role\": \"${AGENT_ROLE}\", \"project_id\": \"${PROJECT_ID}\", \"action\": \"session_end\", \"detail\": \"세션 종료\"}" \
  > /dev/null 2>&1
