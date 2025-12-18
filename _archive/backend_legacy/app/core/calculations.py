import swisseph as swe
import pytz
from datetime import datetime
from timezonefinder import TimezoneFinder
from geopy.geocoders import Nominatim
from pydantic import BaseModel
from typing import List, Dict, Tuple, Optional
import os
import math

# Configure Swiss Ephemeris
# If no path is set, it looks in standard locations.
# We assume the library installation includes basic ephe or we run in 'mosh' mode (less precise without files, but okay for v1)

class PlanetPosition(BaseModel):
    name: str
    longitude: float
    gate: int
    line: int
    zodiac_sign: str

class ChartData(BaseModel):
    sun: PlanetPosition
    earth: PlanetPosition
    moon: PlanetPosition
    north_node: PlanetPosition
    south_node: PlanetPosition
    # Extended for full HD
    mercury: PlanetPosition
    venus: PlanetPosition
    mars: PlanetPosition
    jupiter: PlanetPosition
    saturn: PlanetPosition
    uranus: PlanetPosition
    neptune: PlanetPosition
    neptune: PlanetPosition
    pluto: PlanetPosition

class ForecastEvent(BaseModel):
    date: str
    title: str
    description: str
    intensity: int # 1-10
    type: str # 'ALIGNMENT' | 'TRANSIT' | 'VOID'

ZODIAC_SIGNS = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
]

# HD Wheel Order (Starting from 0 Aries)
# 0 Aries is inside Gate 25. Gate 25 starts at 354.375 degrees (approx).
# Actually, let's use the precise degree mapping.
# Each gate is 5.625 degrees.
# Gate 41 starts the year at Aquarius approx 2 degrees.
# Let's use a reference point: 0 Aries = Gate 17 line ? No.
# Reference: 0 Gemini = Gate 20 line 6.
# Easiest way: The wheel starts at Gate 41. Gate 41.1 starts at 302.25 degrees (approx).
# Wait, let's use the list and find the index.
# The standard list starts from Gate 1 at Scorpio? No.
# Standard List usually starts with Gate 41 (The Start of the Year).
# BUT, we can map 0-360 to the wheel index.
# Wheel Order (Counter-Clockwise from 0 Aries? No, HD wheel is complex).
# Standard Hexagram around the wheel (starting 41 at ~302 deg):
# 41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60
# This matches the RAV Wheel. Gate 41 is at Aquarius.
# We need to rotate longitude so that 0 is the start of Gate 41?
# No, let's map standard zodiac longitude to this list.
# Gate 41 starts at 302° 15' (302.25°).
# So if lon = 302.25, that is 0.00 of Gate 41.
# We offset everything by -302.25.
# If result < 0, add 360.
# Then divide by 5.625 to get index in the list.

HD_GATES_ORDER = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24,
    2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4,
    29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34,
    9, 5, 26, 11, 10, 58, 38, 54, 61, 60
]

def get_zodiac(longitude: float) -> str:
    idx = int(longitude / 30)
    return ZODIAC_SIGNS[idx % 12]

def get_hd_coords(longitude: float) -> Tuple[int, int]:
    """
    Returns (Gate, Line).
    Reference: Gate 41 start = 302.25 degrees.
    """
    # Normalize to 0-360
    lon = longitude % 360

    # Offset so 0 = Start of Gate 41
    # If lon is 302.25, adjusted should be 0.
    adjusted_lon = (lon - 302.25) % 360

    # Each gate is 5.625 degrees (360 / 64)
    gate_idx_float = adjusted_lon / 5.625
    gate_idx = int(gate_idx_float)

    if gate_idx >= 64: gate_idx = 0 # Safety

    gate = HD_GATES_ORDER[gate_idx]

    # Each line is 1/6th of a gate (0.9375 degrees)
    # Fraction of the gate
    gate_fraction = gate_idx_float - gate_idx
    line = int(gate_fraction * 6) + 1 # 1-6

    return gate, line

