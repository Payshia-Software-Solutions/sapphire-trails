'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  ExternalLink, 
  Sparkles,
  Mountain,
  Gem,
  Waves,
  Landmark,
  Home,
  AlertTriangle,
  ArrowRight,
  Compass,
  Route,
  Layers,
  LocateFixed,
  Maximize2
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { API_BASE_URL, getFullImageUrl } from '@/lib/utils';

interface Attraction {
  icon: string;
  name: string;
  distance: string;
  slug?: string;
  lat?: number;
  lng?: number;
  image?: string;
}

interface LocationNearbyProps {
  currentLocationTitle?: string;
  currentLocationImage?: string;
  mapEmbedUrl?: string;
  nearbyAttractions?: Attraction[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  AlertTriangle,
  Gem,
  Waves,
  Landmark,
  Home,
  Mountain,
  MapPin,
  Compass
};

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546708973-b339540b5162?w=500&auto=format&fit=crop&q=80';

// Known coordinates for popular Sri Lankan destinations
const KNOWN_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'delgamuwa raja maha viharaya': { lat: 6.7014, lng: 80.3758 },
  'delgamuwa viharaya': { lat: 6.7014, lng: 80.3758 },
  'galpaditenna tea factory': { lat: 6.5583, lng: 80.6083 },
  'galpadithanne tea factory': { lat: 6.5583, lng: 80.6083 },
  'bopath falls': { lat: 6.7869, lng: 80.3542 },
  'bopath ella': { lat: 6.7869, lng: 80.3542 },
  'bopath ella falls': { lat: 6.7869, lng: 80.3542 },
  'sinharaja rainforest': { lat: 6.4167, lng: 80.4500 },
  'sinharaja rain forest': { lat: 6.4167, lng: 80.4500 },
  'adam’s peak': { lat: 6.8096, lng: 80.4994 },
  'adams peak': { lat: 6.8096, lng: 80.4994 },
  'sripada / adam’s peak': { lat: 6.8096, lng: 80.4994 },
  'nuwara eliya': { lat: 6.9497, lng: 80.7891 },
  'horton plains national park': { lat: 6.8028, lng: 80.8042 },
  'horton plains': { lat: 6.8028, lng: 80.8042 },
  'ramboda falls': { lat: 7.0544, lng: 80.6978 },
  'ratnapura gem market': { lat: 6.6828, lng: 80.4034 },
  'batadombalena': { lat: 6.7722, lng: 80.3861 },
  'batadombalena cave': { lat: 6.7722, lng: 80.3861 }
};

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

