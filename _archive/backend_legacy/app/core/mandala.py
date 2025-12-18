
import io
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
from app.core.calculations import calculator

def render_mandala_card(user_input: dict, timestamp: datetime = None) -> bytes:
    """
    Renders a Mandala Card based on the user's natal data and current transits.
    Returns: Binary content of the PNG image.
    """
    if timestamp is None:
        timestamp = datetime.utcnow()

    # 1. Calculate Core Blueprint (Natal)
    # We expect user_input to have dt (UTC datetime), lat, lon
    # For now, we reuse the robust calculator in core/calculations.py
    # But usually natal is fixed. Let's assume we re-calculate or pass in the natal chart.

    # Mocking natal calculation for the visualizer as we might not have the raw inputs here
    # Ideally, we fetch the stored chart data.
    # For this function, let's calculate fresh based on input.

    natal_chart = calculator.calculate(user_input['dt'], user_input['lat'], user_input['lon'])

    # 2. Setup Figure
    # Aspect Ratio 3:4 (e.g. 1200x1600)
    fig = plt.figure(figsize=(12, 16), facecolor='black')
    ax = fig.add_subplot(111, polar=True)
    ax.set_facecolor('black')

    # Remove standard grid
    ax.grid(False)
    ax.set_xticklabels([])
    ax.set_yticklabels([])
    ax.spines['polar'].set_visible(False)

    # 3. Draw Geometry
    # "Sovereign Gold" = #D4AF37, "Technical Red" = #FF0033

    # Base Ring (The Void)
    r_base = np.linspace(0, 2*np.pi, 1000)
    ax.plot(r_base, [10]*1000, color='#333333', linewidth=1, alpha=0.5)

    # Render Planets
    bodies = [
        (natal_chart.sun, '#D4AF37', 20),      # Sun - Gold
        (natal_chart.earth, '#2288FF', 15),     # Earth - Blue
        (natal_chart.moon, '#EEEEEE', 15),      # Moon - Silver
        (natal_chart.mars, '#FF0033', 12),      # Mars - Red
        (natal_chart.venus, '#00FF88', 12),     # Venus - Green
    ]

    for planet, color, size in bodies:
        # Longitude 0-360 converted to radians
        theta = np.deg2rad(planet.longitude)
        r = 8 # Orbital radius (stylized)

        # Plot Point
        ax.scatter(theta, r, c=color, s=size*10, alpha=0.9, edgecolors='white', linewidth=1)

        # Draw "Ray" to center (Coherence Line)
        ax.plot([theta, theta], [0, r], color=color, alpha=0.3, linewidth=1)

    # 4. Generate "Crystalline" Pattern based on Aspects
    # Simple logic: If planets are trine (120 deg) or sextile (60 deg), draw connecting lines.

    for i, (p1, c1, _) in enumerate(bodies):
        for j, (p2, c2, _) in enumerate(bodies):
            if i >= j: continue

            diff = abs(p1.longitude - p2.longitude)
            if diff > 180: diff = 360 - diff

            # Allow 5 degree orb
            is_trine = abs(diff - 120) < 5
            is_square = abs(diff - 90) < 5

            if is_trine:
                # Synergy Line (Gold/Green)
                t1 = np.deg2rad(p1.longitude)
                t2 = np.deg2rad(p2.longitude)
                ax.plot([t1, t2], [8, 8], color='#D4AF37', linewidth=2, alpha=0.8)

            if is_square:
                # Friction Line (Red)
                t1 = np.deg2rad(p1.longitude)
                t2 = np.deg2rad(p2.longitude)
                ax.plot([t1, t2], [8, 8], color='#FF0033', linewidth=1.5, linestyle='dashed')

    # 5. Output
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', pad_inches=0, dpi=150, transparent=True)
    buf.seek(0)
    plt.close(fig)

    return buf.getvalue()
