# RicePest Spotter — Day 32/100

Object detection and **visible annotated-box counting**; not an exhaustive insect population census.

Dataset: https://github.com/kkb20334-lang/RicePest-30 — research/noncommercial CC BY-NC 4.0 conditions.
Kaggle input: /kaggle/input/datasets/wafabila/ricepest-dataset

Training: official pretrained yolo11n.pt, seed 42, validation-selected best checkpoint, 65 max epochs with early stopping.
No held-out test provided; all reported metrics are validation only. Unsafe aspect-ratio images and their annotations are excluded rather than mapped speculatively; see audit/eligibility_counts.csv and audit/excluded_source_images.csv.

Validation: precision 0.7405, recall 0.6254, mAP50 0.6977, mAP50:95 0.4337.
Validation box-count MAE 1.5526, RMSE 2.8963, conf=0.25.

Source COCO category IDs preserved (see class mapping); duplicate species display names not automatically merged.
Exact SHA256 train-val image overlap checked (0) on eligible subset; near-duplicate risk remains untested. Source image exclusions and removed annotations are documented in audit/.

Output: models/best.pt, optional best.onnx, reports/, audit/, plots/, demo/, training history.
Original images intentionally excluded from ZIP to limit source redistribution.
