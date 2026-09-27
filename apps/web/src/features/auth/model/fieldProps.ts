/**
 * `exactOptionalPropertyTypes` 대응 helper.
 *
 * tsconfig 가 `exactOptionalPropertyTypes: true` 라서 `errorText={undefined}` 처럼
 * **명시적 undefined 를 넘길 수 없다**. 값이 있을 때만 prop 을 붙이도록 객체를 만든다.
 * (`packages/ui` 의 prop 타입을 느슨하게 바꾸는 대신 호출부에서 해결한다.)
 */
export function errorProp(message: string | undefined): { errorText?: string } {
  return message === undefined ? {} : { errorText: message };
}

export function helperProp(message: string | undefined): { helperText?: string } {
  return message === undefined ? {} : { helperText: message };
}

export function nameProp(name: string | undefined): { name?: string } {
  return name === undefined ? {} : { name };
}
