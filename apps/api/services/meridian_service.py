import joblib
import numpy as np
from meridian.analysis import visualizer


def _parse_mean(value_str: str) -> float:
    """Parse mean value from Meridian formatted strings.

    Examples:
        '41.7% (19.8%, 66.4%)' -> 41.7
        '$1,017,859 ($222,172, $2,424,201)' -> 1017859.0
        '1.2 (0.3, 2.9)' -> 1.2
    """
    s = str(value_str).split("(")[0].strip()
    s = s.replace("$", "").replace(",", "").replace("%", "").strip()
    return float(s)


def load_model(pkl_path: str):
    return joblib.load(pkl_path)


def extract_summary(m) -> dict:
    """Extract high-level KPIs and summary table."""
    media_summary = visualizer.MediaSummary(m)
    table = media_summary.summary_table()

    posterior = table[table["distribution"] == "posterior"].copy()
    channels = list(m.input_data.media_channel.values)
    times = list(m.input_data.time.values)
    kpi = m.input_data.kpi.values[0]
    spend = m.input_data.media_spend.values[0]

    all_channels_row = posterior[posterior["channel"] == "All Channels"]
    media_driven_pct = (
        _parse_mean(all_channels_row["% contribution"].values[0])
        if len(all_channels_row) > 0
        else 0.0
    )

    return {
        "channels": channels,
        "time_range": {"start": str(times[0]), "end": str(times[-1]), "weeks": len(times)},
        "total_spend": float(spend.sum()),
        "total_revenue": float(kpi.sum()),
        "media_driven_pct": media_driven_pct,
        "summary_table": posterior.to_dict(orient="records"),
    }


def extract_roi(m) -> dict:
    """Extract ROI per channel with confidence intervals from posteriors."""
    roi = m.inference_data.posterior["roi_m"].values  # (4, 1000, 8)
    channels = list(m.input_data.media_channel.values)

    roi_flat = roi.reshape(-1, roi.shape[-1])  # (4000, 8)
    result = []
    for i, ch in enumerate(channels):
        vals = roi_flat[:, i]
        result.append({
            "channel": ch,
            "mean": float(np.mean(vals)),
            "median": float(np.median(vals)),
            "ci_lower": float(np.percentile(vals, 5)),
            "ci_upper": float(np.percentile(vals, 95)),
            "std": float(np.std(vals)),
        })

    return {"channels": result}


def extract_contribution(m) -> dict:
    """Extract channel contribution to revenue."""
    media_summary = visualizer.MediaSummary(m)
    table = media_summary.summary_table()
    posterior = table[table["distribution"] == "posterior"]

    contributions = []
    for _, row in posterior.iterrows():
        if row["channel"] == "All Channels":
            continue
        contributions.append({
            "channel": row["channel"],
            "incremental_revenue": _parse_mean(row["incremental outcome"]),
            "spend": _parse_mean(row["spend"]),
            "spend_pct": _parse_mean(row["% spend"]),
            "contribution_pct": _parse_mean(row["% contribution"]),
            "roi": _parse_mean(row["roi"]),
            "cpm": _parse_mean(row["cpm"]),
        })

    # Calculate baseline (non-media)
    kpi_total = float(m.input_data.kpi.values.sum())
    media_total = sum(c["incremental_revenue"] for c in contributions)
    baseline = kpi_total - media_total

    return {
        "contributions": contributions,
        "baseline": baseline,
        "total_revenue": kpi_total,
    }


def extract_response_curves(m) -> dict:
    """Extract response curve data points for each channel."""
    channels = list(m.input_data.media_channel.values)
    spend = m.input_data.media_spend.values[0]  # (74, 8)

    # Get posterior parameters for Hill curves
    posterior = m.inference_data.posterior
    ec = posterior["ec_m"].values.reshape(-1, len(channels))  # (4000, 8)
    slope = posterior["slope_m"].values.reshape(-1, len(channels))
    beta = posterior["beta_m"].values.reshape(-1, len(channels))

    curves = []
    for i, ch in enumerate(channels):
        total_spend = float(spend[:, i].sum())
        max_spend = total_spend * 2  # Plot up to 2x current spend

        # Generate spend points
        spend_points = np.linspace(0, max_spend, 50)

        # Hill function: beta * (spend^slope / (ec^slope + spend^slope))
        ec_mean = float(np.mean(ec[:, i]))
        slope_mean = float(np.mean(slope[:, i]))
        beta_mean = float(np.mean(beta[:, i]))

        response_points = []
        for s in spend_points:
            if ec_mean > 0 and slope_mean > 0:
                response = beta_mean * (s ** slope_mean) / (ec_mean ** slope_mean + s ** slope_mean)
            else:
                response = 0
            response_points.append(float(response))

        curves.append({
            "channel": ch,
            "current_spend": total_spend,
            "spend_points": [float(s) for s in spend_points],
            "response_points": response_points,
        })

    return {"curves": curves}


def extract_spend(m) -> dict:
    """Extract spend and media volume over time per channel."""
    channels = list(m.input_data.media_channel.values)
    times = [str(t) for t in m.input_data.time.values]
    spend = m.input_data.media_spend.values[0]  # (74, 8)
    kpi = m.input_data.kpi.values[0]  # (74,)

    weekly_data = []
    for t in range(len(times)):
        row = {"week": times[t], "revenue": float(kpi[t])}
        for i, ch in enumerate(channels):
            row[ch] = float(spend[t, i])
        weekly_data.append(row)

    return {
        "channels": channels,
        "weekly_data": weekly_data,
    }


def extract_all(m) -> dict[str, dict]:
    """Extract all dashboard data from Meridian model."""
    return {
        "summary": extract_summary(m),
        "roi": extract_roi(m),
        "contribution": extract_contribution(m),
        "response_curves": extract_response_curves(m),
        "spend": extract_spend(m),
    }
