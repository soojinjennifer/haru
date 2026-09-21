/** Adapter 공통 helper 모음 — 도메인 Mock/Http Adapter 는 여기만 import 한다 (API_CONTRACTS §5.2 "중복 방지"). */
export { parseRequest, parseResponse, type ParseOptions } from './parseResponse';
export {
  buildErrorEnvelope,
  isHaruApiError,
  isNetworkError,
  NetworkError,
  toErrorEnvelope,
  toHaruApiError,
  type BuildErrorOptions,
} from './toErrorEnvelope';
export { createImmediateTimer, createRealTimer, withDelay, type Timer } from './withDelay';
export { createRequestId, readRequestId, REQUEST_ID_HEADER } from './requestId';
