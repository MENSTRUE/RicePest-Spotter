# RicePest Spotter

**Day 32/100 ? Agriculture | Computer Vision | Object Detection**

## Overview
RicePest Spotter is a research-oriented agricultural pest
detection and object-counting project using YOLO11n.

The intended workflow is:
Field image -> bounding boxes -> class predictions ->
confidence scores -> estimated visible object count.

The project supports preliminary screening, not definitive
pest identification or a complete field-population census.

## Problem statement
Farmers and agricultural extension workers need accessible
initial information about visible pest objects in photographs.

## Target users
- Farmers monitoring visible pest activity
- Agricultural extension workers
- Agricultural AI researchers

## Dataset
RicePest-30 cleaned dataset.

Kaggle input:
`/kaggle/input/datasets/wafabila/ricepest-dataset`

Dataset source and licensing require attribution.
RicePest-30 uses CC BY-NC 4.0 according to the experiment
documentation. Do not redistribute original images without
checking the applicable source conditions.

## Dataset audit
The Kaggle V3 experiment reports:
- 7,915 original training images
- 654 original validation images
- 300 images excluded for unsafe aspect-ratio mismatch
- 7,623 eligible training images
- 646 eligible validation images
- 30 source category IDs
- No exact cross-split SHA-256 overlap among eligible images

These figures are reported from the existing experiment output.
Preserve original audit manifests and exclusion reasons.

## Label integrity
Preserve the official source category IDs.
Two source IDs share the display name
'Anomala corpulenta'; do not merge them automatically.

## Experimental methodology
The existing experiment uses pretrained Ultralytics YOLO11n,
with COCO-to-YOLO conversion after eligibility screening.

Training configuration reported in the notebook:
- Image size: 640
- Maximum epochs: 65
- Batch size: 16
- Seed: 42
- Early stopping patience: 15

## Evaluation boundaries
The supplied dataset has train and validation partitions.
No independent held-out test set has been established.

Do not describe validation metrics as test performance.
Model selection and final evaluation limitations must
remain explicit.

## Counting
Visible-object counting is derived from detections.
A count of bounding boxes is not a field-population census.

## Before ? Now ? Next
Before:
- Obtain and audit RicePest-30 annotations.
- Establish reproducible YOLO training.

Now:
- Kaggle experiment artifacts exist outside this repository.
- Repository structure and artifact verification are underway.

Next:
- Import and verify original notebook and research artifacts.
- Validate the saved model checkpoint.
- Implement FastAPI inference.
- Implement connected React user interface.
- Test end-to-end workflows and complete documentation.

## Repository
- notebooks/: reproducible Kaggle experiments
- models/: verified checkpoints and model documentation
- reports/: audit, metrics, error analysis, manifests
- assets/: real figures, examples, screenshots and diagrams
- backend/: inference API
- frontend/: React application
- docs/: bilingual technical documentation
- scripts/: repeatable utilities

## Application status
Backend and frontend are planned.
Do not claim either is operational before implementation
and successful integration tests.

## Requirements and setup
The original Kaggle notebook uses PyTorch and Ultralytics.
The local application dependency contracts will be established
when implementation begins.

## Reproducibility
Preserve environment versions, official source splits,
source category IDs, annotation conversions, seed,
checkpoint origin, and artifact checksums.

## Security and privacy
Uploaded files must be validated by type, size and content.
Do not persist uploaded photographs without an explicit policy.
Never commit credentials or unreviewed training data.

## Limitations
- No independent held-out test set
- Potential dataset domain shift
- Near-duplicate leakage not comprehensively excluded
- Class ontology ambiguity
- Counting varies with detection thresholds
- Not validated as an agricultural diagnosis system

## Roadmap
1. Audit repository and artifacts
2. Verify checkpoint and inference preprocessing
3. Build and test backend
4. Build and connect frontend
5. Validate application and complete bilingual docs

## License and attribution
See LICENSE for repository code.
Dataset and pretrained-model licensing are separate.
Verify each applicable license before redistribution.

## References
- RicePest-30: source repository and original documentation
- Ultralytics YOLO documentation
- Original Kaggle Day 32 experiment notebook

Exact source URLs and versions will be added from the
verified experiment provenance report.
