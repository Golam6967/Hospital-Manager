import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapPanel.css';
import LoadingSpinner from './LoadingSpinner';
import ErrorAlert from './ErrorAlert';

// Fix Leaflet default marker icon broken by bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapPanel({ hospital, onClose }) {
  const mapRef = useRef(null);          // DOM node
  const leafletMap = useRef(null);      // Leaflet map instance
  const userMarker = useRef(null);      // Live blue dot marker
  const routingControl = useRef(null);  // OSRM routing control
  const watchId = useRef(null);         // Geolocation watchPosition ID

  const [hospitalCoords, setHospitalCoords] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [loadingCoords, setLoadingCoords] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [geocodeError, setGeocodeError] = useState(false);
  const [status, setStatus] = useState('Loading hospital location...');
  const [copied, setCopied] = useState(false);

  // ── Phase 1: Fetch hospital coords ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function fetchHospitalCoords() {
      // Use stored coords if available
      if (hospital.latitude != null && hospital.longitude != null) {
        if (!cancelled) {
          setHospitalCoords({ lat: hospital.latitude, lon: hospital.longitude });
          setLoadingCoords(false);
        }
        return;
      }

      // Otherwise geocode via backend (lazy + cached in MongoDB)
      try {
        setStatus('Locating hospital on map...');
        const res = await fetch(`/api/hospitals/${hospital._id}/geocode`, {
          method: 'POST'
        });
        const data = await res.json();

        if (cancelled) return;
        if (data.lat && data.lon) {
          setHospitalCoords({ lat: data.lat, lon: data.lon });
        } else {
          setGeocodeError(true);
        }
      } catch {
        if (!cancelled) setGeocodeError(true);
      } finally {
        if (!cancelled) setLoadingCoords(false);
      }
    }

    fetchHospitalCoords();
    return () => { cancelled = true; };
  }, [hospital._id]);

  // ── Phase 2: Start watching user's live location ─────────────────────────
  useEffect(() => {
    if (!hospitalCoords) return;

    if (!navigator.geolocation) {
      setLocationError('Your browser does not support location access.');
      return;
    }

    setStatus('Waiting for your location...');

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserCoords({ lat: latitude, lon: longitude, accuracy });
        setStatus(null); // Clear status once we have location
      },
      (err) => {
        const messages = {
          1: 'Location access denied. Please allow location in your browser settings.',
          2: 'Could not determine your location. Check GPS signal.',
          3: 'Location request timed out. Retrying...',
        };
        setLocationError(messages[err.code] || 'Location error.');
      },
      {
        enableHighAccuracy: true,   // Use GPS on mobile
        maximumAge: 5000,           // Accept cached position up to 5s old
        timeout: 15000,             // Wait up to 15s for fix
      }
    );

    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
      }
    };
  }, [hospitalCoords]);

  // ── Phase 3: Init Leaflet map once hospital coords are ready ─────────────
  useEffect(() => {
    if (!hospitalCoords || !mapRef.current || leafletMap.current) return;

    // Init map centered on hospital
    leafletMap.current = L.map(mapRef.current, {
      center: [hospitalCoords.lat, hospitalCoords.lon],
      zoom: 14,
      zoomControl: true,
    });

    // OSM tile layer — completely free
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(leafletMap.current);

    // Hospital pin — red dot marker
    const hospitalIcon = L.divIcon({
      html: `<div style="
        background: #dc2626;
        width: 16px; height: 16px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      "></div>`,
      className: '',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    L.marker([hospitalCoords.lat, hospitalCoords.lon], { icon: hospitalIcon })
      .addTo(leafletMap.current)
      .bindPopup(`<strong>${hospital.name}</strong><br/>${[hospital.district, hospital.division].filter(Boolean).join(', ')}`)
      .openPopup();

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
        userMarker.current = null;
        routingControl.current = null;
      }
    };
  }, [hospitalCoords]);

  // ── Phase 4: Update live blue dot + redraw route when user moves ─────────
  useEffect(() => {
    if (!userCoords || !leafletMap.current || !hospitalCoords) return;

    const map = leafletMap.current;

    // Blue dot icon for user
    const userIcon = L.divIcon({
      html: `<div style="
        background: #1d6fa5;
        width: 18px; height: 18px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 4px rgba(29,111,165,0.25);
        animation: pulse 1.5s infinite;
      "></div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Create or update user marker
    if (!userMarker.current) {
      userMarker.current = L.marker([userCoords.lat, userCoords.lon], { icon: userIcon })
        .addTo(map)
        .bindPopup('You are here');
    } else {
      userMarker.current.setLatLng([userCoords.lat, userCoords.lon]);
      userMarker.current.setIcon(userIcon);
    }

    // Remove old routing control before redrawing
    if (routingControl.current) {
      map.removeControl(routingControl.current);
      routingControl.current = null;
    }

    // Draw route using leaflet-routing-machine + OSRM (free, no key needed)
    // Dynamic import avoids SSR issues and works with Vite's module system
    import('leaflet-routing-machine').then(() => {
      if (!leafletMap.current) return;

      routingControl.current = L.Routing.control({
        waypoints: [
          L.latLng(userCoords.lat, userCoords.lon),
          L.latLng(hospitalCoords.lat, hospitalCoords.lon),
        ],
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving',
        }),
        lineOptions: {
          styles: [{ color: '#1d6fa5', weight: 5, opacity: 0.8 }],
        },
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        show: true,
        collapsible: true,
        createMarker: () => null, // Suppress default markers — we have our own
      }).addTo(leafletMap.current);

      // Fit map to show both user and hospital
      const bounds = L.latLngBounds(
        [userCoords.lat, userCoords.lon],
        [hospitalCoords.lat, hospitalCoords.lon]
      );
      leafletMap.current.fitBounds(bounds, { padding: [40, 40] });
    });
  }, [userCoords, hospitalCoords]);

  // ── Google Maps link (copy to clipboard) ─────────────────────────────────
  const googleMapsUrl = hospitalCoords
    ? `https://www.google.com/maps/search/?api=1&query=${hospitalCoords.lat},${hospitalCoords.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [hospital.name, hospital.district, hospital.division, 'Bangladesh'].filter(Boolean).join(', ')
      )}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(googleMapsUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  if (loadingCoords) {
    return (
      <div className="map-panel-overlay">
        <div className="map-panel">
          <div className="map-panel-header">
            <h3>📍 {hospital.name}</h3>
            <button className="map-close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="map-loading">
            <LoadingSpinner />
            <p>Locating hospital...</p>
          </div>
        </div>
      </div>
    );
  }

  if (geocodeError) {
    return (
      <div className="map-panel-overlay">
        <div className="map-panel">
          <div className="map-panel-header">
            <h3>📍 {hospital.name}</h3>
            <button className="map-close-btn" onClick={onClose}>✕</button>
          </div>
          <div className="map-fallback">
            <p>⚠️ Could not locate this hospital on the map.</p>
            <p>
              <strong>Address:</strong>{' '}
              {[hospital.upazila, hospital.district, hospital.division].filter(Boolean).join(', ')}
            </p>
            <a
              href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(
                [hospital.district, hospital.division, 'Bangladesh'].filter(Boolean).join(', ')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="map-fallback-link"
            >
              🔍 Search on OpenStreetMap
            </a>
            <button
              className={`map-copy-btn${copied ? ' map-copy-btn--copied' : ''}`}
              onClick={handleCopyLink}
              style={{ marginTop: '4px' }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Link Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy Google Maps Link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-panel-overlay" onClick={onClose}>
      <div className="map-panel" onClick={e => e.stopPropagation()}>
        <div className="map-panel-header">
          <h3>🏥 {hospital.name}</h3>
          <button className="map-close-btn" onClick={onClose}>✕</button>
        </div>

        {status && (
          <div className="map-status-bar">
            <LoadingSpinner size="sm" /> {status}
          </div>
        )}

        {locationError && (
          <div className="map-location-error">
            ⚠️ {locationError}
          </div>
        )}

        {/* Leaflet mounts into this div */}
        <div ref={mapRef} className="map-container" />

        <div className="map-legend">
          <span className="legend-user">● You</span>
          <span className="legend-hospital">● Hospital</span>
          <span className="legend-note">Route updates as you move</span>
        </div>

        <div className="map-copy-row">
          <button className={`map-copy-btn${copied ? ' map-copy-btn--copied' : ''}`} onClick={handleCopyLink}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                Link Copied!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy Google Maps Link
              </>
            )}
          </button>
          <span className="map-copy-hint">Paste in Google Maps to navigate</span>
        </div>
      </div>
    </div>
  );
}
