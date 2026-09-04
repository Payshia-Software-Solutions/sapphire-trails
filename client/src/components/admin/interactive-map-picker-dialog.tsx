'use client';

import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MapPin, Search, Check, LoaderCircle, Compass, LocateFixed, ExternalLink } from 'lucide-react';

interface InteractiveMapPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialLat?: number;
  initialLng?: number;
  locationTitle?: string;
  onSelectCoordinates: (lat: number, lng: number, placeName?: string) => void;
}

export function InteractiveMapPickerDialog({
  open,
  onOpenChange,
  initialLat = 6.6828,
  initialLng = 80.4034,
  locationTitle = '',
  onSelectCoordinates,
}: InteractiveMapPickerDialogProps) {
  const [lat, setLat] = useState<number>(initialLat || 6.6828);
  const [lng, setLng] = useState<number>(initialLng || 80.4034);
  const [searchQuery, setSearchQuery] = useState(locationTitle);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [selectedPlaceName, setSelectedPlaceName] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (initialLat && initialLng) {
        setLat(initialLat);
        setLng(initialLng);
      }
      if (locationTitle) {
        setSearchQuery(locationTitle);
      }
    }
  }, [open, initialLat, initialLng, locationTitle]);

  // Search places in Sri Lanka
  const handleSearch = async (queryToSearch?: string) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setIsSearching(true);
    try {
      const fullQuery = q.toLowerCase().includes('sri lanka') ? q : `${q}, Sri Lanka`;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=5`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setSearchResults(data);
        const top = data[0];
        const newLat = parseFloat(top.lat);
        const newLng = parseFloat(top.lon);
        setLat(newLat);
        setLng(newLng);
        setSelectedPlaceName(top.display_name.split(',')[0]);
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      console.error('Search failed', e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectResult = (item: { display_name: string; lat: string; lon: string }) => {
    const newLat = parseFloat(item.lat);
    const newLng = parseFloat(item.lon);
    setLat(newLat);
    setLng(newLng);
    setSelectedPlaceName(item.display_name.split(',')[0]);
    setSearchResults([]);
  };

  const handleConfirm = () => {
    onSelectCoordinates(lat, lng, selectedPlaceName);
    onOpenChange(false);
  };

  // Generate interactive Leaflet Map HTML string to embed cleanly in iframe
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #111; font-family: sans-serif; }
          .leaflet-popup-content-wrapper { background: #18181b; color: #fff; border-radius: 8px; border: 1px solid #d4af37; }
          .leaflet-popup-tip { background: #18181b; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var lat = ${lat};
          var lng = ${lng};
          var map = L.map('map').setView([lat, lng], 14);
          
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
          }).addTo(map);

          var marker = L.marker([lat, lng], { draggable: true }).addTo(map);
          marker.bindPopup("<b>Selected Destination Pin</b><br>Drag or click map to move.").openPopup();

          function updateCoords(newLat, newLng) {
            window.parent.postMessage({ type: 'COORDS_UPDATE', lat: newLat, lng: newLng }, '*');
          }

          marker.on('dragend', function (e) {
            var position = marker.getLatLng();
            updateCoords(position.lat, position.lng);
          });

          map.on('click', function(e) {
            marker.setLatLng(e.latlng);
            updateCoords(e.latlng.lat, e.latlng.lng);
            marker.bindPopup("<b>Pin Updated!</b><br>" + e.latlng.lat.toFixed(5) + ", " + e.latlng.lng.toFixed(5)).openPopup();
          });
        </script>
      </body>
    </html>
  `;

  // Listen for drag/click events from the iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.type === 'COORDS_UPDATE') {
        setLat(parseFloat(e.data.lat.toFixed(6)));
        setLng(parseFloat(e.data.lng.toFixed(6)));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-6 bg-card border-border shadow-2xl text-foreground">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-bold font-serif">
              Visual Map Pin Picker
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Search for a landmark or click/drag the pin directly anywhere on the map to set the exact GPS point.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search landmark, waterfall, mine, or town (e.g. Bopath Ella, Ratnapura)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  className="pl-9 text-xs font-medium h-9 bg-background"
                />
              </div>
              <Button
                type="button"
                onClick={() => handleSearch()}
                disabled={isSearching}
                size="sm"
                className="gap-1 text-xs bg-primary hover:bg-primary/90 text-primary-foreground h-9 px-4"
              >
                {isSearching ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                Search Place
              </Button>
            </div>

            {/* Instant Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-11 inset-x-0 bg-background border border-border rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-border/60">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectResult(item)}
                    className="p-2.5 text-xs hover:bg-primary/10 cursor-pointer flex items-center justify-between text-foreground"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{item.display_name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-mono shrink-0 ml-2">
                      Select
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interactive Map Box */}
          <div className="relative h-[380px] w-full rounded-xl overflow-hidden border border-border bg-black shadow-inner">
            <iframe
              srcDoc={mapHtml}
              className="w-full h-full border-0"
              title="Interactive Map Pin Picker"
            />

            {/* Floating Coordinate Pill */}
            <div className="absolute bottom-3 left-3 bg-black/85 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-primary/40 text-xs shadow-lg flex items-center gap-2 text-white font-mono">
              <LocateFixed className="h-3.5 w-3.5 text-primary" />
              <span>Lat: <strong>{lat.toFixed(5)}</strong></span>
              <span>•</span>
              <span>Lng: <strong>{lng.toFixed(5)}</strong></span>
            </div>
          </div>

          {/* Coordinate manual adjustments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-background-alt rounded-lg border border-border/80 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium block">Latitude (GPS):</span>
              <Input
                type="number"
                step="any"
                value={lat}
                onChange={e => setLat(parseFloat(e.target.value) || 0)}
                className="h-7 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground font-medium block">Longitude (GPS):</span>
              <Input
                type="number"
                step="any"
                value={lng}
                onChange={e => setLng(parseFloat(e.target.value) || 0)}
                className="h-7 text-xs font-mono"
              />
            </div>
          </div>

        </div>

        <DialogFooter className="flex flex-row items-center justify-between sm:justify-between pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            size="sm"
            className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-md text-xs"
          >
            <Check className="h-4 w-4" />
            Apply GPS Coordinates
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
