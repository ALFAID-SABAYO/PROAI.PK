"""Dataset validation, inspection, and column normalization for Zameen CSVs."""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
import pandas as pd

TARGET_CITIES = {"karachi", "islamabad"}

# Canonical name -> accepted source column names (first match wins)
COLUMN_ALIASES: dict[str, list[str]] = {
    "property_id": ["property_id", "id", "listing_id"],
    "property_type": ["property_type", "type", "Property Type"],
    "price": ["price", "Price", "price_pkr"],
    "location": ["location", "Location", "locality", "area_name"],
    "city": ["city", "City"],
    "province_name": ["province_name", "province", "Province"],
    "latitude": ["latitude", "lat"],
    "longitude": ["longitude", "lng", "lon"],
    "baths": ["baths", "bathrooms", "Baths"],
    "bedrooms": ["bedrooms", "Beds", "beds"],
    "purpose": ["purpose", "Purpose"],
    "area_type": ["area_type", "Area Type", "area unit", "Area Unit"],
    "area_size": ["area_size", "Area Size", "area", "Area"],
    "area_category": ["area_category", "Area Category"],
    "page_url": ["page_url", "url", "link"],
    "agency": ["agency", "Agency"],
    "agent": ["agent", "Agent"],
    "date_added": ["date_added", "date", "Date Added"],
}

REQUIRED_FOR_CLEANING = [
    "price",
    "city",
    "property_type",
    "location",
    "area_type",
    "area_size",
]

REQUIRED_FOR_TRAINING = REQUIRED_FOR_CLEANING  # same set used by build_feature_frame


class DatasetValidationError(ValueError):
    """Raised when a CSV does not meet minimum schema requirements."""

    def __init__(self, message: str, report: dict | None = None):
        super().__init__(message)
        self.report = report or {}


@dataclass
class DatasetInspectionReport:
    path: str | None
    row_count: int
    columns: list[str]
    dtypes: dict[str, str]
    sample_rows: list[dict]
    missing_required: list[str]
    city_value_counts: dict[str, int] = field(default_factory=dict)
    target_city_rows: int = 0
    price_samples: list[str] = field(default_factory=list)
    price_format_notes: str = ""
    extra_columns: list[str] = field(default_factory=list)

    def to_dict(self) -> dict:
        return {
            "path": self.path,
            "row_count": self.row_count,
            "columns": self.columns,
            "dtypes": self.dtypes,
            "sample_rows": self.sample_rows,
            "missing_required": self.missing_required,
            "city_value_counts": self.city_value_counts,
            "target_city_rows": self.target_city_rows,
            "price_samples": self.price_samples,
            "price_format_notes": self.price_format_notes,
            "extra_columns": self.extra_columns,
        }


