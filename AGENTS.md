# RicePest Spotter ? Engineering Agent Rules

## Role
Maintain a reproducible, auditable research-to-application
workflow for Day 32/100.

## Source of truth
1. Actual repository code and tests
2. Original executed Kaggle notebook
3. Exported audit and evaluation artifacts
4. Checkpoint metadata and class mapping
5. Verified source dataset documentation

Do not replace empirical evidence with assumptions.

## Filesystem invariants
Maintain the fixed project root structure.
Never create a datasets/ directory.
Never rename root folders without explicit approval.
Do not overwrite existing files before inspection.
Do not create dummy source code or notebooks.

## Data handling
Keep raw training datasets outside Git.
Preserve source category IDs and label mappings.
Never merge duplicate display names without ontology evidence.
Document all removed images and annotations.

## Scientific integrity
Distinguish original images from eligible training images.
Distinguish validation from independent held-out testing.
Do not invent results, visualizations, or model outputs.
Avoid dataset leakage and report audit limitations.

## Model integrity
Use the original trained checkpoint when available.
Verify model loading, class order, input size,
preprocessing, NMS, and inference output.
Do not claim ONNX runtime parity without an actual test.
Avoid unnecessary retraining.

## Backend requirements
Use modular FastAPI components.
Validate uploaded files and all request parameters.
Handle model-loading failures without fake predictions.
Return bounding boxes, class IDs, confidence and
counting metadata with documented semantics.
Write and run relevant API/inference tests.

## Frontend requirements
Use genuine backend responses.
Provide image preview and bounding box visualization.
Provide loading, error, empty and result states.
Support responsive layouts and accessible controls.
Never hardcode predictions as real results.

## Security
Treat every upload and API caller as untrusted.
Do not commit credentials, datasets, or oversized weights.
Do not silently store user-submitted images.

## Documentation
Keep documentation in English and Indonesian.
Document verified features, known limitations, and tests.
Use only genuine plots and screenshots.

## Change workflow
1. Inspect repository and Git status.
2. Inspect the files before editing.
3. Implement the smallest safe change.
4. Run applicable tests.
5. Compare outputs to expected contracts.
6. Update documentation.
7. Review Git diff before committing.

## Definition of done
Code exists, dependencies are documented,
tests have executed, artifacts are traceable,
and claims match the available evidence.

## Prohibited
No fabricated accuracy, mAP, counts, test results,
fake demo screenshots, silent model retraining,
or arbitrary repository restructuring.
