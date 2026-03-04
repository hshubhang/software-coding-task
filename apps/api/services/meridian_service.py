import joblib
import numpy as np
from meridian.analysis import analyzer as meridian_analyzer


def load_model(pkl_path: str):
    return joblib.load(pkl_path)


def _get_analyzer(m):
    return meridian_analyzer.Analyzer(m)


def extract_summary(m) -> dict:
    """Extract high-level KPIs using Analyzer.summary_metrics()."""
    a = _get_analyzer(m)
    sm = a.summary_metrics()

    channels = list(m.input_data.media_channel.values)
    times = list(m.input_data.time.values)
    kpi = m.input_data.kpi.values[0]
    spend = m.input_data.media_spend.values[0]

    # Media-driven % from "All Channels" posterior mean
    media_driven_pct = float(
        sm["pct_of_contribution"].sel(channel="All Channels", metric="mean", distribution="posterior").values
    )

    return {
        "channels": channels,
        "time_range": {"start": str(times[0]), "end": str(times[-1]), "weeks": len(times)},
        "total_spend": float(spend.sum()),
        "total_revenue": float(kpi.sum()),
        "media_driven_pct": media_driven_pct,
    }


def extract_roi(m) -> dict:
    """Extract ROI per channel from summary_metrics()."""
    a = _get_analyzer(m)
    sm = a.summary_metrics()
    roi = sm["roi"].sel(distribution="posterior")
    channels = list(m.input_data.media_channel.values)

    result = []
    for ch in channels:
        ch_roi = roi.sel(channel=ch)
        result.append({
            "channel": ch,
            "mean": float(ch_roi.sel(metric="mean").values),
            "median": float(ch_roi.sel(metric="median").values),
            "ci_lower": float(ch_roi.sel(metric="ci_lo").values),
            "ci_upper": float(ch_roi.sel(metric="ci_hi").values),
        })

    return {"channels": result}


def extract_contribution(m) -> dict:
    """Extract channel contribution using summary_metrics()."""
    a = _get_analyzer(m)
    sm = a.summary_metrics()
    posterior = sm.sel(distribution="posterior", metric="mean")
    channels = list(m.input_data.media_channel.values)

    contributions = []
    for ch in channels:
        ch_data = posterior.sel(channel=ch)
        contributions.append({
            "channel": ch,
            "incremental_revenue": float(ch_data["incremental_outcome"].values),
            "spend": float(ch_data["spend"].values),
            "spend_pct": float(ch_data["pct_of_spend"].values),
            "contribution_pct": float(ch_data["pct_of_contribution"].values),
            "roi": float(ch_data["roi"].values),
            "cpm": float(ch_data["cpm"].values),
        })

    kpi_total = float(m.input_data.kpi.values.sum())
    media_total = sum(c["incremental_revenue"] for c in contributions)
    baseline = kpi_total - media_total

    return {
        "contributions": contributions,
        "baseline": baseline,
        "total_revenue": kpi_total,
    }


def extract_response_curves(m) -> dict:
    """Extract response curve data using Analyzer.response_curves() and marginal_roi()."""
    a = _get_analyzer(m)
    multipliers = [round(x, 2) for x in np.linspace(0, 2.5, 30).tolist()]
    rc = a.response_curves(spend_multipliers=multipliers)

    channels = list(rc.coords["channel"].values)
    spend_data = m.input_data.media_spend.values[0]  # (74, 8)

    # Get marginal ROI at current spend (mean across chains and draws)
    mroi_tensor = a.marginal_roi()  # (n_chains, n_draws, n_channels)
    mroi_mean = mroi_tensor.numpy().mean(axis=(0, 1))  # (n_channels,)

    curves = []
    for i, ch in enumerate(channels):
        total_spend = float(spend_data[:, i].sum())
        spend_points = [float(v) for v in rc["spend"].values[:, i]]
        response_points = [float(v) for v in rc["incremental_outcome"].values[:, i, 0]]  # mean

        curves.append({
            "channel": ch,
            "current_spend": total_spend,
            "spend_points": spend_points,
            "response_points": response_points,
            "marginal_roi": float(mroi_mean[i]),
        })

    return {"curves": curves}


def extract_spend(m) -> dict:
    """Extract spend over time per channel (raw input data)."""
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
