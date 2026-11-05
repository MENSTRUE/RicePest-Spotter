# Backend ? RicePest Spotter

## Purpose
Provide an API for YOLO11n pest detection
and visible-object counting.

## Planned architecture
- app/main.py: FastAPI entrypoint
- app/api/routes/: endpoint definitions
- app/core/: configuration
- app/inference/: model loading and inference
- app/schemas/: response and validation contracts
- app/services/: image processing utilities
- tests/: API and inference tests

## Planned API contracts
Health/readiness endpoint, image prediction endpoint,
and structured detection/counting response.

A prediction response should identify model version,
class IDs, boxes, scores, per-class counts, and
inference parameters.

## Security
Validate MIME, decoded image, file size and image dimensions.
Reject malformed or oversized uploads.
Never execute uploaded content.
Avoid persisting photographs by default.

## Current status
Not implemented or verified.
No functional API or model-loading claim is made.

Dependencies and run commands will be documented
after the actual implementation is available.
