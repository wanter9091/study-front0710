# 1단계: 빌드 단계
FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

# 의존성 설치
COPY pnpm-lock.yaml ./
COPY package.json ./
RUN pnpm install

# 나머지 소스 복사 후 빌드
COPY . .
RUN pnpm build && pnpm export

# 2단계: 정적 파일을 Nginx로 서빙
FROM nginx:stable-alpine

# 빌드된 결과물 복사 (Vite나 CRA는 보통 dist 또는 build 폴더로 나옴)
COPY --from=builder /app/dist /usr/share/nginx/html

# (선택) Nginx 설정 덮어쓰기
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 외부 포트 노출
EXPOSE 80



# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]