export function LocationNearby({
  currentLocationTitle = 'Ratnapura',
  currentLocationImage,
  mapEmbedUrl,
  nearbyAttractions = []
}: LocationNearbyProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [activePlace, setActivePlace] = useState<Attraction | null>(null);
  const [dbLocations, setDbLocations] = useState<Array<{ slug: string; title: string; image_url: string }>>([]);

  // Fetch real destination images from database
  useEffect(() => {
    const fetchDbLocations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/locations`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDbLocations(data.map((l: any) => ({
              slug: l.slug,
              title: l.title,
              image_url: getFullImageUrl(l.card_image_url || l.hero_image_url || l.intro_image_url) || DEFAULT_FALLBACK_IMAGE
            })));
          }
        }
      } catch (err) {
        console.error('Could not fetch destinations for map images', err);
      }
    };
    fetchDbLocations();
  }, []);

  // Helper to find real image for any destination
  const resolvePlaceImage = (name: string, fallbackImg?: string) => {
    if (fallbackImg && !fallbackImg.includes('unsplash')) {
      return getFullImageUrl(fallbackImg);
    }
    const cleanName = name.toLowerCase().trim();
    const match = dbLocations.find(l => 
      l.title.toLowerCase().trim() === cleanName || 
      l.slug === slugify(name) ||
      cleanName.includes(l.title.toLowerCase())
    );
    if (match && match.image_url) {
      return match.image_url;
    }
    return fallbackImg ? getFullImageUrl(fallbackImg) : DEFAULT_FALLBACK_IMAGE;
  };

  // Base coordinates resolver
  const getBaseCoords = () => {
    if (mapEmbedUrl) {
      const qMatch = mapEmbedUrl.match(/q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);
      if (qMatch) {
        return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[3]) };
      }
    }
    const cleanTitle = currentLocationTitle.toLowerCase().trim();
    if (KNOWN_COORDINATES[cleanTitle]) {
      return KNOWN_COORDINATES[cleanTitle];
    }
    return { lat: 6.7014, lng: 80.3758 }; // Delgamuwa / Ratnapura base
  };

  const baseCoords = getBaseCoords();

  // Resolved Real Main Location Image
  const resolvedMainImage = currentLocationImage 
    ? getFullImageUrl(currentLocationImage) 
    : resolvePlaceImage(currentLocationTitle);

  // Compute full pin dataset with real images & coordinates
  const allPins = [
    {
      name: currentLocationTitle,
      lat: baseCoords.lat,
      lng: baseCoords.lng,
      distance: 'Main Location',
      isMain: true,
      slug: slugify(currentLocationTitle),
      image: resolvedMainImage
    },
    ...nearbyAttractions.map((attr, idx) => {
      const cleanName = attr.name.toLowerCase().trim();
      let lat = baseCoords.lat;
      let lng = baseCoords.lng;

      if (KNOWN_COORDINATES[cleanName]) {
        lat = KNOWN_COORDINATES[cleanName].lat;
        lng = KNOWN_COORDINATES[cleanName].lng;
      } else {
        const angles = [45, 120, 210, 315, 90, 180, 270, 0];
        const angle = (angles[idx % angles.length] * Math.PI) / 180;
        const distanceDeg = 0.08 + (idx * 0.04);
        lat = baseCoords.lat + Math.sin(angle) * distanceDeg;
        lng = baseCoords.lng + Math.cos(angle) * distanceDeg;
      }

      return {
        name: attr.name,
        lat,
        lng,
        distance: attr.distance || `${(idx + 1) * 12} km away`,
        isMain: false,
        slug: attr.slug || slugify(attr.name),
        image: resolvePlaceImage(attr.name, attr.image)
      };
    })
  ];

  // Send flyTo command to iframe map
  const flyToMarker = (placeName: string) => {
    const target = allPins.find(p => p.name.toLowerCase() === placeName.toLowerCase());
    if (target && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({
        type: 'FLY_TO',
        lat: target.lat,
        lng: target.lng,
        name: target.name
      }, '*');
    }
  };

  const resetToAllBounds = () => {
    setActivePlace(null);
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'FIT_ALL_BOUNDS' }, '*');
    }
  };

  // Robust Leaflet setup with SVG pins, permanent title tooltips and luxury image popups
  const leafletMapDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { box-sizing: border-box; }
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #111; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          
          /* Permanent Floating Name Tooltips */
          .luxury-pin-tooltip {
            background: #18181b !important;
            color: #f7e7a9 !important;
            border: 1px solid #d4af37 !important;
            font-size: 11px !important;
            font-weight: 700 !important;
            padding: 4px 9px !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 12px rgba(0,0,0,0.7) !important;
            white-space: nowrap !important;
          }
          .luxury-pin-tooltip::before {
            border-top-color: #18181b !important;
          }
          .tooltip-main {
            background: #d4af37 !important;
            color: #000 !important;
            border-color: #fff !important;
          }
          .tooltip-main::before {
            border-top-color: #d4af37 !important;
          }

          /* Luxury Image Popup Card */
          .leaflet-popup-content-wrapper {
            background: #18181b !important;
            color: #fff !important;
            border-radius: 14px !important;
            border: 1px solid #d4af37 !important;
            padding: 0 !important;
            overflow: hidden !important;
            box-shadow: 0 20px 35px rgba(0,0,0,0.85) !important;
          }
          .leaflet-popup-content {
            margin: 0 !important;
            width: 260px !important;
          }
          .leaflet-popup-tip {
            background: #18181b !important;
            border: 1px solid #d4af37 !important;
          }
          .pop-card {
            display: flex;
            flex-direction: column;
          }
          .pop-img {
            width: 100%;
            height: 125px;
            object-fit: cover;
            border-bottom: 1px solid rgba(212, 175, 55, 0.3);
            background: #27272a;
          }
          .pop-info {
            padding: 12px 14px 14px;
          }
          .pop-tag {
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #d4af37;
            margin-bottom: 4px;
            display: inline-block;
          }
          .pop-title {
            font-size: 14px;
            font-weight: 700;
            color: #fff;
            margin: 0 0 8px 0;
          }
          .pop-btn {
            display: block;
            width: 100%;
            text-align: center;
            background: #d4af37;
            color: #0b0c10;
            font-size: 11px;
            font-weight: 700;
            padding: 8px 10px;
            border-radius: 8px;
            text-decoration: none;
            transition: background 0.2s;
          }
          .pop-btn:hover {
            background: #e6c555;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var pinsData = ${JSON.stringify(allPins)};
          var baseLat = ${baseCoords.lat};
          var baseLng = ${baseCoords.lng};
          var fallbackImg = "${DEFAULT_FALLBACK_IMAGE}";

          // Initialize Map with concrete center and zoom
          var map = L.map('map').setView([baseLat, baseLng], 12);

          // Standard OpenStreetMap Tiles (Exact same as Admin Pin Picker)
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          // Bulletproof Vector SVG Icons with 0 external image dependencies
          var nearbySvgIcon = L.divIcon({
            className: '',
            html: '<div style="transform: translate(-50%, -100%); width: 34px; height: 34px; cursor: pointer;"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"34\" height=\"34\" style=\"filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8));\"><path fill=\"#d4af37\" stroke=\"#18181b\" stroke-width=\"1.5\" d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z\"/><circle cx=\"12\" cy=\"9\" r=\"3.5\" fill=\"#18181b\"/></svg></div>',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            popupAnchor: [0, -36],
            tooltipAnchor: [0, -36]
          });

          var mainSvgIcon = L.divIcon({
            className: '',
            html: '<div style="transform: translate(-50%, -100%); width: 42px; height: 42px; cursor: pointer;"><svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" width=\"42\" height=\"42\" style=\"filter: drop-shadow(0 4px 12px rgba(212,175,55,0.9));\"><path fill=\"#f59e0b\" stroke=\"#fff\" stroke-width=\"1.8\" d=\"M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z\"/><circle cx=\"12\" cy=\"9\" r=\"4\" fill=\"#fff\"/></svg></div>',
            iconSize: [0, 0],
            iconAnchor: [0, 0],
            popupAnchor: [0, -44],
            tooltipAnchor: [0, -44]
          });

          var markers = {};
          var group = L.featureGroup();

          pinsData.forEach(function(pin) {
            var imgUrl = pin.image ? pin.image : fallbackImg;
            var popupContent = '<div class="pop-card">' +
              '<img src="' + imgUrl + '" class="pop-img" alt="' + pin.name + '" onerror="this.onerror=null; this.src=\\'' + fallbackImg + '\\';" />' +
              '<div class="pop-info">' +
                '<span class="pop-tag">' + (pin.isMain ? 'PRIMARY DESTINATION' : pin.distance) + '</span>' +
                '<h4 class="pop-title">' + pin.name + '</h4>' +
                '<a href="/explore-ratnapura/' + pin.slug + '" target="_parent" class="pop-btn">Explore Place →</a>' +
              '</div>' +
            '</div>';

            var marker = L.marker([pin.lat, pin.lng], { icon: pin.isMain ? mainSvgIcon : nearbySvgIcon })
              .addTo(map)
              .bindPopup(popupContent);

            // Bind permanent title tooltip on top of pin
            marker.bindTooltip((pin.isMain ? "👑 " : "📍 ") + pin.name, {
              permanent: true,
              direction: 'top',
              className: 'luxury-pin-tooltip ' + (pin.isMain ? 'tooltip-main' : '')
            });

            markers[pin.name.toLowerCase()] = marker;
            group.addLayer(marker);
          });

          // Draw connecting dashed tour path
          if (pinsData.length > 1) {
            var latlngs = pinsData.map(function(p) { return [p.lat, p.lng]; });
            latlngs.push([pinsData[0].lat, pinsData[0].lng]);
            L.polyline(latlngs, {
              color: '#d4af37',
              weight: 2.5,
              opacity: 0.8,
              dashArray: '6, 8'
            }).addTo(map);

            setTimeout(function() {
              map.fitBounds(group.getBounds().pad(0.2));
            }, 300);
          } else {
            // Open popup of main destination
            if (pinsData[0] && markers[pinsData[0].name.toLowerCase()]) {
              markers[pinsData[0].name.toLowerCase()].openPopup();
            }
          }

          // External Message Listener
          window.addEventListener('message', function(e) {
            if (e.data && e.data.type === 'FLY_TO') {
              map.flyTo([e.data.lat, e.data.lng], 14, { duration: 1.2 });
              var key = e.data.name.toLowerCase();
              if (markers[key]) {
                setTimeout(function() { markers[key].openPopup(); }, 600);
              }
            } else if (e.data && e.data.type === 'FIT_ALL_BOUNDS') {
              if (pinsData.length > 1) {
                map.fitBounds(group.getBounds().pad(0.2), { duration: 1 });
              } else {
                map.setView([baseLat, baseLng], 12);
              }
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <section id="map-location" className="w-full py-16 sm:py-24 bg-background border-b border-border/60 scroll-mt-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary mb-2 bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full">
            <Navigation className="h-3.5 w-3.5" />
            <span>Luxury Tour Circuit &amp; Interactive Map</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-foreground tracking-tight">
            Interactive Destination Map
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Click on any marker or excursion card to view photos, driving routes, and full details.
          </p>
        </div>

        {/* Quick Filter Destination Pills */}
        {nearbyAttractions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-3">
            <button
              type="button"
              onClick={resetToAllBounds}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 ${
                !activePlace
                  ? 'bg-primary text-primary-foreground shadow-primary/25 ring-2 ring-primary/40'
                  : 'bg-background-alt text-muted-foreground hover:text-foreground border border-border/70'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Full Circuit ({allPins.length} Places Connected)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActivePlace(null);
                flyToMarker(currentLocationTitle);
              }}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm flex items-center gap-1.5 ${
                activePlace?.name === currentLocationTitle
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background-alt text-muted-foreground hover:text-foreground border border-border/70'
              }`}
            >
              <MapPin className="h-3.5 w-3.5 text-primary" />
              <span>👑 {currentLocationTitle}</span>
            </button>

            {nearbyAttractions.map((place, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActivePlace(place);
                  flyToMarker(place.name);
                }}
                className={`px-3.5 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activePlace?.name === place.name
                    ? 'bg-primary text-primary-foreground font-semibold ring-2 ring-primary/40'
                    : 'bg-background-alt text-muted-foreground hover:text-foreground border border-border/70'
                }`}
              >
                <span>📍 {place.name}</span>
                {place.distance && (
                  <span className="text-[10px] opacity-80 font-mono">({place.distance})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Studio 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Custom Interactive Leaflet Map (8 Cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-border shadow-2xl h-[500px] sm:h-[560px] w-full bg-[#111] group">
              <iframe
                ref={iframeRef}
                srcDoc={leafletMapDoc}
                className="w-full h-full border-0"
                title="Interactive Luxury Tour Map"
              />

              {/* Floating Active Info Pill */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <Badge className="bg-black/85 backdrop-blur-md text-white border-primary/40 text-xs px-3.5 py-1.5 gap-2 shadow-xl font-semibold">
                  <LocateFixed className="h-3.5 w-3.5 text-primary animate-pulse" />
                  {activePlace
                    ? `Selected: ${activePlace.name} (${activePlace.distance || 'Nearby'})`
                    : `Interactive View: ${currentLocationTitle} + ${nearbyAttractions.length} Nearby Excursions`}
                </Badge>
              </div>

              {/* Reset View Button on Map */}
              <div className="absolute top-4 right-4 z-10">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetToAllBounds}
                  className="h-8 text-xs bg-black/80 backdrop-blur-md border-white/20 text-white hover:bg-primary hover:text-primary-foreground gap-1.5 shadow"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                  Fit All Pins
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground px-1">
              <span>Interactive luxury tour map with real destination images and verified driving paths.</span>
              <Button variant="outline" size="sm" asChild className="text-primary hover:bg-primary/10 gap-1.5 text-xs h-8 border-primary/30">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(currentLocationTitle + ', Sri Lanka')}&destination=${encodeURIComponent((activePlace?.name || currentLocationTitle) + ', Sri Lanka')}`} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <Route className="h-3.5 w-3.5" />
                  Open Live Google Driving Route
                </a>
              </Button>
            </div>
          </div>

          {/* Connected Nearby Excursions (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-bold font-serif uppercase tracking-wider text-foreground flex items-center gap-2">
                <Compass className="h-4 w-4 text-primary" />
                Connected Excursions ({nearbyAttractions.length})
              </h3>
              {nearbyAttractions.length > 0 && (
                <button
                  type="button"
                  onClick={resetToAllBounds}
                  className="text-[11px] text-primary hover:underline font-semibold"
                >
                  Show All
                </button>
              )}
            </div>

            {nearbyAttractions.length === 0 ? (
              <div className="p-6 bg-background-alt rounded-xl border border-border/60 text-center text-xs text-muted-foreground">
                No nearby attractions recorded.
              </div>
            ) : (
              <div className="space-y-3">
                {nearbyAttractions.map((attraction, index) => {
                  const Icon = ICON_MAP[attraction.icon] || MapPin;
                  const placeSlug = attraction.slug || slugify(attraction.name);
                  const isSelected = activePlace?.name === attraction.name;

                  return (
                    <div 
                      key={index} 
                      onClick={() => {
                        setActivePlace(attraction);
                        flyToMarker(attraction.name);
                      }}
                      className={`p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-2.5 cursor-pointer shadow-sm ${
                        isSelected 
                          ? 'bg-card border-primary ring-1 ring-primary/40' 
                          : 'bg-background-alt hover:bg-card border-border/70 hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 border border-primary/20 text-primary'}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-bold text-xs sm:text-sm font-serif text-foreground truncate">
                            {attraction.name}
                          </span>
                        </div>
                        {attraction.distance && (
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0 bg-primary/10 text-primary border-primary/20">
                            {attraction.distance}
                          </Badge>
                        )}
                      </div>

                      {/* Action Links */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActivePlace(attraction);
                            flyToMarker(attraction.name);
                          }}
                          className={`inline-flex items-center gap-1 text-[11px] font-medium transition-colors ${isSelected ? 'text-primary font-bold' : 'text-muted-foreground hover:text-primary'}`}
                        >
                          <MapPin className="h-3 w-3" /> Focus on Map
                        </button>

                        <Link
                          href={`/explore-ratnapura/${placeSlug}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                        >
                          <span>Explore Page</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
