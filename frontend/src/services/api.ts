import type { Health, Result } from '../types/prediction';
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) { let msg = `HTTP ${res.status}`; try { const body = await res.json(); if (typeof body.detail === 'string') msg = body.detail; } catch {} throw new Error(msg); }
  return await res.json() as T;
}
export async function ready(signal?: AbortSignal) { return handle<Health>(await fetch(`${BASE}/api/v1/ready`, {signal})); }
export async function predict(file: File, conf: number, iou: number, signal?: AbortSignal): Promise<Result> {
  const form = new FormData(); form.append('file', file);
  return handle<Result>(await fetch(`${BASE}/api/v1/predict?conf=${conf.toFixed(2)}&iou=${iou.toFixed(2)}&imgsz=640`, {method:'POST', body:form, signal}));
}
