import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import styled, { createGlobalStyle } from 'styled-components'
import { actions } from './store.js'
import L from 'leaflet'
import { FaMapMarkerAlt, FaCloudRain, FaSun, FaExclamationTriangle, FaCheckCircle } from 'react-icons/fa'

const Global = createGlobalStyle`
  :root { color-scheme: dark; }
  * { box-sizing: border-box }
  body { margin: 0; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; background: #0b0f19; color: #f9fafb }
  #map { width: 100%; height: 100%; border-radius: 12px }
  .leaflet-top.leaflet-right { right: 12px; top: 12px }
  .leaflet-bottom.leaflet-left { left: 12px; bottom: 12px }
  
  /* Enhanced focus indicators for WCAG 2.1 AA compliance */
  :focus-visible { 
    outline: 3px solid #60a5fa; 
    outline-offset: 2px; 
    border-radius: 4px;
  }
  
  /* High contrast mode support */
  @media (prefers-contrast: high) {
    :root { 
      --color-red: #ff0000;
      --color-yellow: #ffff00;
      --color-green: #00ff00;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* Better color contrast for text */
  .badge-red { background: #dc2626 !important; color: #ffffff !important; border-color: #991b1b !important; }
  .badge-yellow { background: #f59e0b !important; color: #000000 !important; border-color: #d97706 !important; }
  .badge-green { background: #10b981 !important; color: #000000 !important; border-color: #059669 !important; }
  
  /* Enhanced tooltip styling */
  .custom-tooltip {
    background: rgba(0, 0, 0, 0.9) !important;
    color: #ffffff !important;
    border: 1px solid #374151 !important;
    border-radius: 8px !important;
    padding: 12px !important;
    font-size: 13px !important;
    line-height: 1.4 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
  }
  
  .custom-tooltip::before {
    border-top-color: rgba(0, 0, 0, 0.9) !important;
  }
`

const Layout = styled.main`
  display: grid; gap: 12px; padding: 12px;
  grid-template-columns: 25% 60% 15%; grid-template-rows: calc(100vh - 80px);
  height: calc(100vh - 80px);
  @media(max-width:1023px){ grid-template-columns: 30% 70%; grid-template-rows: 60vh auto }
  @media(max-width:767px){ grid-template-columns: 1fr; grid-template-rows: auto 60vh auto }
`
const Header = styled.header`
  display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:#111827;border-bottom:1px solid #1f2937
`
const Title = styled.h1` margin:0;font-size:18px `
const Btn = styled.button`
  padding:8px 12px;border:1px solid #374151;background:#111827;color:#f9fafb;border-radius:8px;cursor:pointer;
  transition: transform .2s ease, background .2s ease, outline .2s ease; will-change: transform;
  &:hover { transform: translateY(-1px); background: #1f2937; }
  &:focus-visible { outline: 3px solid #60a5fa; outline-offset: 2px; }
  &:active { transform: translateY(0); }
  &:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
`
const Panel = styled.section` background:#111827;border-radius:12px;box-shadow:0 2px 6px rgba(0,0,0,.4);padding:12px;overflow:auto `
const MapWrap = styled.section` position:relative `
const Badge = styled.span` padding:6px 10px;border-radius:999px;font-weight:700;font-size:12px;border:1px solid #374151 `
const LegendRow = styled.div` display:flex;align-items:center;gap:8px;font-size:14px;color:#cbd5e1 `
const Dot = styled.span` width:12px;height:12px;border-radius:50%;display:inline-block;border:2px solid #374151 `
const Traffic = styled.div` display:flex;gap:6px `
const Light = styled.span` width:14px;height:14px;border-radius:50%;opacity:.35 `

function formatBRDateTime(s){ const [d,t]=s.split(' '); const [y,m,day]=d.split('-'); return `${day}/${m}/${y} ${t}` }
function riskLabelPT(r){ if(r==='red') return 'Alto'; if(r==='yellow') return 'Moderado'; return 'Baixo' }
function pickIcon(c){ if(c.precipitation>=1) return '🌧'; if(c.riskLevel==='red') return '⛈'; if(c.riskLevel==='yellow') return '🌦'; if(c.humidity>80) return '☁'; return '☀' }

