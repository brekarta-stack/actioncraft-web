# NAS 운영 스크립트 (HANDOFF #2·#4)

| 파일 | 역할 | 트리거 |
|---|---|---|
| `hc-ping.sh` | NAS 생존 하트비트 → healthchecks.io | cron 5분 (URL 파일 있을 때만 동작) |
| `backup-daily.sh` | pg_dump+글로벌 / n8n 워크플로·크리덴셜(암호화)·런타임설정 / Kuma 데이터 / .env·N8N_ENCRYPTION_KEY 사본 → 다른 볼륨, 14일 보존, 무결성 검증 | cron 매일 03:30 KST |
| `install-cron.sh` | 위 둘을 `/usr/local/sbin/ab-*.sh`(root 소유)로 복사 후 `/etc/cron.d/agent-backbone` 설치(멱등) | root 1회 |

## 설치 (NAS에서)
```sh
sudo sh <scripts경로>/install-cron.sh <COMPOSE_DIR> <BACKUP_ROOT>
```
- `BACKUP_ROOT`는 **compose 볼륨과 다른 물리 볼륨**(예: `/volume2/...`)이 원칙. 단일 볼륨뿐이면 일단 같은 볼륨에 두고 STATE.md에 제약 기록.
- cron은 **sbin의 root 소유 사본**을 실행한다 → 스크립트 수정 후엔 install-cron.sh 재실행 필수.
- UGOS 업데이트가 시스템 파일을 리셋할 수 있음 → 업데이트 후 `/etc/cron.d/agent-backbone` 존재 재확인.
- 설치 직후 1회: NAS cron이 `/etc/cron.d`를 읽는지 하트비트 첫 핑(또는 syslog)으로 검증. 미지원이면 root `crontab -e` 폴백.

## 활성화 (사용자 액션 후)
- healthchecks.io 체크 2개 권장: **nas-alive**(주기 5분, grace 5분) / **backup-daily**(주기 1일, grace 6시간).
```sh
echo 'https://hc-ping.com/<uuid-alive>'  > <COMPOSE_DIR>/heartbeat.url
echo 'https://hc-ping.com/<uuid-backup>' > <COMPOSE_DIR>/heartbeat-backup.url
```

## 오프사이트 B2 (사용자가 계정 발급 후)
1. B2 버킷 + 앱키 발급, restic 설치(정적 바이너리).
2. `<COMPOSE_DIR>/restic.env` 작성 — **root 소유 + chmod 600 필수**(아니면 스크립트가 건너뜀):
```
RESTIC_REPOSITORY=b2:<bucket>:agent-backbone
RESTIC_PASSWORD=<강한 암호>
B2_ACCOUNT_ID=<keyID>
B2_ACCOUNT_KEY=<applicationKey>
```
3. `restic init` 1회 → 다음 일일백업부터 자동 업로드.
4. ⚠️ **RESTIC_PASSWORD는 패스워드매니저 등 NAS 밖에 에스크로** — NAS 전손 시 이 암호 없으면 B2 사본도 못 연다.

## 백업 범위 제외(의도)
- n8n `binaryData`(파일시스템 모드 미사용 전제 — 사용 시작하면 tar 추가).
- `backup.log`는 회전 없음(하루 수십 줄 — 수년 무해). 거슬리면 연 1회 truncate.

## 복원 리허설 (2주차 말, 요약)
```sh
# 1) Postgres: 임시 인스턴스 기동 후 로드
docker run -d --name pg-restore-test -e POSTGRES_PASSWORD=t pgvector/pgvector:0.8.5-pg17-bookworm
gzip -dc pg_<db>.sql.gz | docker exec -i pg-restore-test psql -U postgres
# 2) n8n: 새 볼륨 + env.backup의 N8N_ENCRYPTION_KEY(또는 n8n_runtime_config.json의 encryptionKey)로 기동
#    → n8n import:workflow / import:credentials
# 핵심 검증: 크리덴셜이 실제 해독되는가(키 일치), 워크플로 개수 일치, Kuma tar 풀어 kuma.db 존재
```
