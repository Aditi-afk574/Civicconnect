import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix default Leaflet marker icons in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DEFAULT_CENTER = [20.5937, 78.9629]; // India center
const DEFAULT_ZOOM = 5;

// ── Fly to a position imperatively ────────────────────────────
const FlyTo = ({ target }) => {
    const map = useMap();
    useEffect(() => {
        if (target) map.flyTo(target, 16, { animate: true, duration: 1.2 });
    }, [target]);
    return null;
};

// ── Detect when the user stops dragging/zooming and reverse-geocode ───
const MapMoveHandler = ({ onMove }) => {
    useMapEvents({
        moveend: (e) => {
            const { lat, lng } = e.target.getCenter();
            onMove(lat, lng);
        },
    });
    return null;
};

// ── Debounce helper ────────────────────────────────────────────
function useDebounce(fn, delay) {
    const timer = useRef(null);
    return useCallback((...args) => {
        clearTimeout(timer.current);
        timer.current = setTimeout(() => fn(...args), delay);
    }, [fn, delay]);
}

// ── Nominatim reverse-geocode ──────────────────────────────────
async function reverseGeocode(lat, lng) {
    try {
        const r = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
            { headers: { 'Accept-Language': 'en' } }
        );
        const d = await r.json();
        return d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
}