function MapView(){ 
  const ref = useRef(null); 
  const dispatch = useDispatch(); 
  const current = useSelector(s=>s.weather.current); 
  const zoneLayers = useSelector(s=>s.ui.zoneLayers); 
  const mapRef = useRef(null);
  const trafficIndex = useMemo(()=> current.riskLevel==='red'?0: current.riskLevel==='yellow'?1:2, [current]); 
  
  useEffect(()=>{ dispatch(actions.ui.setTrafficIndex(trafficIndex)) },[trafficIndex]); 
  
  useEffect(()=>{ 
    const map = L.map(ref.current,{ center:[-16.6869,-49.2648], zoom:12, minZoom:11, maxZoom:18, zoomControl:true }); 
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{ attribution:'&copy; OpenStreetMap contributors' }).addTo(map); 
    L.control.scale({ position:'bottomleft' }).addTo(map); 
    const redColor='#dc2626', redStroke='#991b1b', yellow='#f59e0b', yellowStroke='#d97706', green='#10b981', greenStroke='#059669'; 
    const Z={ red:[{name:'Marginal Botafogo',desc:'Alagamentos severos recorrentes',lat:-16.7103,lng:-49.2539},{name:'Av. Feira de Santana',desc:'Transbordamento do Córrego Serrinha',lat:-16.6731,lng:-49.2394},{name:'Avenida 87 (Setor Sul)',desc:'Histórico de vias bloqueadas',lat:-16.7072,lng:-49.2706},{name:'Vila Redenção',desc:'Alagamentos do Córrego Botafogo',lat:-16.7289,lng:-49.2656},{name:'Residencial Goiânia Viva',desc:'Enxurradas recorrentes',lat:-16.6569,lng:-49.3031},{name:'Pedro Ludovico',desc:'Inundação intensa',lat:-16.7267,lng:-49.2967},{name:'Parque Industrial João Braz',desc:'Risco elevado',lat:-16.7439,lng:-49.3111},{name:'Setor Finsocial',desc:'Enchentes crônicas',lat:-16.6872,lng:-49.3097}], yellow:[{name:'Centro — Av. Paranaíba',desc:'Alagamentos em pancadas rápidas',lat:-16.6789,lng:-49.2553},{name:'Ginásio Rio Vermelho',desc:'Episódios de alagamento',lat:-16.6992,lng:-49.2650},{name:'Av. Dona Gercina Borges',desc:'Enxurradas moderadas',lat:-16.6900,lng:-49.2789},{name:'Alameda dos Buritis',desc:'Incidência média',lat:-16.6911,lng:-49.2656},{name:'Bairro Feliz',desc:"Invasões d'água repetidas",lat:-16.7011,lng:-49.2817},{name:'Av. José Rodrigues',desc:'Situações moderadas',lat:-16.6722,lng:-49.2392},{name:'Av. Anhanguera',desc:'Tráfego prejudicado',lat:-16.7056,lng:-49.2686}], green:[{name:'Região Norte',desc:'Baixo risco',lat:-16.6450,lng:-49.2700},{name:'Região Leste',desc:'Risco mínimo',lat:-16.6800,lng:-49.2200},{name:'Cidade Jardim',desc:'Ocorrência menos frequente',lat:-16.7200,lng:-49.2400},{name:'Mendanha',desc:'Baixa intensidade',lat:-16.7400,lng:-49.2800},{name:'Setor Sudoeste',desc:'Risco mínimo',lat:-16.7500,lng:-49.2900}]}; 
    
    const layerGroups = {};
    Object.entries(Z).forEach(([level,list])=>{ 
      const color=level==='red'?redColor: level==='yellow'?yellow:green; 
      const stroke=level==='red'?redStroke: level==='yellow'?yellowStroke:greenStroke; 
      layerGroups[level] = L.layerGroup();
      list.forEach(p=>{ 
        const circle = L.circle([p.lat,p.lng],{ 
          color, 
          fillColor:color, 
          fillOpacity:0.35, 
          radius:level==='red'?450: level==='yellow'?350:250, 
          weight:3, 
          className:`zone-${level}` 
        });
        
        // Enhanced tooltip with detailed information
        const tooltipContent = `
          <div style="min-width: 200px;">
            <strong style="color: ${color}; font-size: 14px;">${p.name}</strong><br/>
            <span style="color: #666; font-size: 12px;">${p.desc}</span><br/>
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span>Nível de risco:</span>
                <span style="color: ${color}; font-weight: bold;">${level==='red'?'ALTO':level==='yellow'?'MODERADO':'BAIXO'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
                <span>Área aproximada:</span>
                <span>${level==='red'?'450m':level==='yellow'?'350m':'250m'} raio</span>
              </div>
            </div>
          </div>
        `;
        
        circle.bindTooltip(tooltipContent, {
          permanent: false,
          direction: 'top',
          offset: [0, -10],
          className: 'custom-tooltip'
        });
        
        circle.on('mouseover', function(e) {
          this.openTooltip();
        });
        
        circle.on('mouseout', function(e) {
          this.closeTooltip();
        });
        
        circle.addTo(layerGroups[level]);
      }) 
    }); 
    
    // Add layers to map based on visibility
    Object.entries(layerGroups).forEach(([level, group]) => {
      if (zoneLayers[level]) {
        map.addLayer(group);
      }
    });
    
    // Store references
    mapRef.current = map;
    map.layerGroups = layerGroups;
    
    return ()=>map.remove() 
  },[]); 

  // Handle layer visibility changes
  useEffect(() => {
    if (mapRef.current && mapRef.current.layerGroups) {
      Object.entries(zoneLayers).forEach(([level, visible]) => {
        const group = mapRef.current.layerGroups[level];
        if (group) {
          if (visible) {
            mapRef.current.addLayer(group);
          } else {
            mapRef.current.removeLayer(group);
          }
        }
      });
    }
  }, [zoneLayers]);

  return <div id="map" ref={ref} role="application" aria-label="Mapa de Goiânia com zonas de risco"/> 
}

