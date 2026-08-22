import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cityApi } from '../services/cityApi.js';
import { GridSkeleton } from '../components/SkeletonLoader.jsx';
import { formatCurrency } from '../utils/formatters.js';
import {
  Search, MapPin, Globe, Filter, Star, DollarSign, Sparkles, Ticket, X, ArrowRight, CheckCircle2, Compass, Layers, Plus, Play, Pause, ChevronLeft, ChevronRight, Video, Volume2, VolumeX, Image as ImageIcon
} from 'lucide-react';

// Curated 4-Photo HD Landmark Slideshows for All 16 Cities
const CITY_LANDMARK_SLIDESHOWS = {
  Tokyo: [
    { title: 'Shibuya Crossing at Night', url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Tokyo Tower & Evening Skyline', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Senso-ji Temple Asakusa', url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Mount Fuji View from Tokyo', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&auto=format&fit=crop&q=80' },
  ],
  Paris: [
    { title: 'Eiffel Tower Golden Sunset', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Louvre Museum Glass Pyramid', url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Arc de Triomphe Champs-Élysées', url: 'https://images.unsplash.com/photo-1509299349698-dd22323b5963?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Seine River Cruise & Notre Dame', url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=1200&auto=format&fit=crop&q=80' },
  ],
  'New York': [
    { title: 'Times Square Neon Nightlife', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Brooklyn Bridge Manhattan View', url: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Empire State & Mid-Town Skyline', url: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Central Park Autumn Leaves', url: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=1200&auto=format&fit=crop&q=80' },
  ],
  Rome: [
    { title: 'Colosseum Ancient Roman Amphitheater', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Trevi Fountain Golden Lights', url: 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Pantheon & Historic Piazza', url: 'https://images.unsplash.com/photo-1529260830199-42c24126f198?w=1200&auto=format&fit=crop&q=80' },
    { title: 'St. Peter Basilica Vatican View', url: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?w=1200&auto=format&fit=crop&q=80' },
  ],
  London: [
    { title: 'Big Ben & Elizabeth Tower', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Tower Bridge over Thames River', url: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=1200&auto=format&fit=crop&q=80' },
    { title: 'London Eye Evening Reflections', url: 'https://images.unsplash.com/photo-1486299267070-83823f5448dd?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Piccadilly Circus Red Buses', url: 'https://images.unsplash.com/photo-1526129318478-62ed807ebdf9?w=1200&auto=format&fit=crop&q=80' },
  ],
  Dubai: [
    { title: 'Burj Khalifa World Tallest Tower', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Dubai Marina Luxury Night Skyline', url: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Palm Jumeirah Island Aerial View', url: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Arabian Desert Safari Golden Dunes', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80' },
  ],
  Sydney: [
    { title: 'Sydney Opera House Sunset View', url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Sydney Harbour Bridge Aerial View', url: 'https://images.unsplash.com/photo-1523482580672-f109ba8cb9be?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Bondi Beach Coastal Waters', url: 'https://images.unsplash.com/photo-1549180030-48bf079fb38a?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Darling Harbour Evening Lights', url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&auto=format&fit=crop&q=80' },
  ],
  Venice: [
    { title: 'Grand Canal Gondolas & Rialto', url: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=1200&auto=format&fit=crop&q=80' },
    { title: 'St. Mark Square Basilica Campanile', url: 'https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Burano Island Colorful Houses', url: 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Venetian Sunset Canal Reflections', url: 'https://images.unsplash.com/photo-1498307833015-e7b400441eb8?w=1200&auto=format&fit=crop&q=80' },
  ],
  Cairo: [
    { title: 'Pyramids of Giza & Great Sphinx', url: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Nile River Sunset Sail Boat', url: 'https://images.unsplash.com/photo-1572252821143-035a4f3ec183?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Khan el-Khalili Historic Bazaar', url: 'https://images.unsplash.com/photo-1568322445389-f64ac2515020?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Mosque of Muhammad Ali Citadel', url: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=1200&auto=format&fit=crop&q=80' },
  ],
  Rio: [
    { title: 'Christ the Redeemer Corcovado Statue', url: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Sugarloaf Mountain Aerial Bay View', url: 'https://images.unsplash.com/photo-1516306580123-e6e52b1b7b5f?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Copacabana Beach Turquoise Ocean', url: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Escadaria Selarón Mosaic Steps', url: 'https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=1200&auto=format&fit=crop&q=80' },
  ],
  Barcelona: [
    { title: 'Sagrada Família Gaudi Masterpiece', url: 'https://images.unsplash.com/photo-1583422409516-2895a771df60?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Park Güell Mosaic Serpent Terrace', url: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Casa Batlló Vibrant Architecture', url: 'https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Barceloneta Beach Mediterranean Sun', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80' },
  ],
  Amsterdam: [
    { title: 'Historic Canal Houses & Bicycles', url: 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Rijksmuseum Bridge & Canal View', url: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Jordaan District Evening Lights', url: 'https://images.unsplash.com/photo-1468436139062-f60a71c5c892?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Spring Tulip Fields Horizon', url: 'https://images.unsplash.com/photo-1588714477688-cf28a50e94f7?w=1200&auto=format&fit=crop&q=80' },
  ],
  Bangkok: [
    { title: 'Grand Palace Golden Stupas', url: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Wat Arun Temple of Dawn River View', url: 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Damnoen Saduak Floating Market', url: 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Chao Phraya River Night Skyline', url: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=1200&auto=format&fit=crop&q=80' },
  ],
  Istanbul: [
    { title: 'Hagia Sophia Grand Dome Sunset', url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Blue Mosque Sultanahmet Minarets', url: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Grand Bazaar Colorful Lanterns', url: 'https://images.unsplash.com/photo-1527838832700-5059252407fa?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Bosphorus Strait Ferry Cruise', url: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1200&auto=format&fit=crop&q=80' },
  ],
  'Cape Town': [
    { title: 'Table Mountain & Camp Bay Coast', url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Bo-Kaap Colorful Heritage Houses', url: 'https://images.unsplash.com/photo-1576485290814-1c72aa4bbb8e?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Boulders Beach African Penguins', url: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Cape of Good Hope Atlantic View', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80' },
  ],
  Singapore: [
    { title: 'Marina Bay Sands & Supertrees', url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Gardens by the Bay Avatar Lights', url: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Jewel Changi Airport Rain Vortex', url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80' },
    { title: 'Merlion Park Waterfront Skyline', url: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200&auto=format&fit=crop&q=80' },
  ],
};

const BACKGROUND_TRAVEL_MUSIC = 'https://assets.mixkit.co/music/preview/mixkit-beautiful-dream-493.mp3';

// Interactive Multi-Photo Image Slider Component for Each City Card
const CityCardImageSlider = ({ city, handleOpenVideoModal }) => {
  const slides = CITY_LANDMARK_SLIDESHOWS[city.name] || [
    { title: city.name, url: city.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto slide every 2.5 seconds when hovered
  useEffect(() => {
    let timer;
    if (isHovered && slides.length > 1) {
      timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [isHovered, slides.length]);

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div 
      className="h-56 relative overflow-hidden cursor-pointer group/slider select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => handleOpenVideoModal(city)}
    >
      {/* Sliding Images */}
      {slides.map((slide, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            idx === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
          }`}
        >
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-full object-cover transform group-hover/slider:scale-110 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent"></div>
        </div>
      ))}

      {/* Slide Controls (Prev / Next Buttons) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-slate-950/80 hover:bg-brand-600 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110"
            title="Previous Landmark Photo"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1.5 rounded-full bg-slate-950/80 hover:bg-brand-600 text-white backdrop-blur-md border border-white/20 opacity-0 group-hover/slider:opacity-100 transition-all duration-300 shadow-2xl hover:scale-110"
            title="Next Landmark Photo"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Top Left: Region Pill */}
      <span className="absolute top-3 left-3 z-20 px-2.5 py-1 bg-slate-950/85 backdrop-blur-md text-brand-300 text-[10px] font-extrabold uppercase rounded-xl border border-brand-500/30 tracking-wider shadow-lg">
        {city.region}
      </span>

      {/* Top Right: Popularity Score */}
      <span className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-slate-950/85 backdrop-blur-md text-amber-400 text-xs font-black rounded-xl border border-amber-500/30 flex items-center space-x-1 shadow-lg">
        <Star className="w-3.5 h-3.5 fill-amber-400" />
        <span>{city.popularityScore}</span>
      </span>

      {/* Bottom Overlay: City Info & Photo Slider Indicator Dots */}
      <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-col space-y-1.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-2xl text-white tracking-tight leading-none drop-shadow-md">{city.name}</h3>
            <p className="text-xs text-slate-300 font-semibold flex items-center space-x-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400 shrink-0" />
              <span>{city.country}</span>
            </p>
          </div>

          <div className="p-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl shadow-lg border border-white/20 opacity-0 group-hover/slider:opacity-100 transition-opacity">
            <Play className="w-4 h-4 fill-white" />
          </div>
        </div>

        {/* Sliding Dot Indicators */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center space-x-1.5 pt-1">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIdx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex 
                    ? 'w-6 bg-cyan-400 shadow-glow' 
                    : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const CitySearchPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlSearchParam = searchParams.get('search') || '';

  const [search, setSearch] = useState(urlSearchParam);
  const [regionFilter, setRegionFilter] = useState('');
  const [costFilter, setCostFilter] = useState('all');
  const [sortBy, setSortBy] = useState('popularityScore');
  const [selectedCityModal, setSelectedCityModal] = useState(null);

  // Slideshow Video Modal State
  const [videoModalCity, setVideoModalCity] = useState(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioRef = useRef(null);

  // Sync search state with URL parameter if present
  useEffect(() => {
    if (urlSearchParam) {
      setSearch(urlSearchParam);
    }
  }, [urlSearchParam]);

  // Fetch Cities with search & region parameters
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities', search, regionFilter, sortBy],
    queryFn: async () => {
      const res = await cityApi.getCities({
        search,
        region: regionFilter,
        sortBy: sortBy === 'costLow' || sortBy === 'costHigh' ? 'costIndex' : sortBy,
        order: sortBy === 'costLow' ? 'asc' : 'desc',
      });
      return res.data.cities;
    },
  });

  // Auto-open target City Modal card when search parameter matches a city!
  useEffect(() => {
    if (urlSearchParam && cities.length > 0) {
      const match = cities.find(
        (c) =>
          c.name.toLowerCase() === urlSearchParam.toLowerCase() ||
          c.name.toLowerCase().includes(urlSearchParam.toLowerCase())
      );
      if (match) {
        setSelectedCityModal(match);
      }
    }
  }, [urlSearchParam, cities]);

  // Fetch detailed city with activities when modal is open
  const { data: detailedCity, isLoading: detailLoading } = useQuery({
    queryKey: ['cityDetail', selectedCityModal?.id],
    queryFn: async () => {
      const res = await cityApi.getCityById(selectedCityModal.id);
      return res.data.city;
    },
    enabled: !!selectedCityModal,
  });

  // Auto-advance slideshow every 3.5 seconds when playing
  useEffect(() => {
    if (!videoModalCity || !isPlaying) return;
    const slides = CITY_LANDMARK_SLIDESHOWS[videoModalCity.name] || [
      { title: videoModalCity.name, url: videoModalCity.imageUrl }
    ];

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [videoModalCity, isPlaying]);

  const handleOpenVideoModal = (city) => {
    setVideoModalCity(city);
    setCurrentSlideIndex(0);
    setIsPlaying(true);
  };

  const handleCloseModal = () => {
    setSelectedCityModal(null);
    setSearch('');
    if (urlSearchParam) {
      navigate('/cities', { replace: true });
    }
  };

  const handleClearSearch = () => {
    setSearch('');
    if (urlSearchParam) {
      navigate('/cities', { replace: true });
    }
  };

  const regions = [
    { label: 'All Regions', value: '' },
    { label: 'Europe', value: 'Europe' },
    { label: 'Asia', value: 'Asia' },
    { label: 'North America', value: 'North America' },
    { label: 'Africa', value: 'Africa' },
    { label: 'Oceania', value: 'Oceania' },
    { label: 'South America', value: 'South America' },
  ];

  // Filter cities by cost index tier if selected
  const filteredCities = cities.filter((city) => {
    if (costFilter === 'budget') return city.costIndex <= 1.0;
    if (costFilter === 'moderate') return city.costIndex > 1.0 && city.costIndex <= 1.5;
    if (costFilter === 'premium') return city.costIndex > 1.5;
    return true;
  });

  const getCostIndexTierLabel = (costIndex) => {
    if (costIndex <= 1.0) return { label: 'Budget Friendly', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', tier: '$' };
    if (costIndex <= 1.5) return { label: 'Moderate', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', tier: '$$' };
    return { label: 'Premium Destination', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', tier: '$$$' };
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="relative overflow-hidden glass-card rounded-3xl p-6 sm:p-10 border border-brand-500/30 bg-gradient-to-r from-slate-950 via-slate-900/90 to-purple-950/30 shadow-2xl">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-brand-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-brand-500/20 to-purple-500/20 text-brand-300 border border-brand-500/30 rounded-full text-xs font-bold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Cinematic Landmark Photo Slideshows & Travel Soundtracks</span>
          </div>

          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Discover Iconic <span className="bg-gradient-to-r from-brand-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">World Cities</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Experience high-definition landmark photo slideshows with travel soundtracks, popularity ratings, cost multipliers, and activity itineraries.
          </p>

          {/* Quick Stats Counter Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
            <div className="px-3.5 py-1.5 glass-card rounded-xl border border-slate-800 flex items-center space-x-2 text-slate-300">
              <Globe className="w-4 h-4 text-brand-400" />
              <span><strong>16</strong> Cities Available</span>
            </div>
            <div className="px-3.5 py-1.5 glass-card rounded-xl border border-slate-800 flex items-center space-x-2 text-slate-300">
              <ImageIcon className="w-4 h-4 text-pink-400" />
              <span><strong>64+</strong> HD Landmark Slides</span>
            </div>
            <div className="px-3.5 py-1.5 glass-card rounded-xl border border-slate-800 flex items-center space-x-2 text-slate-300">
              <Ticket className="w-4 h-4 text-emerald-400" />
              <span><strong>34+</strong> Curated Activities</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800/80 space-y-4 shadow-xl">
        {/* Search & Select Controls */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by city name, country, or region..."
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-xs"
            />
            {search && (
              <button onClick={handleClearSearch} className="absolute right-3 top-3 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Cost Index Filter Tier */}
            <select
              value={costFilter}
              onChange={(e) => setCostFilter(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl glass-input text-xs bg-slate-950 font-semibold"
            >
              <option value="all">All Cost Tiers</option>
              <option value="budget">Budget Friendly (≤ 1.0x)</option>
              <option value="moderate">Moderate (1.0x - 1.5x)</option>
              <option value="premium">Premium (&gt; 1.5x)</option>
            </select>

            {/* Sort Options */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3.5 py-2.5 rounded-2xl glass-input text-xs bg-slate-950 font-semibold"
            >
              <option value="popularityScore">Sort by Popularity (High to Low)</option>
              <option value="costLow">Sort by Cost (Low to High)</option>
              <option value="costHigh">Sort by Cost (High to Low)</option>
              <option value="name">Sort Alphabetically</option>
            </select>
          </div>
        </div>

        {/* Region Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {regions.map((reg) => (
            <button
              key={reg.label}
              onClick={() => setRegionFilter(reg.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                regionFilter === reg.value
                  ? 'bg-gradient-to-r from-brand-600 to-purple-600 text-white shadow-glow border border-brand-400/40'
                  : 'glass-card text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cities Card Grid */}
      {isLoading ? (
        <GridSkeleton count={8} />
      ) : filteredCities.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center space-y-4 border border-slate-800">
          <Compass className="w-12 h-12 text-brand-400 mx-auto animate-bounce" />
          <h3 className="font-display font-extrabold text-xl text-white">No Cities Match Your Filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try clearing your search query or switching your region/cost filter.
          </p>
          <button
            onClick={handleClearSearch}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow-glow"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCities.map((city) => {
            const costTier = getCostIndexTierLabel(city.costIndex);
            return (
              <div
                key={city.id}
                className="glass-card glass-card-hover rounded-3xl overflow-hidden border border-slate-800/90 flex flex-col justify-between group shadow-xl"
              >
                {/* Interactive Multi-Photo Image Slider Header */}
                <CityCardImageSlider city={city} handleOpenVideoModal={handleOpenVideoModal} />

                {/* City Info Card Body */}
                <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Cost Tier Badge */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase border ${costTier.color}`}>
                        {costTier.label} ({costTier.tier})
                      </span>
                      <span className="text-slate-400 font-bold">Multiplier: <strong className="text-emerald-400">{city.costIndex}x</strong></span>
                    </div>

                    {/* Curated Activity Count */}
                    <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <span className="flex items-center space-x-1.5 text-slate-400 font-medium">
                        <Ticket className="w-3.5 h-3.5 text-purple-400" />
                        <span>Curated Activities</span>
                      </span>
                      <span className="font-extrabold text-brand-400">{city._count?.activities || 0} Items</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenVideoModal(city)}
                      className="flex-1 py-2 bg-gradient-to-r from-pink-600/30 to-purple-600/30 hover:from-pink-600/50 hover:to-purple-600/50 text-pink-300 font-bold text-xs rounded-xl transition-all border border-pink-500/40 flex items-center justify-center space-x-1.5 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                      <span>Watch Photo Slideshow</span>
                    </button>
                    <button
                      onClick={() => setSelectedCityModal(city)}
                      className="px-3.5 py-2 bg-slate-800/90 hover:bg-slate-700 text-brand-300 font-bold text-xs rounded-xl transition-colors border border-slate-700/60"
                      title="View activities & itinerary details"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cinematic Landmark Photo Slideshow Fullscreen Modal with Ambient Soundtrack */}
      {videoModalCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-xl animate-fade-in">
          <audio
            ref={audioRef}
            src={BACKGROUND_TRAVEL_MUSIC}
            autoPlay
            loop
            muted={isAudioMuted}
          />

          <div className="glass-card rounded-3xl max-w-4xl w-full border border-pink-500/40 shadow-2xl overflow-hidden flex flex-col space-y-0 relative">
            {/* Header Controls */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between z-10">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-pink-500/10 text-pink-400 border border-pink-500/20 rounded-xl">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white flex items-center space-x-2">
                    <span>{videoModalCity.name} Landmark Slideshow</span>
                    <span className="px-2 py-0.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-black rounded-md">HD CINEMATIC</span>
                  </h3>
                  <p className="text-xs text-slate-400">{videoModalCity.country} • {videoModalCity.region}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const target = videoModalCity;
                    setVideoModalCity(null);
                    setSelectedCityModal(target);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-brand-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                >
                  View Activities
                </button>
                <button
                  onClick={() => setVideoModalCity(null)}
                  className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cinematic Landmark Photo Slideshow Container with Ken Burns Pan/Zoom */}
            <div className="relative w-full aspect-video bg-slate-950 overflow-hidden flex items-center justify-center group">
              {(() => {
                const slides = CITY_LANDMARK_SLIDESHOWS[videoModalCity.name] || [
                  { title: videoModalCity.name, url: videoModalCity.imageUrl }
                ];
                const currentSlide = slides[currentSlideIndex % slides.length];

                return (
                  <div className="relative w-full h-full">
                    {/* Landmark Image with Smooth Motion Zoom */}
                    <img
                      key={currentSlide.url}
                      src={currentSlide.url}
                      alt={currentSlide.title}
                      className="w-full h-full object-cover animate-fade-in transform scale-105 group-hover:scale-110 transition-transform duration-1000"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

                    {/* Sound Audio Toggle Button */}
                    <button
                      onClick={() => setIsAudioMuted(!isAudioMuted)}
                      className="absolute top-4 left-4 px-3.5 py-1.5 bg-slate-950/80 hover:bg-slate-900 text-white text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-2 shadow-2xl backdrop-blur-md transition-all z-20"
                    >
                      {isAudioMuted ? (
                        <>
                          <VolumeX className="w-4 h-4 text-rose-400" />
                          <span>Travel Music Muted (Click to Play)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                          <span>Travel Soundscape Playing 🎵</span>
                        </>
                      )}
                    </button>

                    {/* Landmark Title Badge */}
                    <div className="absolute bottom-16 left-6 right-6 flex items-center justify-between">
                      <div className="px-4 py-2 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800 text-white shadow-2xl">
                        <p className="text-[10px] uppercase font-bold text-pink-400 tracking-wider">
                          Landmark {currentSlideIndex + 1} of {slides.length}
                        </p>
                        <h4 className="font-display font-black text-lg text-white">{currentSlide.title}</h4>
                      </div>

                      {/* Pause / Play Slideshow Button */}
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 bg-slate-950/80 hover:bg-slate-900 text-white rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-md transition-all"
                        title={isPlaying ? 'Pause Slideshow' : 'Resume Slideshow'}
                      >
                        {isPlaying ? <Pause className="w-5 h-5 text-amber-400" /> : <Play className="w-5 h-5 text-emerald-400" />}
                      </button>
                    </div>

                    {/* Slide Navigation Arrows */}
                    <button
                      onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-slate-950/70 hover:bg-slate-900 text-white rounded-2xl border border-slate-800 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % slides.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-slate-950/70 hover:bg-slate-900 text-white rounded-2xl border border-slate-800 backdrop-blur-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Thumbnail Strip */}
                    <div className="absolute bottom-4 left-6 right-6 flex items-center justify-center space-x-2">
                      {slides.map((s, idx) => (
                        <button
                          key={s.title}
                          onClick={() => setCurrentSlideIndex(idx)}
                          className={`h-2 rounded-full transition-all ${
                            idx === currentSlideIndex ? 'w-8 bg-pink-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Viewing <strong>{videoModalCity.name}</strong> landmark photo motion slideshow. Start planning your trip!
              </div>
              <div className="flex items-center space-x-3 w-full sm:w-auto">
                <button
                  onClick={() => setVideoModalCity(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Close Slideshow
                </button>
                <button
                  onClick={() => {
                    setVideoModalCity(null);
                    navigate('/trips/new');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-glow flex items-center space-x-1.5"
                >
                  <span>Plan Trip to {videoModalCity.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* City Detail & Activities Preview Modal */}
      {selectedCityModal && !videoModalCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
          <div className="glass-card rounded-3xl max-w-2xl w-full border border-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="relative h-56 flex-shrink-0 overflow-hidden bg-slate-950">
              <img
                src={selectedCityModal.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&auto=format&fit=crop&q=80'}
                alt={selectedCityModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>

              {/* Watch Video Trailer Button */}
              <button
                onClick={() => handleOpenVideoModal(selectedCityModal)}
                className="absolute top-4 left-4 px-3.5 py-1.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-[10px] font-black uppercase rounded-xl flex items-center space-x-1.5 shadow-lg border border-white/20 tracking-wider hover:scale-105 transition-transform"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Play Photo Slideshow</span>
              </button>

              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 bg-slate-950/80 text-slate-300 hover:text-white rounded-full border border-slate-700 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex justify-between items-end">
                <div>
                  <h3 className="font-display font-black text-3xl text-white drop-shadow-md">{selectedCityModal.name}</h3>
                  <p className="text-xs text-slate-200 font-bold flex items-center space-x-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedCityModal.country} • {selectedCityModal.region}</span>
                  </p>
                </div>
                <span className="px-3 py-1 bg-amber-500/90 text-slate-950 font-black text-xs rounded-xl flex items-center space-x-1 shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{selectedCityModal.popularityScore}</span>
                </span>
              </div>
            </div>

            {/* Modal Body Activities List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span>Curated Activities ({detailedCity?.activities?.length || 0})</span>
                </h4>
                <span className="text-xs text-emerald-400 font-bold">Cost Index: {selectedCityModal.costIndex}x</span>
              </div>

              {detailLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading city activities...</div>
              ) : (!detailedCity?.activities || detailedCity.activities.length === 0) ? (
                <p className="text-xs text-slate-500 italic py-4 text-center">No curated activities for this city yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {detailedCity.activities.map((act) => (
                    <div key={act.id} className="p-3 glass-card rounded-2xl border border-slate-800 flex items-center space-x-3 hover:border-slate-700 transition-colors">
                      {act.imageUrl && (
                        <img src={act.imageUrl} alt={act.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-xs text-white truncate">{act.name}</p>
                        <p className="text-[10px] text-slate-400 capitalize mt-0.5">{act.category} • {act.durationHours} hrs</p>
                        <p className="text-xs font-extrabold text-emerald-400 mt-1">{formatCurrency(act.estimatedCost)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer CTA */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleCloseModal();
                  navigate('/trips/new');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-brand-600 via-brand-500 to-purple-600 hover:from-brand-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-glow flex items-center space-x-1.5"
              >
                <span>Plan Trip with {selectedCityModal.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
