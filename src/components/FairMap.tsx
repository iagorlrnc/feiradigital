import { useMemo, useState, useRef, useEffect } from "react"
import { ZoomIn, ZoomOut, Maximize, Info, LayoutGrid, Map } from "lucide-react"
import type { Store } from "../lib/supabase"
import { CATEGORY_ICONS } from "../lib/supabase"
import LocationMap from "./LocationMap"

interface FairMapProps {
  stores: Store[]
  selectedStore?: Store | null
  onSelectStore?: (store: Store | null) => void
  editable?: boolean
  editingPosition?: { x: number; y: number } | null
  onSelectPosition?: (x: number, y: number) => void
  occupiedPositions?: { x: number; y: number; storeId: string }[]
  currentStoreId?: string
  myStoreIds?: string[]
}

const GRID_COLS = 30
const GRID_ROWS = 30

// Sector Definition mapping to the architectural blueprint
interface Sector {
  id: string;
  name: string;
  color: string;
  activeColor: string;
  bounds: { minX: number, maxX: number, minY: number, maxY: number }[];
}

const SECTORS: Sector[] = [
  {
    id: 'FOOD',
    name: 'Praças de Alimentação',
    color: 'bg-rose-400',
    activeColor: 'bg-rose-600',
    bounds: [
      { minX: 2, maxX: 7, minY: 6, maxY: 11 }, // Left curve
      { minX: 12, maxX: 17, minY: 6, maxY: 7 }, // Middle top
      { minX: 4, maxX: 10, minY: 20, maxY: 21 }, // Below snack 1
      { minX: 12, maxX: 18, minY: 20, maxY: 21 }, // Below snack 2
      { minX: 20, maxX: 21, minY: 11, maxY: 19 }, // Vertical strip right center
    ]
  },
  {
    id: 'SNACK',
    name: 'Lanchonetes',
    color: 'bg-amber-300', // Olive/Yellowish
    activeColor: 'bg-amber-500',
    bounds: [
      { minX: 4, maxX: 10, minY: 13, maxY: 18 }, // Center left
      { minX: 12, maxX: 18, minY: 13, maxY: 18 }, // Center right
    ]
  },
  {
    id: 'SPICE',
    name: 'Temperos',
    color: 'bg-indigo-400',
    activeColor: 'bg-indigo-600',
    bounds: [
      { minX: 19, maxX: 23, minY: 4, maxY: 9 }, // Top right center
    ]
  },
  {
    id: 'FLOUR',
    name: 'Farinha / Frutas',
    color: 'bg-cyan-400',
    activeColor: 'bg-cyan-600',
    bounds: [
      { minX: 25, maxX: 29, minY: 4, maxY: 10 }, // Top right
    ]
  },
  {
    id: 'VEG',
    name: 'Hortifruti',
    color: 'bg-emerald-400',
    activeColor: 'bg-emerald-600',
    bounds: [
      { minX: 25, maxX: 29, minY: 12, maxY: 27 }, // Bottom right big vertical block
      { minX: 23, maxX: 24, minY: 21, maxY: 27 }, // Bottom right inner
    ]
  },
  {
    id: 'PLANT',
    name: 'Mudas / Plantas',
    color: 'bg-green-600', // Dark Green
    activeColor: 'bg-green-800',
    bounds: [
      { minX: 8, maxX: 11, minY: 24, maxY: 29 }, // Bottom left near entrance
    ]
  },
  {
    id: 'STAGE',
    name: 'Palco',
    color: 'bg-violet-400',
    activeColor: 'bg-violet-600',
    bounds: [
      { minX: 14, maxX: 22, minY: 24, maxY: 26 }, // Bottom stage
    ]
  },
  {
    id: 'SUPPORT',
    name: 'Apoio / SAC',
    color: 'bg-slate-400', // Brown/Purple mix
    activeColor: 'bg-slate-600',
    bounds: [
      { minX: 1, maxX: 3, minY: 18, maxY: 21 }, // Bottom far left
      { minX: 16, maxX: 20, minY: 1, maxY: 3 }, // Top side of top entrance
    ]
  }
];

function getSectorForCell(x: number, y: number): Sector | null {
  for (const sector of SECTORS) {
    for (const bound of sector.bounds) {
      if (x >= bound.minX && x <= bound.maxX && y >= bound.minY && y <= bound.maxY) {
        return sector;
      }
    }
  }
  return null;
}

