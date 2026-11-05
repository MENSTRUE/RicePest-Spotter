export type Health = { status: string; model_ready: boolean; model_name: string; class_count: number; detail: string };
export type Detection = { model_class_id: number; source_category_id: number | null; class_name: string; source_name: string | null; confidence: number; bbox_xyxy: [number, number, number, number] };
export type ClassCount = { model_class_id: number; source_category_id: number | null; class_name: string; count: number };
export type Result = { detections: Detection[]; counts: ClassCount[]; total_count: number; image_width: number; image_height: number; confidence_threshold: number; iou_threshold: number; inference_ms: number; model_name: string; disclaimer: string; model_status: string };
export type HistoryEntry = { id: string; name: string; date: string; count: number; classes: number; result: Result };