function Controls(){ const dispatch = useDispatch(); const current = useSelector(s=>s.weather.current); function simulateUpdate(){ const delta = (Math.random()-0.5)*1.0; const temperature = Math.max(15, Math.min(40, current.temperature + delta)); const precipitation = Math.max(0, current.precipitation + Math.random()*0.2); const humidity = Math.max(30, Math.min(100, current.humidity + Math.round((Math.random()-0.5)*4))); const windSpeed = Math.max(0, current.windSpeed + (Math.random()-0.5)); const score = Math.min(1, (precipitation/5) + (humidity/100)*0.4 + (windSpeed/30)*0.2); const riskLevel = score>0.6?'red': score>0.35?'yellow':'green'; const description = riskLevel==='red'?'Risco alto — tempestades possíveis': riskLevel==='yellow'?'Risco moderado — instabilidade possível':'Baixo risco — tempo relativamente estável'; const now = new Date(); const ts = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`; dispatch(actions.weather.setCurrent({ temperature, precipitation, humidity, windSpeed, riskLevel, description, timestamp: ts })) }
  function locate(){ 
    if(!navigator.geolocation) {
      alert('Geolocalização não suportada neste navegador');
      return; 
    } 
    
    navigator.geolocation.getCurrentPosition(
      pos => { 
        const {latitude, longitude} = pos.coords; 
        
        // Check if user is within any risk zone
        const zones = [
          // Red zones (high risk)
          { name: 'Marginal Botafogo', lat: -16.7103, lng: -49.2539, risk: 'red', radius: 0.0045 },
          { name: 'Av. Feira de Santana', lat: -16.6731, lng: -49.2394, risk: 'red', radius: 0.0045 },
          { name: 'Avenida 87 (Setor Sul)', lat: -16.7072, lng: -49.2706, risk: 'red', radius: 0.0045 },
          { name: 'Vila Redenção', lat: -16.7289, lng: -49.2656, risk: 'red', radius: 0.0045 },
          
          // Yellow zones (moderate risk)
          { name: 'Centro — Av. Paranaíba', lat: -16.6789, lng: -49.2553, risk: 'yellow', radius: 0.0035 },
          { name: 'Ginásio Rio Vermelho', lat: -16.6992, lng: -49.2650, risk: 'yellow', radius: 0.0035 },
          { name: 'Av. Dona Gercina Borges', lat: -16.6900, lng: -49.2789, risk: 'yellow', radius: 0.0035 },
          
          // Green zones (low risk)
          { name: 'Parque Areião', lat: -16.6806, lng: -49.2369, risk: 'green', radius: 0.0025 },
          { name: 'Setor Aeroporto', lat: -16.6322, lng: -49.2367, risk: 'green', radius: 0.0025 },
          { name: 'Campinas', lat: -16.7089, lng: -49.2206, risk: 'green', radius: 0.0025 }
        ];
        
        let userInZone = null;
        let minDistance = Infinity;
        
        zones.forEach(zone => {
          const distance = Math.sqrt(
            Math.pow(latitude - zone.lat, 2) + Math.pow(longitude - zone.lng, 2)
          );
          
          if (distance <= zone.radius && distance < minDistance) {
            minDistance = distance;
            userInZone = zone;
          }
        });
        
        if (userInZone) {
          const riskText = userInZone.risk === 'red' ? 'ALTO RISCO' : 
                          userInZone.risk === 'yellow' ? 'RISCO MODERADO' : 'BAIXO RISCO';
          const riskColor = userInZone.risk === 'red' ? '#dc2626' : 
                           userInZone.risk === 'yellow' ? '#f59e0b' : '#10b981';
          
          alert(`📍 Você está em: ${userInZone.name}\n\n` +
                `⚠️ ${riskText}\n\n` +
                `Coordenadas: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n\n` +
                `Esta área está classificada como ${userInZone.risk === 'red' ? 'alto risco' : 
                  userInZone.risk === 'yellow' ? 'risco moderado' : 'baixo risco'} para alagamentos.`);
        } else {
          alert(`📍 Sua localização: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}\n\n` +
                `✅ Você não está em uma zona de risco mapeada.\n\n` +
                `Mantenha-se informado sobre as condições climáticas.`);
        }
      },
      error => {
        alert('Não foi possível obter sua localização. Por favor, verifique as permissões do navegador.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }
  return <div><Btn aria-label="Atualizar dados" title="Atualizar" onClick={simulateUpdate}>Atualizar</Btn> <Btn aria-label="Minha localização" title="Minha localização" onClick={locate}>Minha localização</Btn></div>
}

function Dashboard(){ 
  const current = useSelector(s=>s.weather.current); 
  const ui = useSelector(s=>s.ui); 
  const badgeClass = current.riskLevel==='red'?'badge-red': current.riskLevel==='yellow'?'badge-yellow':'badge-green'; 
  
  return <Panel aria-label="Painel de condições atuais" style={{transition: 'all 0.3s ease'}}> 
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}> 
      <div style={{display:'flex',alignItems:'center',gap:12}}> 
        <span aria-hidden style={{fontSize:32, transition: 'transform 0.3s ease'}}>{pickIcon(current)}</span> 
        <div> 
          <div style={{fontSize:32,fontWeight:700, transition: 'color 0.3s ease'}}>{current.temperature.toFixed(1)}°C</div> 
          <div style={{fontSize:12,color:'#cbd5e1'}}>{formatBRDateTime(current.timestamp)}</div> 
        </div> 
      </div> 
      <Badge className={`badge ${badgeClass}`} aria-label="Nível de risco" style={{transition: 'all 0.3s ease'}}>
        {current.riskLevel==='red'?<FaExclamationTriangle style={{marginRight:4}}/>: 
         current.riskLevel==='yellow'?<FaCloudRain style={{marginRight:4}}/>: 
         <FaCheckCircle style={{marginRight:4}}/>}
        {current.riskLevel==='red'?'Risco alto': current.riskLevel==='yellow'?'Risco moderado':'Baixo risco'}
      </Badge> 
    </div> 
    <p style={{margin:'12px 0',color:'#cbd5e1', fontSize:14, lineHeight:1.4}}>{current.description}</p> 
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}> 
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#0f172a',borderRadius:8,padding:8, transition: 'background 0.3s ease'}}> 
        <span style={{color:'#cbd5e1',fontSize:12}}><span style={{marginRight:4}}>💧</span>Precipitação</span> 
        <span style={{fontWeight:700}}>{current.precipitation.toFixed(1)} mm</span> 
      </div> 
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#0f172a',borderRadius:8,padding:8, transition: 'background 0.3s ease'}}> 
        <span style={{color:'#cbd5e1',fontSize:12}}><span style={{marginRight:4}}>💨</span>Umidade</span> 
        <span style={{fontWeight:700}}>{current.humidity}%</span> 
      </div> 
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',background:'#0f172a',borderRadius:8,padding:8, transition: 'background 0.3s ease'}}> 
        <span style={{color:'#cbd5e1',fontSize:12}}><span style={{marginRight:4}}>🌬️</span>Vento</span> 
        <span style={{fontWeight:700}}>{current.windSpeed.toFixed(1)} km/h</span> 
      </div> 
    </div> 
    <Panel aria-label="Indicador de risco" style={{marginTop:12, background:'#0f172a', borderRadius:8, padding:8}}> 
      <Traffic> 
        <Light style={{ background:'#dc2626', opacity: ui.trafficIndex===0?1:.35, transition: 'opacity 0.3s ease' }} /> 
        <Light style={{ background:'#f59e0b', opacity: ui.trafficIndex===1?1:.35, transition: 'opacity 0.3s ease' }} /> 
        <Light style={{ background:'#10b981', opacity: ui.trafficIndex===2?1:.35, transition: 'opacity 0.3s ease' }} /> 
      </Traffic> 
      <div style={{marginTop:8, fontSize:13}}>
        <strong style={{color: current.riskLevel==='red'?'#dc2626': current.riskLevel==='yellow'?'#f59e0b':'#10b981'}}>
          {current.riskLevel==='red'?'Risco alto': current.riskLevel==='yellow'?'Risco moderado':'Baixo risco'}
        </strong> 
        <span style={{marginLeft:6,color:'#cbd5e1'}}>{current.description}</span>
      </div> 
    </Panel> 
    <Panel aria-label="Legenda de zonas de risco" style={{marginTop:12}}> 
      <h2 style={{margin:0,marginBottom:8,fontSize:14,color:'#cbd5e1', display:'flex',alignItems:'center'}}>
        <span style={{marginRight:6}}>🗺️</span>Legenda
      </h2> 
      <LegendRow><Dot style={{background:'#dc2626', transition: 'transform 0.2s ease'}}/> Alto risco (vermelho)</LegendRow> 
      <LegendRow><Dot style={{background:'#f59e0b', transition: 'transform 0.2s ease'}}/> Risco moderado (amarelo)</LegendRow> 
      <LegendRow><Dot style={{background:'#10b981', transition: 'transform 0.2s ease'}}/> Baixo risco (verde)</LegendRow> 
    </Panel> 
  </Panel>
}

function Forecast(){ 
  const forecast = useSelector(s=>s.weather.forecast); 
  const [currentPage, setCurrentPage] = useState(0); 
  const itemsPerPage = 6; 
  const totalPages = Math.ceil(forecast.length / itemsPerPage); 
  
  const paginatedForecast = forecast.slice( 
    currentPage * itemsPerPage, 
    (currentPage + 1) * itemsPerPage 
  ); 
  
  const handleSwipe = (direction) => { 
    if (direction === 'left' && currentPage < totalPages - 1) { 
      setCurrentPage(currentPage + 1); 
    } else if (direction === 'right' && currentPage > 0) { 
      setCurrentPage(currentPage - 1); 
    } 
  }; 
  
  const handleKeyDown = (e) => { 
    if (e.key === 'ArrowLeft') handleSwipe('right'); 
    if (e.key === 'ArrowRight') handleSwipe('left'); 
  }; 
  
  return <Panel aria-label="Previsão de 24 horas"> 
    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
      <h2 style={{margin:0,fontSize:14,color:'#cbd5e1'}}>Previsão 24h</h2>
      {totalPages > 1 && (
        <div style={{display:'flex', gap:4, fontSize:12, color:'#cbd5e1'}}>
          <span>{currentPage + 1} / {totalPages}</span>
        </div>
      )}
    </div>
    
    <div 
      style={{display:'grid',gridAutoFlow:'column',gridAutoColumns:'minmax(140px,1fr)',gap:8,overflowX:'auto',paddingBottom:6}} 
      tabIndex={0} 
      aria-label="Lista de horas previstas"
      onKeyDown={handleKeyDown}
    > 
      {paginatedForecast.map((f,i)=> (
        <div 
          key={i} 
          role="article" 
          style={{
            background:'#0f172a',
            border:'1px solid #374151',
            borderRadius:10,
            padding:8,
            minWidth:140,
            display:'flex',
            flexDirection:'column',
            gap:6,
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        > 
          <div style={{fontWeight:700,fontSize:13}}>{formatBRDateTime(f.time).slice(11)}</div> 
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}> 
            <span style={{fontSize:16}}>{f.risk==='red'?'⛈': f.precip>=1?'🌧': f.risk==='yellow'?'🌦':'☀'}</span> 
            <strong>{f.temp.toFixed(1)}°C</strong> 
          </div> 
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}> 
            <span>{`💧 ${f.precip.toFixed(1)} mm`}</span> 
            <span className={`mini-risk ${f.risk==='red'?'risk-red': f.risk==='yellow'?'risk-yellow':'risk-green'}`}>
              {riskLabelPT(f.risk)}
            </span> 
          </div> 
        </div>
      ))} 
    </div> 
    
    {totalPages > 1 && (
      <div style={{display:'flex', justifyContent:'center', gap:8, marginTop:12}}>
        <button 
          onClick={() => handleSwipe('right')}
          disabled={currentPage === 0}
          style={{
            padding: '6px 12px',
            background: currentPage === 0 ? '#374151' : '#111827',
            border: '1px solid #374151',
            borderRadius: 6,
            color: '#f9fafb',
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
            fontSize: 12,
            transition: 'all 0.2s ease'
          }}
          aria-label="Página anterior"
        >
          ← Anterior
        </button>
        <button 
          onClick={() => handleSwipe('left')}
          disabled={currentPage === totalPages - 1}
          style={{
            padding: '6px 12px',
            background: currentPage === totalPages - 1 ? '#374151' : '#111827',
            border: '1px solid #374151',
            borderRadius: 6,
            color: '#f9fafb',
            cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
            fontSize: 12,
            transition: 'all 0.2s ease'
          }}
          aria-label="Próxima página"
        >
          Próxima →
        </button>
      </div>
    )}
  </Panel>
}

function ZoneControls(){ 
  const [visibleLayers, setVisibleLayers] = useState({ red: true, yellow: true, green: true }); 
  const dispatch = useDispatch(); 
  
  const toggleLayer = (layer) => {
    const newVisibility = { ...visibleLayers, [layer]: !visibleLayers[layer] };
    setVisibleLayers(newVisibility);
    dispatch(actions.ui.setZoneLayers(newVisibility));
  };
  
  const handleKeyDown = (e, layer) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleLayer(layer);
    }
  };
  
  return <Panel aria-label="Controle de camadas de zonas de risco" style={{marginBottom:12}}>
    <h3 style={{margin:'0 0 12px 0',fontSize:14,color:'#cbd5e1', display:'flex', alignItems:'center'}}>
      <span style={{marginRight:6}}>🗺️</span>Camadas de Risco
    </h3>
    <div style={{display:'flex',flexDirection:'column',gap:8}} role="group" aria-label="Controles de visibilidade das zonas">
      <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s ease'}}
             onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <input 
          type="checkbox" 
          checked={visibleLayers.red} 
          onChange={()=>toggleLayer('red')} 
          style={{accentColor:'#dc2626', width: '16px', height: '16px'}} 
          aria-label="Mostrar zonas de alto risco"
        />
        <Dot style={{background:'#dc2626', flexShrink: 0}} />
        <span style={{fontSize:13, fontWeight: visibleLayers.red ? '600' : '400'}}>Zonas de Alto Risco</span>
      </label>
      <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s ease'}}
             onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <input 
          type="checkbox" 
          checked={visibleLayers.yellow} 
          onChange={()=>toggleLayer('yellow')} 
          style={{accentColor:'#f59e0b', width: '16px', height: '16px'}} 
          aria-label="Mostrar zonas de risco moderado"
        />
        <Dot style={{background:'#f59e0b', flexShrink: 0}} />
        <span style={{fontSize:13, fontWeight: visibleLayers.yellow ? '600' : '400'}}>Zonas de Risco Moderado</span>
      </label>
      <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer', padding: '4px', borderRadius: '4px', transition: 'background 0.2s ease'}}
             onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
             onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
        <input 
          type="checkbox" 
          checked={visibleLayers.green} 
          onChange={()=>toggleLayer('green')} 
          style={{accentColor:'#10b981', width: '16px', height: '16px'}} 
          aria-label="Mostrar zonas de baixo risco"
        />
        <Dot style={{background:'#10b981', flexShrink: 0}} />
        <span style={{fontSize:13, fontWeight: visibleLayers.green ? '600' : '400'}}>Zonas de Baixo Risco</span>
      </label>
    </div>
    <div style={{marginTop:12, paddingTop:8, borderTop:'1px solid #374151', fontSize:11, color:'#9ca3af'}}>
      <p style={{margin:0}}>💡 Dica: Use as setas do teclado para navegar na previsão</p>
    </div>
  </Panel>;
}

export default function App(){ 
  const dispatch = useDispatch(); 
  const [skipLinkVisible, setSkipLinkVisible] = useState(false);
  
  useEffect(()=>{ 
    const chunk1=[ { time:'2025-11-30 07:00', temp:19.9, precip:0.0, risk:'green' }, { time:'2025-11-30 08:00', temp:19.7, precip:0.0, risk:'green' }, { time:'2025-11-30 09:00', temp:20.5, precip:0.0, risk:'green' }, { time:'2025-11-30 10:00', temp:22.1, precip:0.0, risk:'green' } ]; 
    const chunk2=[ { time:'2025-11-30 11:00', temp:24.0, precip:0.0, risk:'green' }, { time:'2025-11-30 12:00', temp:25.1, precip:0.0, risk:'green' }, { time:'2025-11-30 13:00', temp:26.3, precip:0.0, risk:'green' }, { time:'2025-11-30 14:00', temp:27.4, precip:0.0, risk:'green' } ]; 
    const chunk3=[ { time:'2025-11-30 15:00', temp:28.0, precip:0.1, risk:'green' }, { time:'2025-11-30 16:00', temp:28.8, precip:0.1, risk:'green' }, { time:'2025-11-30 17:00', temp:29.2, precip:0.2, risk:'green' }, { time:'2025-11-30 18:00', temp:29.6, precip:0.2, risk:'green' } ]; 
    const chunk4=[ { time:'2025-11-30 19:00', temp:28.4, precip:0.3, risk:'yellow' }, { time:'2025-11-30 20:00', temp:27.2, precip:0.5, risk:'yellow' }, { time:'2025-11-30 21:00', temp:25.9, precip:0.6, risk:'yellow' }, { time:'2025-11-30 22:00', temp:24.4, precip:0.7, risk:'yellow' }, { time:'2025-11-30 23:00', temp:23.3, precip:0.8, risk:'yellow' }, { time:'2025-12-01 00:00', temp:22.2, precip:0.9, risk:'yellow' }, { time:'2025-12-01 01:00', temp:21.7, precip:1.2, risk:'red' }, { time:'2025-12-01 02:00', temp:21.5, precip:1.5, risk:'red' } ]; 
    dispatch(actions.weather.setForecast([])); 
    setTimeout(()=>dispatch(actions.weather.addForecastChunk(chunk1)),200); 
    setTimeout(()=>dispatch(actions.weather.addForecastChunk(chunk2)),400); 
    setTimeout(()=>dispatch(actions.weather.addForecastChunk(chunk3)),600); 
    setTimeout(()=>dispatch(actions.weather.addForecastChunk(chunk4)),800); 
  },[]); 
  
  return <>
    <Global/>
    {/* Skip link for keyboard navigation */}
    <a 
      href="#main-content" 
      style={{
        position: 'absolute',
        top: skipLinkVisible ? '8px' : '-40px',
        left: '8px',
        background: '#60a5fa',
        color: '#111827',
        padding: '8px 12px',
        borderRadius: '6px',
        textDecoration: 'none',
        fontWeight: '600',
        zIndex: 9999,
        transition: 'top 0.3s ease',
        fontSize: '14px'
      }}
      onFocus={() => setSkipLinkVisible(true)}
      onBlur={() => setSkipLinkVisible(false)}
      aria-label="Pular para o conteúdo principal"
    >
      🎯 Ir para conteúdo principal
    </a>
    
    <Header role="banner" aria-label="Cabeçalho SIGATC - Sistema de Informações Geográficas de Alerta de Tempo e Clima"> 
      <Title>SIGATC • Goiânia, GO</Title> 
      <Controls/> 
    </Header>
    
    <Layout role="main" id="main-content" aria-label="Conteúdo principal do SIGATC"> 
      <section style={{gridColumn:'1',gridRow:'1'}} aria-label="Painel de controle e informações"> 
        <ZoneControls/> 
        <Dashboard/> 
      </section> 
      <MapWrap style={{gridColumn:'2',gridRow:'1'}} aria-label="Mapa interativo de zonas de risco"> 
        <MapView/> 
      </MapWrap> 
      <aside style={{gridColumn:'3',gridRow:'1'}} aria-label="Previsão do tempo"> 
        <Forecast/> 
      </aside> 
    </Layout>
    
    <footer style={{padding:'12px 16px',textAlign:'center',color:'#cbd5e1', fontSize:'12px'}} role="contentinfo"> 
      <small>
        Dados demonstrativos • Interface em Português do Brasil • © SIGATC • 
        <span style={{marginLeft:8}}>🌐 Desenvolvido com acessibilidade WCAG 2.1 AA</span>
      </small> 
    </footer>
  </>
}