// ── Nominatim forward-search (autocomplete) ────────────────────
async function searchAddress(query) {
    if (!query || query.length < 3) return [];
    try {
        const r = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&accept-language=en`
        );
        return await r.json();
    } catch {
        return [];
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Main MapLocationPicker component
// ─────────────────────────────────────────────────────────────────────────────
const MapLocationPicker = ({ onLocationChange }) => {
    const [center, setCenter] = useState(DEFAULT_CENTER);
    const [address, setAddress] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [flyTarget, setFlyTarget] = useState(null);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [geocoding, setGeocoding] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchStatus, setSearchStatus] = useState('');
    const suggestRef = useRef(null);
    const searchedPositionRef = useRef(null);
    const geocodeRequestRef = useRef(0);

    // When map stops moving, reverse-geocode the new center
    const handleMapMove = useDebounce(async (lat, lng) => {
        setCenter([lat, lng]);

        // A search result already has an exact address. Do not let the
        // animated map's moveend event overwrite it with a reverse-geocoded
        // approximation a moment later.
        const searched = searchedPositionRef.current;
        if (searched &&
            Math.abs(lat - searched.lat) < 0.0005 &&
            Math.abs(lng - searched.lng) < 0.0005) {
            searchedPositionRef.current = null;
            return;
        }
        searchedPositionRef.current = null;

        const requestId = ++geocodeRequestRef.current;
        const coordinateAddress = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        setGeocoding(true);
        // Immediately save the new coordinates so a quick submit can't use
        // the previous location while reverse-geocoding is still in flight.
        onLocationChange({ lat, lng, address: coordinateAddress });

        const addr = await reverseGeocode(lat, lng);
        if (requestId !== geocodeRequestRef.current) return;
        setAddress(addr);
        setSearchQuery(addr);
        setSearchStatus('');
        setGeocoding(false);
        onLocationChange({ lat, lng, address: addr || coordinateAddress });
    }, 400);

    // GPS: get user's current location
    const handleGPS = () => {
        if (!navigator.geolocation) return;
        setGpsLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                setFlyTarget([lat, lng]);
                setGpsLoading(false);
            },
            () => {
                setGpsLoading(false);
                alert('Could not get your location. Please allow location access.');
            },
            { timeout: 10000 }
        );
    };

    // Address search suggestions
    const fetchSuggestions = useDebounce(async (q) => {
        const query = q.trim();
        if (query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            setSearchStatus(query ? 'Enter at least 3 characters to search.' : '');
            return;
        }
        const results = await searchAddress(query);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
        setSearchStatus(results.length
            ? 'Choose a suggestion to confirm the exact location.'
            : 'No matching address found. Try a fuller address or nearby landmark.');
    }, 500);

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        setAddress('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchStatus(query.trim().length >= 3 ? 'Searching for location…' : (query.trim() ? 'Enter at least 3 characters to search.' : ''));

        // Typing a new address invalidates the old selected point. This
        // prevents accidentally submitting the previous location.
        geocodeRequestRef.current += 1;
        searchedPositionRef.current = null;
        setGeocoding(false);
        onLocationChange({ lat: null, lng: null, address: '' });
        fetchSuggestions(query);
    };

    const handleSuggestionClick = (item) => {
        const lat = Number.parseFloat(item.lat);
        const lng = Number.parseFloat(item.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            setSearchStatus('That result has no usable map coordinates. Please choose another result.');
            return;
        }
        geocodeRequestRef.current += 1;
        searchedPositionRef.current = { lat, lng };
        setCenter([lat, lng]);
        setFlyTarget([lat, lng]);
        setAddress(item.display_name);
        setSearchQuery(item.display_name);
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchStatus('Location selected.');
        setGeocoding(false);
        onLocationChange({ lat, lng, address: item.display_name });
    };

    const handleSearchKeyDown = async (e) => {
        if (e.key !== 'Enter') return;
        e.preventDefault();

        if (suggestions.length > 0) {
            handleSuggestionClick(suggestions[0]);
            return;
        }

        const query = searchQuery.trim();
        if (query.length < 3) return;

        setSearchStatus('Searching for location…');
        const results = await searchAddress(query);
        setSuggestions(results);
        if (results.length > 0) {
            handleSuggestionClick(results[0]);
        } else {
            setSearchStatus('No matching address found. Try a nearby landmark or select the map manually.');
        }
    };

    const handleClearSearch = () => {
        geocodeRequestRef.current += 1;
        searchedPositionRef.current = null;
        setSearchQuery('');
        setAddress('');
        setSuggestions([]);
        setShowSuggestions(false);
        setSearchStatus('');
        setGeocoding(false);
        onLocationChange({ lat: null, lng: null, address: '' });
    };

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (suggestRef.current && !suggestRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div className="map-picker-wrapper">
            {/* ── Search Bar ── */}
            <div className="map-search-bar" ref={suggestRef}>
                <span className="map-search-icon">🔍</span>
                <input
                    className="map-search-input"
                    type="text"
                    placeholder="Search for a location..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    autoComplete="off"
                />
                {searchQuery && (
                    <button type="button" className="map-search-clear" onClick={handleClearSearch} aria-label="Clear selected location">✕</button>
                )}
                {/* Suggestions dropdown */}
                {showSuggestions && (
                    <div className="map-suggestions">
                        {suggestions.map((item, i) => (
                            <div key={i} className="map-suggestion-item" onClick={() => handleSuggestionClick(item)}>
                                <span className="map-suggest-icon">📍</span>
                                <span>{item.display_name}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {searchStatus && (
                <div role="status" aria-live="polite" style={{
                    padding: '8px 14px',
                    fontSize: '0.8rem',
                    color: searchStatus === 'Location selected.' ? 'var(--success)' : 'var(--text-muted)',
                    background: 'var(--bg-card)',
                    borderBottom: '1px solid var(--border)'
                }}>
                    {searchStatus}
                </div>
            )}

            {/* ── Map ── */}
            <div className="map-container-wrapper">
                <MapContainer
                    center={DEFAULT_CENTER}
                    zoom={DEFAULT_ZOOM}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapMoveHandler onMove={handleMapMove} />
                    {flyTarget && <FlyTo target={flyTarget} />}
                </MapContainer>

                {/* ── Center Crosshair Pin (like Uber/Rapido) ── */}
                <div className="map-center-pin" aria-hidden="true">
                    <div className="map-pin-icon">📍</div>
                    <div className="map-pin-shadow" />
                </div>

                {/* ── GPS Button ── */}
                <button className="map-gps-btn" onClick={handleGPS} disabled={gpsLoading} title="Use my current location">
                    {gpsLoading ? '⏳' : '🎯'}
                </button>
            </div>

            {/* ── Detected Address Bar ── */}
            <div className="map-address-bar">
                <span className="map-address-icon">{geocoding ? '⏳' : '✅'}</span>
                <span className="map-address-text">
                    {geocoding ? 'Detecting address...' : address || 'Move the map to select a location'}
                </span>
            </div>
        </div>
    );
};

export default MapLocationPicker;
