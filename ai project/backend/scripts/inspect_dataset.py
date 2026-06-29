"""Inspect any Zameen-style dataset CSV before cleaning/training."""
import sys
from pathlib import Path

import pandas as pd

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.ml.preprocessing import (
    DatasetValidationError,
    format_inspection_report,
    inspect_dataset,
    resolve_dataset_path,
    validate_dataset,
)


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else None
    csv_path = resolve_dataset_path(path)
    df = pd.read_csv(csv_path)
    report = inspect_dataset(df, path=str(csv_path))
    print(format_inspection_report(report))

    try:
        validate_dataset(df, path=str(csv_path))
        print("\nVALIDATION: PASSED — safe to train/seed with this file.")
    except DatasetValidationError as exc:
        print(f"\nVALIDATION: FAILED — {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
