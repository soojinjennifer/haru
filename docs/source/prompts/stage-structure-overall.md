Stage 0
Architecture + Figma Mapping + Design System

        ↓

Stage 1
Project Foundation
Monorepo / Router / Layout / UI Components

        ↓

Stage 2
Auth + Caregiver + Child Profile

        ↓

Stage 3
Today Card
Context / Capacity / Book Selection

        ↓

Stage 4
Storytime
Recording + Consent + Storage

        ↓

Stage 5
Post Reading
Reflection + Conversation Guide

        ↓

Stage 6
AI Insight / Recommendation Pipeline

        ↓

Stage 7
Growth Report / Inner Compass / History

        ↓

Stage 8
Privacy / Responsive / Regression / Deploy



전체 기능/Stage 수행 요청

plan-agent
    ↓
design-agent
    ↓
development-agent
    ↓
stage-qa-agent
    ↓
PASS → 다음 Stage
FAIL → development-agent 수정
        ↓
      stage-qa-agent 재검증


## 프론트 엔드 중심 변경 Stage

| Stage | 범위                                                 | Backend 처리          |
| ----- | -------------------------------------------------- | ------------------- |
| **0** | Architecture + Figma + Agent + Contract            | 설계만                 |
| **1** | Project Foundation + Design System + Shared UI     | 없음                  |
| **2** | Auth + Consent + Onboarding + Profile UI           | Mock                |
| **3** | Home + Activity Card + Library + Recommendation UI | Mock                |
| **4** | Storytime + Recording Client UX                    | Upload Contract만    |
| **5** | Reflection + Analysis Status UX                    | Analysis Mock       |
| **6** | Personalization + Profile Update UX                | Recommendation Mock |
| **7** | 4-Week Report + History + PDF UX                   | Report Mock         |
| **8** | Frontend Final QA + Backend Handoff                | **완료 후 STOP**       |