def resolve_dataset_path(explicit_path: str | None = None) -> Path:
    if explicit_path:
        return Path(explicit_path)
    project_root = Path(__file__).resolve().parents[3]
    data_dir = project_root / "data"
    if data_dir.exists():
        csv_files = list(data_dir.glob("*.csv"))
        if csv_files:
            return csv_files[0]
    root_csv = list(project_root.glob("*.csv"))
    if root_csv:
        return root_csv[0]
    raise FileNotFoundError("No CSV dataset found in project root or /data")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Map known alias column names to canonical names. Leaves unknown columns untouched."""
    df = df.copy()
    rename: dict[str, str] = {}
    lower_map = {c.lower().strip(): c for c in df.columns}

    for canonical, aliases in COLUMN_ALIASES.items():
        if canonical in df.columns:
            continue
        for alias in aliases:
            if alias in df.columns:
                rename[alias] = canonical
                break
            key = alias.lower().strip()
            if key in lower_map:
                rename[lower_map[key]] = canonical
                break

    return df.rename(columns=rename)


def _detect_price_format_notes(series: pd.Series) -> str:
    non_null = series.dropna()
    if non_null.empty:
        return "price column is empty"

    numeric_count = 0
    text_lakh_crore = 0
    unparseable = 0

    for val in non_null.head(500):
        parsed = parse_price_to_numeric(val)
        if parsed is not None:
            numeric_count += 1
        text = str(val).lower()
        if any(k in text for k in ("lakh", "lac", "crore", " cr")):
            text_lakh_crore += 1
        elif parsed is None:
            unparseable += 1

    parts = []
    if numeric_count:
        parts.append(f"~{numeric_count} sample values parse as numeric PKR")
    if text_lakh_crore:
        parts.append(f"~{text_lakh_crore} sample values use Lakh/Crore text")
    if unparseable:
        parts.append(f"~{unparseable} sample values could not be parsed")
    return "; ".join(parts) or "unknown price format"


def inspect_dataset(df: pd.DataFrame, path: str | None = None) -> DatasetInspectionReport:
    normalized = normalize_columns(df)
    present = set(normalized.columns)
    missing = [col for col in REQUIRED_FOR_CLEANING if col not in present]

    city_counts: dict[str, int] = {}
    target_rows = 0
    if "city" in normalized.columns:
        city_series = normalized["city"].astype(str).str.strip()
        city_counts = city_series.value_counts().head(20).to_dict()
        target_rows = int(city_series.str.lower().isin(TARGET_CITIES).sum())

    price_samples: list[str] = []
    price_notes = ""
    if "price" in normalized.columns:
        price_samples = [str(v) for v in normalized["price"].dropna().head(10).tolist()]
        price_notes = _detect_price_format_notes(normalized["price"])

    known_canonical = set(COLUMN_ALIASES.keys())
    extra = [c for c in normalized.columns if c not in known_canonical]

    sample = normalized.head(5).replace({np.nan: None}).to_dict(orient="records")

    return DatasetInspectionReport(
        path=path,
        row_count=len(df),
        columns=list(df.columns),
        dtypes={col: str(dtype) for col, dtype in df.dtypes.items()},
        sample_rows=sample,
        missing_required=missing,
        city_value_counts=city_counts,
        target_city_rows=target_rows,
        price_samples=price_samples,
        price_format_notes=price_notes,
        extra_columns=extra,
    )


def validate_dataset(df: pd.DataFrame, path: str | None = None, min_target_city_rows: int = 1) -> DatasetInspectionReport:
    """Validate schema and basic content. Raises DatasetValidationError on failure."""
    report = inspect_dataset(df, path=path)

    if report.missing_required:
        raise DatasetValidationError(
            "Dataset is missing required columns after normalization: "
            + ", ".join(report.missing_required)
            + f". Found columns: {report.columns}",
            report=report.to_dict(),
        )

    normalized = normalize_columns(df)
    prices = normalized["price"].apply(parse_price_to_numeric)
    parseable = prices.notna().sum()
    if parseable == 0:
        raise DatasetValidationError(
            "No parseable values in 'price' column. "
            "Expected numeric PKR or text like '50 Lakh' / '1.2 Crore'.",
            report=report.to_dict(),
        )

    if report.target_city_rows < min_target_city_rows:
        cities = ", ".join(report.city_value_counts.keys()) or "(none)"
        raise DatasetValidationError(
            f"No rows found for Karachi/Islamabad after city filter. "
            f"City values in file: {cities}",
            report=report.to_dict(),
        )

    return report


def format_inspection_report(report: DatasetInspectionReport) -> str:
    lines = [
        "=" * 60,
        f"Dataset: {report.path or '(in memory)'}",
        f"Rows: {report.row_count}",
        "",
        "--- COLUMNS ---",
        str(report.columns),
        "",
        "--- DTYPES ---",
        "\n".join(f"  {k}: {v}" for k, v in report.dtypes.items()),
        "",
        "--- MISSING REQUIRED (after alias normalization) ---",
        str(report.missing_required) if report.missing_required else "None",
        "",
        "--- CITY VALUE COUNTS (top 20) ---",
        "\n".join(f"  {k}: {v}" for k, v in report.city_value_counts.items()) or "  (no city column)",
        f"Karachi + Islamabad rows: {report.target_city_rows}",
        "",
        "--- PRICE SAMPLES ---",
        *[f"  {s}" for s in report.price_samples],
        f"Notes: {report.price_format_notes}",
        "",
        "--- EXTRA COLUMNS (not mapped) ---",
        str(report.extra_columns) if report.extra_columns else "None",
        "",
        "--- FIRST 5 ROWS (normalized preview) ---",
    ]
    for i, row in enumerate(report.sample_rows, 1):
        lines.append(f"  Row {i}: {row}")
    lines.append("=" * 60)
    return "\n".join(lines)


def parse_price_to_numeric(value) -> float | None:
    """Convert price to PKR numeric. Handles int/float and Lakh/Crore text if present."""
    if pd.isna(value):
        return None
    if isinstance(value, (int, float, np.integer, np.floating)):
        return float(value)

    text = str(value).strip().lower().replace(",", "")
    if not text:
        return None

    # Already plain numeric string
    try:
        return float(text)
    except ValueError:
        pass

    multiplier = 1.0
    if "crore" in text or re.search(r"\bcr\b", text):
        multiplier = 10_000_000
        text = re.sub(r"crore|\bcr\b", "", text)
    elif "lakh" in text or "lac" in text:
        multiplier = 100_000
        text = re.sub(r"lakh|lac", "", text)

    text = text.strip()
    try:
        return float(text) * multiplier
    except ValueError:
        return None


def load_raw_dataset(path: str | None = None) -> pd.DataFrame:
    csv_path = resolve_dataset_path(path)
    return pd.read_csv(csv_path)


def load_and_validate_dataset(path: str | None = None) -> tuple[pd.DataFrame, DatasetInspectionReport]:
    csv_path = resolve_dataset_path(path)
    raw = pd.read_csv(csv_path)
    report = validate_dataset(raw, path=str(csv_path))
    return normalize_columns(raw), report


def clean_dataset(df: pd.DataFrame, *, validate: bool = True) -> pd.DataFrame:
    if validate:
        validate_dataset(df)

    df = normalize_columns(df.copy())

    df["city"] = df["city"].astype(str).str.strip()
    df = df[df["city"].str.lower().isin(TARGET_CITIES)]

    df["price_numeric"] = df["price"].apply(parse_price_to_numeric)
    df = df.dropna(subset=["price_numeric"])
    df = df[df["price_numeric"] > 0]

    for col in ["property_type", "location", "city", "area_type", "area_size"]:
        df = df.dropna(subset=[col])

    df["bedrooms"] = pd.to_numeric(df.get("bedrooms"), errors="coerce").fillna(0).astype(int)
    df["baths"] = pd.to_numeric(df.get("baths"), errors="coerce").fillna(0).astype(int)
    df["area_size"] = pd.to_numeric(df["area_size"], errors="coerce")
    df = df.dropna(subset=["area_size"])
    df["area_size"] = df["area_size"].astype(float)

    df["purpose"] = df.get("purpose", pd.Series(["For Sale"] * len(df))).fillna("For Sale").astype(str)
    df["area_category"] = df.get("area_category", pd.Series([""] * len(df))).fillna("").astype(str)

    if "property_id" in df.columns:
        df = df.drop_duplicates(subset=["property_id"])
    else:
        df = df.drop_duplicates(
            subset=["property_type", "location", "city", "price_numeric", "area_size", "bedrooms"]
        )

    if df.empty:
        raise DatasetValidationError(
            "Cleaning removed all rows. Check city names (Karachi/Islamabad), price values, and required fields."
        )

    return df.reset_index(drop=True)


def build_feature_frame(df: pd.DataFrame) -> tuple[pd.DataFrame, pd.Series]:
    missing = [c for c in REQUIRED_FOR_TRAINING if c not in df.columns]
    if missing:
        raise DatasetValidationError(f"Cannot build features — missing columns: {', '.join(missing)}")

    features = df[
        [
            "property_type",
            "location",
            "city",
            "baths",
            "bedrooms",
            "area_type",
            "area_size",
            "area_category",
            "purpose",
        ]
    ].copy()
    target = df["price_numeric"].copy()
    return features, target