class ChartCalculator:
    def __init__(self):
        self.tf = TimezoneFinder()
        # Initialize geolocator with a user agent
        self.geolocator = Nominatim(user_agent="defrag_app_v1")

    def get_lat_lon(self, location_str: str) -> Tuple[float, float]:
        """
        Geocodes a location string to (lat, lon).
        Returns Berlin (52.52, 13.40) as fallback if failed.
        """
        try:
            loc = self.geolocator.geocode(location_str)
            if loc:
                return loc.latitude, loc.longitude
        except Exception as e:
            print(f"Geocoding error: {e}")

        # Fallback to Berlin
        return 52.52, 13.40

    def calculate(self, dt: datetime, lat: float, lon: float) -> ChartData:
        # 1. Julian Day
        # Input dt should be in UTC.
        # If naive, assume UTC.

        jd = swe.julday(dt.year, dt.month, dt.day, dt.hour + dt.minute/60.0 + dt.second/3600.0)

        # 2. Calculate Planets
        planets = {}
        for body_id, name in [
            (swe.SUN, "Sun"), (swe.MOON, "Moon"), (swe.MEAN_NODE, "North Node"),
            (swe.MERCURY, "Mercury"), (swe.VENUS, "Venus"), (swe.MARS, "Mars"),
            (swe.JUPITER, "Jupiter"), (swe.SATURN, "Saturn"), (swe.URANUS, "Uranus"),
            (swe.NEPTUNE, "Neptune"), (swe.PLUTO, "Pluto")
        ]:
            res = swe.calc_ut(jd, body_id)
            longk = res[0][0]
            gate, line = get_hd_coords(longk)
            planets[name.lower().replace(" ", "_")] = PlanetPosition(
                name=name,
                longitude=longk,
                gate=gate,
                line=line,
                zodiac_sign=get_zodiac(longk)
            )

        # 3. Calculate Derived Points
        # Earth is exactly opposite Sun
        earth_lon = (planets["sun"].longitude + 180) % 360
        e_gate, e_line = get_hd_coords(earth_lon)
        earth = PlanetPosition(name="Earth", longitude=earth_lon, gate=e_gate, line=e_line, zodiac_sign=get_zodiac(earth_lon))

        # South Node is opposite North Node
        sn_lon = (planets["north_node"].longitude + 180) % 360
        sn_gate, sn_line = get_hd_coords(sn_lon)
        south_node = PlanetPosition(name="South Node", longitude=sn_lon, gate=sn_gate, line=sn_line, zodiac_sign=get_zodiac(sn_lon))

        return ChartData(
            sun=planets["sun"],
            earth=earth,
            moon=planets["moon"],
            north_node=planets["north_node"],
            south_node=south_node,
            mercury=planets["mercury"],
            venus=planets["venus"],
            mars=planets["mars"],
            jupiter=planets["jupiter"],
            saturn=planets["saturn"],
            uranus=planets["uranus"],
            neptune=planets["neptune"],
            pluto=planets["pluto"]
        )

    def get_forecast(self, natal_chart: ChartData, days: int = 7) -> List[ForecastEvent]:
        events = []
        now = datetime.utcnow()

        # Simple Transit Logic for V1
        # Check Next 7 Days
        for i in range(days):
            check_date = now + datetime.timedelta(days=i)
            # Calculate transits for noon UTC
            jd = swe.julday(check_date.year, check_date.month, check_date.day, 12.0)

            # 1. Transiting Sun Conjunct Natal Sun (Solar Return approximate)
            res = swe.calc_ut(jd, swe.SUN)
            t_sun_lon = res[0][0]

            if abs(t_sun_lon - natal_chart.sun.longitude) < 1:
                events.append(ForecastEvent(
                    date=check_date.strftime("%Y-%m-%d"),
                    title="Solar Return Alignment",
                    description="Your annual reset point. High vital energy. Initiate new cycles.",
                    intensity=10,
                    type="ALIGNMENT"
                ))

            # 2. Transiting Moon Conjunct Natal Sun (New Moon Personal)
            res_moon = swe.calc_ut(jd, swe.MOON)
            t_moon_lon = res_moon[0][0]

            if abs(t_moon_lon - natal_chart.sun.longitude) < 6: # Moon moves fast (~12 deg/day), wide orb
                events.append(ForecastEvent(
                    date=check_date.strftime("%Y-%m-%d"),
                    title="Lunar-Solar Fusion",
                    description="Emotional clarity aligns with purpose. Good for decision making.",
                    intensity=7,
                    type="ALIGNMENT"
                ))

            # 3. Transiting Sun in specific Gates (General Weather)
            gate, line = get_hd_coords(t_sun_lon)
            # Example: Kariotic Alignment if Sun is in a pressure gate (e.g., Gate 61, 60, 41)
            pressure_gates = [61, 60, 41]
            if gate in pressure_gates:
                 events.append(ForecastEvent(
                    date=check_date.strftime("%Y-%m-%d"),
                    title=f"Pressure Gradient (Gate {gate})",
                    description=f"Global transit activation. The field is pressurized for initiation.",
                    intensity=6,
                    type="TRANSIT"
                ))

        return events

calculator = ChartCalculator()

calculator = ChartCalculator()
