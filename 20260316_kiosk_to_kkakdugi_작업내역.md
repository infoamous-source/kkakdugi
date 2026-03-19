# Kiosk → Kkakdugi 전체 리네이밍 작업내역

**날짜:** 2026-03-16
**작업:** 프로젝트 내 모든 `kiosk` 경로/코드명을 `kkakdugi`로 변경

---

## 변경 범위

### 사용자에게 보이는 텍스트 (번역 값) — 변경 안 함
- `"키오스크 연습실"`, `"Kiosk Practice"` 등 UI에 표시되는 문구는 그대로 유지

### 변경된 항목

#### 1. 소스 파일 내용 (65개+ 파일)
- 타입명: `KioskType` → `KkakdugiType`, `KioskConfig` → `KkakdugiConfig` 등
- 변수명: `kioskRegistry` → `kkakdugiRegistry`, `kioskConfigs` → `kkakdugiConfigs` 등
- 함수명: `getKioskEntry` → `getKkakdugiEntry`
- import 경로 전부 업데이트
- CSS 클래스/주석 업데이트

#### 2. 파일명 변경 (14개)
| Before | After |
|--------|-------|
| `KioskSimulator.tsx` | `KkakdugiSimulator.tsx` |
| `KioskSelector.tsx` | `KkakdugiSelector.tsx` |
| `kioskData.ts` | `kkakdugiData.ts` |
| `KioskFrame.tsx` | `KkakdugiFrame.tsx` |
| `KioskHelper.tsx` | `KkakdugiHelper.tsx` |
| `KioskPracticePage.tsx` | `KkakdugiPracticePage.tsx` |
| `CafeKiosk.tsx` | `CafeKkakdugi.tsx` |
| `FastfoodKiosk.tsx` | `FastfoodKkakdugi.tsx` |
| `HospitalKiosk.tsx` | `HospitalKkakdugi.tsx` |
| `BankKiosk.tsx` | `BankKkakdugi.tsx` |
| `GovernmentKiosk.tsx` | `GovernmentKkakdugi.tsx` |
| `CinemaKiosk.tsx` | `CinemaKkakdugi.tsx` |
| `ConvenienceKiosk.tsx` | `ConvenienceKkakdugi.tsx` |
| `AirportKiosk.tsx` | `AirportKkakdugi.tsx` |

#### 3. 디렉토리명 변경 (2개)
| Before | After |
|--------|-------|
| `src/components/digital/KioskSimulator/` | `src/components/digital/KkakdugiSimulator/` |
| `KioskSimulator/kiosks/` | `KkakdugiSimulator/kkakdugis/` |

#### 4. i18n 번역 키 (en, ko JSON)
- 최상위 키: `"kiosk"` → `"kkakdugi"`
- 하위 키: `whatIsKiosk` → `whatIsKkakdugi`, `kioskPractice` → `kkakdugiPractice` 등
- 총 115개 키 정상 전환, 값(사용자 텍스트)은 유지

#### 5. 마크다운 문서 (12개)
- 작업내역, 교육제안서 등 문서 내 kiosk → kkakdugi 치환

---

## 검증 결과

| 항목 | 결과 |
|------|------|
| 소스 코드 내 kiosk 잔존 참조 | **0건** |
| kiosk 이름 파일/디렉토리 | **0개** |
| JSON 키 구조 | **kkakdugi로 정상 전환** |
| i18n 키 매핑 (115개) | **전부 일치** |
| 리네이밍으로 인한 새 오류 | **0건** |
| Vite 빌드 | **성공 (2.25s)** |

---

## 변경하지 않은 항목
- 프로젝트 루트 디렉토리명 (`/Users/suni/kiosk`)
- 배포 URL (`github.io/kiosk/`, Vercel) — 별도 설정 필요
- 사용자에게 보이는 번역 텍스트 값
