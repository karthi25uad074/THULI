def calculate_eta(distance_km, rainfall_mm, slope_deg, river_level):
    """
    Simple hydrology-inspired ETA estimation.
    Returns ETA in minutes.
    """

    speed = 0.8

    if rainfall_mm >= 20:
        speed += 0.7

    if rainfall_mm >= 50:
        speed += 0.8

    if slope_deg >= 20:
        speed += 0.6

    if slope_deg >= 35:
        speed += 0.5

    speed += river_level * 0.2

    distance_m = distance_km * 1000

    eta = distance_m / speed / 60

    return round(max(1, eta))