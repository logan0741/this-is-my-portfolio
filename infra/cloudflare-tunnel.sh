#!/bin/bash
# =====================================================
# Cloudflare Tunnel 설정 가이드
# gun-hee.com 도메인 연동용
# =====================================================

# 📋 사전 요구사항:
# 1. Cloudflare 계정에 gun-hee.com 도메인 등록 완료
# 2. cloudflared CLI 설치 (https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)
#    - Windows: winget install --id Cloudflare.cloudflared
#    - Mac: brew install cloudflared
#    - Linux: curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o /usr/local/bin/cloudflared

# =====================================================
# Step 1: Cloudflare 로그인
# =====================================================
cloudflared tunnel login
# → 브라우저가 열림 → Cloudflare 계정 인증 → gun-hee.com 도메인 선택

# =====================================================
# Step 2: 터널 생성
# =====================================================
cloudflared tunnel create portfolio-tunnel
# → 터널 ID 출력됨 (예: a1b2c3d4-e5f6-7890-abcd-1234567890ab)
# → ~/.cloudflared/a1b2c3d4-e5f6-7890-abcd-1234567890ab.json 파일 생성됨

# =====================================================
# Step 3: DNS 라우팅 설정
# =====================================================
# 메인 도메인에 연결 (백엔드 API)
cloudflared tunnel route dns portfolio-tunnel api.gun-hee.com

# 프론트엔드용 (필요 시)
cloudflared tunnel route dns portfolio-tunnel gun-hee.com

# =====================================================
# Step 4: config.yml 생성
# =====================================================
# ~/.cloudflared/config.yml 파일 내용:
cat << 'EOF'
tunnel: portfolio-tunnel
credentials-file: ~/.cloudflared/<TUNNEL_ID>.json

ingress:
  # 백엔드 API (FastAPI - port 8000)
  - hostname: api.gun-hee.com
    service: http://localhost:8000
  
  # 프론트엔드 (Next.js - port 3000)  
  - hostname: gun-hee.com
    service: http://localhost:3000
  
  # Catch-all (필수)
  - service: http_status:404
EOF

# =====================================================
# Step 5: 터널 실행
# =====================================================
# 개발 환경 (포그라운드)
cloudflared tunnel run portfolio-tunnel

# 프로덕션 (백그라운드 서비스로 등록)
# Linux:
# sudo cloudflared service install
# sudo systemctl start cloudflared

# Windows:
# cloudflared service install
# net start cloudflared

# =====================================================
# 🔧 트러블슈팅
# =====================================================
# 터널 상태 확인:
cloudflared tunnel info portfolio-tunnel

# 터널 목록 확인:
cloudflared tunnel list

# 터널 삭제 (필요 시):
# cloudflared tunnel delete portfolio-tunnel

# DNS 정리 (필요 시):
# cloudflared tunnel route dns --remove portfolio-tunnel api.gun-hee.com
