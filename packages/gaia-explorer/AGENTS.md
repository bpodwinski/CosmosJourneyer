# gaia-explorer Agent Notes

## Purpose

GaiaExplorer is a Python/uv tool that queries Gaia DR3 and converts nearby stars into voxel-friendly spatial cubes for
Cosmos Journeyer experiments.

It is a data pipeline, not game runtime code. Prioritize deterministic output, schema stability, validation, and clear
CLI behavior.

## Network Boundary

`query.py` performs live Gaia archive queries through `astroquery`. Unit tests should not depend on the live Gaia
service. Mock query results or test ADQL construction and downstream transformation separately.

When changing query filters, be explicit about the scientific/data-quality reason. Parameters such as parallax signal,
RUWE, temperature filters, radius, limits, and cube size affect both completeness and data reliability.

## Output Contract

Generated JSON and gzip outputs are consumed as structured data. Do not change field names, cube IDs, coordinate
normalization, star naming, `nature`, or temperature semantics without updating validation and tests.

Keep output deterministic for the same input table and config. Sorting, stable IDs, and predictable naming matter for
diffs and reproducibility.

## Validation And Tests

Run from this package:

```sh
uv sync
uv run pytest
uv run gaia-explorer --help
uv run gaia-explorer-validate
```

`gaia-explorer-validate` expects the default generated output under `out/`; it is optional unless that file exists or
the task is about generated datasets.

Add tests under `tests/` for CLI parsing, config validation, records, naming, spatial binning, classification,
temperature overrides, and output validation. Keep fixtures small and local.

## Data Hygiene

Do not commit large generated Gaia outputs unless the user explicitly asks and the repository's asset policy is checked.
Prefer documenting generation commands over storing bulky derived datasets.