export default function FairMap({
  stores,
  selectedStore,
  onSelectStore,
  editable = false,
  editingPosition,
  onSelectPosition,
  currentStoreId,
  myStoreIds = [],
}: FairMapProps) {
  const [zoom, setZoom] = useState(1)
  const [now, setNow] = useState(new Date())
  const [mapMode, setMapMode] = useState<'blueprint' | 'real'>(editable ? 'blueprint' : 'real')
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [scrollTop, setScrollTop] = useState(0)
  const dragDistance = useRef(0)

  // Auto-fit zoom on mount
  useEffect(() => {
    if (!containerRef.current) return
    const containerWidth = containerRef.current.clientWidth
    const mapBaseSize = 909
    const targetZoom = (containerWidth * 0.95) / mapBaseSize
    const initialZoom = Math.min(Math.max(targetZoom, 0.4), 2.5)
    setZoom(initialZoom)
  }, [])

  // Keep 'now' updated for flash offer expiration checks
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-scroll to selected/editing position
  useEffect(() => {
    if (mapMode === 'blueprint' && containerRef.current && (editingPosition || selectedStore)) {
      const targetX = editingPosition?.x ?? selectedStore?.booth_x
      const targetY = editingPosition?.y ?? selectedStore?.booth_y
      
      if (targetX !== undefined && targetY !== undefined) {
        const cellWidth = 24 // Base cell size
        const gridPadding = 48 // p-12 is 48px
        const outerPadding = 80 // p-20 is 80px
        
        const scrollX = outerPadding + (targetX * cellWidth + gridPadding + 12) * zoom - containerRef.current.clientWidth / 2
        const scrollY = outerPadding + (targetY * cellWidth + gridPadding + 12) * zoom - containerRef.current.clientHeight / 2
        
        containerRef.current.scrollTo({
          left: scrollX,
          top: scrollY,
          behavior: 'smooth'
        })
      }
    }
  }, [mapMode, zoom, editingPosition, selectedStore])

  const storeMap = useMemo(() => {
    const map: Record<string, Store> = {}
    stores.forEach((s) => {
      map[`${s.booth_x},${s.booth_y}`] = s
    })
    return map
  }, [stores])

  const cells = useMemo(() => {
    const result = []
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        result.push({ x, y, sector: getSectorForCell(x, y) })
      }
    }
    return result
  }, [])

  function getCellState(x: number, y: number, sector: Sector | null) {
    if (!sector) return "corridor"
    const store = storeMap[`${x},${y}`]
    if (store) {
      if (store.id === currentStoreId) return "mine"
      if (myStoreIds.includes(store.id)) return "my-other-store"
      if (store.id === selectedStore?.id) return "selected"
      return "occupied"
    }
    if (editingPosition?.x === x && editingPosition?.y === y)
      return "editing"
    return "empty"
  }

  function handleCellClick(x: number, y: number, sector: Sector | null) {
    if (dragDistance.current > 5) return 
    if (!sector) return 
    const store = storeMap[`${x},${y}`]
    if (store && onSelectStore) {
      onSelectStore(selectedStore?.id === store.id ? null : store)
    } else if (editable && onSelectPosition) {
      onSelectPosition(x, y)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    dragDistance.current = 0
    setStartX(e.pageX - (containerRef.current?.offsetLeft || 0))
    setStartY(e.pageY - (containerRef.current?.offsetTop || 0))
    setScrollLeft(containerRef.current?.scrollLeft || 0)
    setScrollTop(containerRef.current?.scrollTop || 0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    e.preventDefault()
    const x = e.pageX - (containerRef.current.offsetLeft || 0)
    const y = e.pageY - (containerRef.current.offsetTop || 0)
    const walkX = (x - startX) * 1.5
    const walkY = (y - startY) * 1.5
    dragDistance.current += Math.abs(x - startX) + Math.abs(y - startY)
    containerRef.current.scrollLeft = scrollLeft - walkX
    containerRef.current.scrollTop = scrollTop - walkY
  }

  return (
    <div className="flex flex-col h-[600px] relative w-full overflow-hidden">
      {/* View Switcher */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex p-1 bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50">
        <button 
          type="button"
          onClick={() => setMapMode('blueprint')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mapMode === 'blueprint' ? 'bg-palmas-blue text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutGrid size={14} /> Esquema
        </button>
        <button 
          type="button"
          onClick={() => setMapMode('real')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            mapMode === 'real' ? 'bg-palmas-blue text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Map size={14} /> Real
        </button>
      </div>

      {mapMode === 'real' ? (
        <div className="flex-1 animate-fade-in">
          <LocationMap />
        </div>
      ) : (
        <>
      {/* Zoom Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl shadow-2xl border border-white/50">
        <button type="button" onClick={() => setZoom(prev => Math.min(prev + 0.25, 3))} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-700 transition-all active:scale-95">
          <ZoomIn size={18} />
        </button>
        <button type="button" onClick={() => setZoom(prev => Math.max(prev - 0.25, 0.4))} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-700 transition-all active:scale-95">
          <ZoomOut size={18} />
        </button>
        <div className="h-px bg-gray-100 mx-2" />
        <button type="button" onClick={() => setZoom(1)} className="p-2.5 hover:bg-gray-100 rounded-xl text-gray-700 transition-all active:scale-95">
          <Maximize size={18} />
        </button>
      </div>

      {/* Legend Popover (Optional but nice) */}
      <div className="absolute top-6 left-6 z-10">
        <div className="group relative">
          <button type="button" className="w-10 h-10 bg-white shadow-xl border border-gray-100 rounded-full flex items-center justify-center text-palmas-blue hover:scale-110 transition-all">
            <Info size={20} />
          </button>
          <div className="absolute left-0 mt-3 p-5 bg-white/95 backdrop-blur-md border border-gray-100 rounded-3xl shadow-2xl w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all translate-y-2 group-hover:translate-y-0">
            <h4 className="font-bold text-gray-900 text-sm mb-4">Setores da Feira</h4>
            <div className="grid gap-3">
              {SECTORS.map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-lg ${s.color} border border-black/5`} />
                  <span className="text-[11px] text-gray-600 font-bold uppercase tracking-wider">{s.name}</span>
                </div>
              ))}
              <div className="h-px bg-gray-100 my-1" />
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-lg bg-black border border-black/10" />
                <span className="text-[11px] text-gray-900 font-black uppercase tracking-wider">Espaço Ocupado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-50 relative select-none custom-scrollbar"
        style={{ cursor: isDragging ? 'grabbing' : (zoom > 0.8 ? 'grab' : 'default') }}
        onMouseDown={handleMouseDown}
        onMouseLeave={() => setIsDragging(false)}
        onMouseUp={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
      >
        <div className="min-w-max min-h-max p-20">
          <div style={{ 
            width: 909 * zoom, 
            height: 909 * zoom, 
            transition: 'width 0.3s, height 0.3s',
            margin: zoom < 1 ? '0 auto' : '0' 
          }}>
            <div 
              className="transition-transform duration-300 origin-top-left"
              style={{ transform: `scale(${zoom})`, width: 909, height: 909 }}
            >
              <div
                className="grid gap-px bg-white p-12 shadow-2xl border border-gray-200 rounded-[2rem] relative"
                style={{ 
                  gridTemplateColumns: `repeat(${GRID_COLS}, 24px)`,
                  gridTemplateRows: `repeat(${GRID_ROWS}, 24px)`
                }}
              >
                {cells.map(({ x, y, sector }) => {
                  const state = getCellState(x, y, sector)
                  const store = storeMap[`${x},${y}`]
                  const icon = store ? CATEGORY_ICONS[store.category as keyof typeof CATEGORY_ICONS] : ""

                  let cellClass = "relative rounded-md border border-transparent transition-all duration-300 flex items-center justify-center "
                  
                  if (state === "corridor") {
                    cellClass += "bg-transparent"
                  } else if (state === "mine") {
                    cellClass += "bg-black text-white border-black z-10 scale-125 shadow-2xl ring-4 ring-green-500/30 cursor-pointer"
                  } else if (state === "selected") {
                    cellClass += "bg-black text-white border-black z-10 scale-150 shadow-2xl ring-4 ring-palmas-blue/30 cursor-pointer"
                  } else if (state === "my-other-store") {
                    cellClass += "bg-gray-800 text-white border-gray-800 z-10 scale-110 shadow-lg ring-2 ring-gray-400/30 cursor-pointer"
                  } else if (state === "occupied") {
                    cellClass += "bg-black/90 hover:bg-black text-white border-black/90 cursor-pointer shadow-lg hover:scale-125 hover:z-20 z-10"
                  } else if (state === "editing") {
                    cellClass += "bg-palmas-blue text-white animate-pulse border-palmas-blue ring-4 ring-palmas-blue/20 cursor-pointer"
                  } else {
                    cellClass += `${sector?.color} border-black/5 cursor-pointer hover:scale-125 hover:z-20 hover:shadow-xl opacity-90 hover:opacity-100`
                  }

                  const isFlashActive = store?.offer_expires_at && new Date(store.offer_expires_at) > now

                  if (isFlashActive) {
                    cellClass += " ring-1 ring-orange-500 animate-pulse shadow-[0_0_20px_rgba(249,115,22,1)] z-40 scale-125 bg-orange-500 "
                  }

                  return (
                    <div
                      key={`${x},${y}`}
                      onClick={() => handleCellClick(x, y, sector)}
                      className={cellClass}
                      title={store?.name || sector?.name || "Corredor"}
                    >
                      {store?.logo_url ? (
                        <img src={store.logo_url} alt="" className="w-full h-full object-cover rounded-[3px]" />
                      ) : (
                        state !== "corridor" && (
                          <span className="text-[10px] leading-none transform transition-transform group-hover:scale-110">
                            {icon}
                          </span>
                        )
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

        </>
      )}
    </div>
  )
}

