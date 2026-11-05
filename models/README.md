# Models

## Existing research model
Architecture: Ultralytics YOLO11n.
Task: Multi-class pest object detection and counting.
Source: Original Day 32 Kaggle V3 experiment.

Expected artifact names:
- best.pt
- last.pt
- best.onnx, if verified

These are expected names from the experiment workflow,
not evidence that files have already been imported.

## Required metadata
- Original 30-class ID order
- Input resolution and preprocessing
- Checkpoint source and SHA-256
- Ultralytics version
- Detection confidence and IoU settings
- Export and runtime parity status
- Validation results and limitations

Do not merge source categories sharing display names.

Large weights are ignored by default Git rules.
Use a reviewed external distribution method.

Status: Awaiting local checkpoint inventory
and independent loading verification.
