#!/usr/bin/env node
// Stage 1-A 시점에 대상 패키지가 없어 실질적인 작업이 없는 root script 알림.
// 가짜 성공 메시지를 내지 않고, "아직 비어 있다"는 사실과 채워질 Stage 를 그대로 출력한다.

const [, , scriptName = '(unknown)', reason = ''] = process.argv;

console.log(`[${scriptName}] NO-OP — Stage 1-A 에는 실행할 대상이 없습니다.`);
if (reason) console.log(`[${scriptName}] ${reason}`);
console.log(`[${scriptName}] 이 스크립트는 대상 패키지가 추가되면 실제 작업을 수행합니다.`);
